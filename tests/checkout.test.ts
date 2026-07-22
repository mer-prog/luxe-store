import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { POST } from "@/app/api/checkout/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    product: { updateMany: vi.fn(), update: vi.fn() },
    order: { create: vi.fn(), update: vi.fn() },
  };
  return {
    prisma: {
      cart: { findUnique: vi.fn() },
      order: { update: vi.fn() },
      $transaction: vi.fn(),
      __tx: tx,
    },
  };
});

vi.mock("@/lib/stripe", () => {
  const stripe = {
    checkout: { sessions: { create: vi.fn() } },
  };
  return { getStripe: () => stripe };
});

vi.mock("@/lib/order-number", () => ({
  generateOrderNumber: vi.fn(async () => "LUXE-20260722-001"),
}));

const mockAuth = auth as unknown as Mock;
const mockPrisma = prisma as unknown as {
  cart: { findUnique: Mock };
  order: { update: Mock };
  $transaction: Mock;
  __tx: {
    product: { updateMany: Mock; update: Mock };
    order: { create: Mock; update: Mock };
  };
};
const tx = mockPrisma.__tx;
const mockSessionsCreate = getStripe().checkout.sessions.create as unknown as Mock;

function cartFixture() {
  return {
    id: "cart_1",
    userId: "user_1",
    items: [
      {
        id: "ci_1",
        productId: "prod_1",
        size: "M",
        quantity: 2,
        product: {
          id: "prod_1",
          name: "Silk Blazer",
          price: 28900,
          stock: 5,
          images: ["/images/products/blazer.jpg"],
        },
      },
      {
        id: "ci_2",
        productId: "prod_2",
        size: "L",
        quantity: 1,
        product: {
          id: "prod_2",
          name: "Cashmere Coat",
          price: 89000,
          stock: 3,
          images: [],
        },
      },
    ],
  };
}

// subtotal = 28900 * 2 + 89000 = 146800, tax (10%) = 14680, total = 161480
const EXPECTED_TAX = 14680;
const EXPECTED_TOTAL = 161480;

const orderFixture = () => ({
  id: "order_1",
  items: cartFixture().items.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
    price: item.product.price,
    product: item.product,
  })),
});

beforeEach(() => {
  vi.resetAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "user_1" } });
  mockPrisma.cart.findUnique.mockResolvedValue(cartFixture());
  mockPrisma.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) =>
    fn(tx)
  );
  tx.product.updateMany.mockResolvedValue({ count: 1 });
  tx.product.update.mockResolvedValue({});
  tx.order.create.mockResolvedValue(orderFixture());
  tx.order.update.mockResolvedValue({});
  mockPrisma.order.update.mockResolvedValue({});
  mockSessionsCreate.mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/c/pay/cs_test_123",
  });
});

describe("POST /api/checkout — stock reservation", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST();

    expect(res.status).toBe(401);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns 400 when the cart is empty", async () => {
    mockPrisma.cart.findUnique.mockResolvedValue(null);

    const res = await POST();

    expect(res.status).toBe(400);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects the checkout up front when requested quantity exceeds stock", async () => {
    const cart = cartFixture();
    cart.items[0].product.stock = 1; // requested quantity is 2
    mockPrisma.cart.findUnique.mockResolvedValue(cart);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.items).toEqual([
      { name: "Silk Blazer", requested: 2, available: 1 },
    ]);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("reserves stock with a conditional decrement and creates a PENDING order", async () => {
    const res = await POST();

    expect(tx.product.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: "prod_1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(tx.product.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: "prod_2", stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          paymentStatus: "PENDING",
          total: EXPECTED_TOTAL,
        }),
      })
    );
    expect(res.status).toBe(200);
  });

  it("aborts the transaction when stock was taken concurrently (optimistic lock)", async () => {
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(POST()).rejects.toThrow(/Out of stock/);
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("adds tax as a separate line item and persists the Stripe session id", async () => {
    const res = await POST();
    const body = await res.json();

    const createArgs = mockSessionsCreate.mock.calls[0][0];
    expect(createArgs.line_items).toHaveLength(3); // 2 products + tax
    expect(createArgs.line_items[2].price_data.unit_amount).toBe(EXPECTED_TAX);
    expect(createArgs.metadata).toEqual({ orderId: "order_1", userId: "user_1" });
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { stripeSessionId: "cs_test_123" },
    });
    expect(body.url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
  });
});

describe("POST /api/checkout — compensation on Stripe failure", () => {
  it("releases reserved stock and cancels the order when session creation fails", async () => {
    mockSessionsCreate.mockRejectedValue(new Error("stripe unavailable"));

    const res = await POST();
    const body = await res.json();

    // Stock restored for every reserved item
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: "prod_1" },
      data: { stock: { increment: 2 } },
    });
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: "prod_2" },
      data: { stock: { increment: 1 } },
    });
    // Order cancelled, payment marked failed
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { status: "CANCELLED", paymentStatus: "FAILED" },
    });
    // No session id is persisted and the raw Stripe error is not leaked
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
    expect(res.status).toBe(502);
    expect(body.error).toBe("Failed to create checkout session");
  });
});
