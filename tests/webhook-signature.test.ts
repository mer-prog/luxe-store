import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn(), update: vi.fn() },
    cart: { findUnique: vi.fn() },
    cartItem: { deleteMany: vi.fn() },
    shippingAddress: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

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

const mockPrisma = prisma as unknown as { order: { findUnique: Mock } };
const mockConstructEvent = getStripe().webhooks.constructEvent as unknown as Mock;

const WEBHOOK_URL = "http://localhost:3000/api/webhooks/stripe";
const ORIGINAL_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function webhookRequest(body: string, signature?: string) {
  return new Request(WEBHOOK_URL, {
    method: "POST",
    body,
    headers: signature ? { "stripe-signature": signature } : {},
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  } else {
    process.env.STRIPE_WEBHOOK_SECRET = ORIGINAL_SECRET;
  }
});

describe("POST /api/webhooks/stripe — signature verification", () => {
  it("returns 400 when the stripe-signature header is missing", async () => {
    const res = await POST(webhookRequest("{}"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Missing signature");
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const res = await POST(webhookRequest("{}", "t=1,v1=bad"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Webhook signature verification failed");
    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled();
  });

  it("verifies against the raw body, the header signature and the webhook secret", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: {} },
    });

    await POST(webhookRequest("raw-payload", "t=1,v1=good"));

    expect(mockConstructEvent).toHaveBeenCalledWith(
      "raw-payload",
      "t=1,v1=good",
      "whsec_test_secret"
    );
  });

  it("acknowledges verified events of unhandled types without touching the DB", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: {} },
    });

    const res = await POST(webhookRequest("{}", "t=1,v1=good"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled();
  });
});
