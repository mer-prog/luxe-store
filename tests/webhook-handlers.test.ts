import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

vi.mock("@/lib/prisma", () => {
  const tx = {
    product: { update: vi.fn() },
    order: { update: vi.fn() },
  };
  return {
    prisma: {
      order: { findUnique: vi.fn(), update: vi.fn() },
      cart: { findUnique: vi.fn() },
      cartItem: { deleteMany: vi.fn() },
      shippingAddress: { upsert: vi.fn() },
      $transaction: vi.fn(),
      __tx: tx,
    },
  };
});

vi.mock("@/lib/stripe", () => {
  const stripe = {
    webhooks: { constructEvent: vi.fn() },
    checkout: { sessions: { retrieve: vi.fn(), list: vi.fn() } },
  };
  return { getStripe: () => stripe };
});

vi.mock("@/lib/resend", () => ({
  getResend: () => ({ emails: { send: vi.fn() } }),
}));

const mockPrisma = prisma as unknown as {
  order: { findUnique: Mock; update: Mock };
  cart: { findUnique: Mock };
  cartItem: { deleteMany: Mock };
  shippingAddress: { upsert: Mock };
  $transaction: Mock;
  __tx: {
    product: { update: Mock };
    order: { update: Mock };
  };
};
const tx = mockPrisma.__tx;
const stripeMock = getStripe() as unknown as {
  webhooks: { constructEvent: Mock };
  checkout: { sessions: { retrieve: Mock; list: Mock } };
};

function dispatch(event: { type: string; data: { object: unknown } }) {
  stripeMock.webhooks.constructEvent.mockReturnValue(event);
  return POST(
    new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "t=1,v1=valid" },
    })
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.RESEND_API_KEY; // keep the email branch inert
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  mockPrisma.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) =>
    fn(tx)
  );
  mockPrisma.order.update.mockResolvedValue({});
  mockPrisma.cart.findUnique.mockResolvedValue(null);
  mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
  mockPrisma.shippingAddress.upsert.mockResolvedValue({});
  tx.product.update.mockResolvedValue({});
  tx.order.update.mockResolvedValue({});
  stripeMock.checkout.sessions.retrieve.mockResolvedValue({
    id: "cs_1",
    collected_information: null,
  });
});

describe("checkout.session.completed", () => {
  const completedEvent = () => ({
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_1",
        payment_intent: "pi_1",
        metadata: { orderId: "order_1", userId: "user_1" },
      },
    },
  });

  it("confirms the order and marks it PAID with the PaymentIntent id", async () => {
    mockPrisma.order.findUnique
      .mockResolvedValueOnce({ id: "order_1", paymentStatus: "PENDING" })
      .mockResolvedValueOnce(null); // email lookup

    const res = await dispatch(completedEvent());

    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        stripePaymentId: "pi_1",
      },
    });
    expect(res.status).toBe(200);
  });

  it("clears the customer's cart after a successful payment", async () => {
    mockPrisma.order.findUnique
      .mockResolvedValueOnce({ id: "order_1", paymentStatus: "PENDING" })
      .mockResolvedValueOnce(null);
    mockPrisma.cart.findUnique.mockResolvedValue({ id: "cart_1" });

    await dispatch(completedEvent());

    expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: "cart_1" },
    });
  });

  it("is idempotent: an already-PAID order is not processed again", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order_1",
      paymentStatus: "PAID",
    });

    const res = await dispatch(completedEvent());

    expect(mockPrisma.order.update).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.retrieve).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("ignores events without an orderId in metadata", async () => {
    const event = completedEvent();
    event.data.object.metadata = {} as never;

    const res = await dispatch(event);

    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("saves the shipping address collected by Stripe", async () => {
    mockPrisma.order.findUnique
      .mockResolvedValueOnce({ id: "order_1", paymentStatus: "PENDING" })
      .mockResolvedValueOnce(null);
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      id: "cs_1",
      collected_information: {
        shipping_details: {
          name: "Taro Yamada",
          address: {
            line1: "1 Main St",
            city: "Springfield",
            postal_code: "62701",
            country: "US",
          },
        },
      },
    });

    await dispatch(completedEvent());

    expect(mockPrisma.shippingAddress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: "order_1" },
        create: expect.objectContaining({
          name: "Taro Yamada",
          line1: "1 Main St",
          city: "Springfield",
          zip: "62701",
          country: "US",
        }),
      })
    );
  });
});

describe("checkout.session.expired — stock release", () => {
  const expiredEvent = () => ({
    type: "checkout.session.expired",
    data: {
      object: { id: "cs_1", metadata: { orderId: "order_1", userId: "user_1" } },
    },
  });

  it("restores stock for every item and cancels the order", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order_1",
      paymentStatus: "PENDING",
      items: [
        { productId: "prod_1", quantity: 2 },
        { productId: "prod_2", quantity: 1 },
      ],
    });

    const res = await dispatch(expiredEvent());

    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: "prod_1" },
      data: { stock: { increment: 2 } },
    });
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: "prod_2" },
      data: { stock: { increment: 1 } },
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { status: "CANCELLED", paymentStatus: "EXPIRED" },
    });
    expect(res.status).toBe(200);
  });

  it("does not restore stock when the order was already paid", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order_1",
      paymentStatus: "PAID",
      items: [{ productId: "prod_1", quantity: 2 }],
    });

    await dispatch(expiredEvent());

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(tx.product.update).not.toHaveBeenCalled();
  });
});

describe("payment_intent.payment_failed", () => {
  const failedEvent = () => ({
    type: "payment_intent.payment_failed",
    data: { object: { id: "pi_failed_1" } },
  });

  it("resolves the order via its Checkout Session and marks it FAILED", async () => {
    stripeMock.checkout.sessions.list.mockResolvedValue({
      data: [{ id: "cs_1", metadata: { orderId: "order_1" } }],
    });
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order_1",
      paymentStatus: "PENDING",
    });

    const res = await dispatch(failedEvent());

    expect(stripeMock.checkout.sessions.list).toHaveBeenCalledWith({
      payment_intent: "pi_failed_1",
      limit: 1,
    });
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { paymentStatus: "FAILED" },
    });
    expect(res.status).toBe(200);
  });

  it("does nothing when no Checkout Session matches the PaymentIntent", async () => {
    stripeMock.checkout.sessions.list.mockResolvedValue({ data: [] });

    const res = await dispatch(failedEvent());

    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("never downgrades a PAID order to FAILED", async () => {
    stripeMock.checkout.sessions.list.mockResolvedValue({
      data: [{ id: "cs_1", metadata: { orderId: "order_1" } }],
    });
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order_1",
      paymentStatus: "PAID",
    });

    await dispatch(failedEvent());

    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });
});
