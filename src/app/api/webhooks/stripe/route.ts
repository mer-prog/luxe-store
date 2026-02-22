import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getResend } from "@/lib/resend";
import { formatPrice } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Invalid signature: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  // Idempotency: skip if already processed
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing || existing.paymentStatus === "PAID") return;

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      stripePaymentId: session.payment_intent as string,
    },
  });

  // Retrieve the full session to get shipping details
  const fullSession = await getStripe().checkout.sessions.retrieve(session.id);
  const shippingDetails = fullSession.collected_information?.shipping_details;

  // Save shipping address from Stripe
  if (shippingDetails?.address) {
    const addr = shippingDetails.address;
    await prisma.shippingAddress.upsert({
      where: { orderId },
      create: {
        orderId,
        name: shippingDetails.name || "",
        line1: addr.line1 || "",
        line2: addr.line2 || undefined,
        city: addr.city || "",
        state: addr.state || undefined,
        zip: addr.postal_code || "",
        country: addr.country || "",
      },
      update: {},
    });

    // Backfill legacy shipping fields for backward compatibility
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingAddress: addr.line1 || "",
        shippingCity: addr.city || "",
        shippingZip: addr.postal_code || "",
        shippingCountry: addr.country || "",
      },
    });
  }

  // Clear user's cart
  const userId = session.metadata?.userId;
  if (userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  // Send confirmation email (best-effort)
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    if (order?.user?.email && process.env.RESEND_API_KEY) {
      const itemsList = order.items
        .map(
          (item) =>
            `${item.product.name} (${item.size}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
        )
        .join("\n");

      await getResend().emails.send({
        from: "LUXE Store <onboarding@resend.dev>",
        to: order.user.email,
        subject: `Order Confirmed - ${order.orderNumber}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000; border-bottom: 2px solid #C9A96E; padding-bottom: 16px;">
              LUXE
            </h1>
            <h2>Order Confirmed</h2>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <hr style="border: 1px solid #eee;" />
            <h3>Items</h3>
            <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>
            <hr style="border: 1px solid #eee;" />
            <p style="font-size: 18px;"><strong>Total: ${formatPrice(order.total)}</strong></p>
            <p style="color: #666; font-size: 14px;">
              This is a test order from LUXE Store (Stripe Test Mode).
            </p>
          </div>
        `,
      });
    }
  } catch {
    // Email failure should not break the webhook
    console.error("Failed to send order confirmation email");
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.paymentStatus === "PAID") return;

  // Restore stock and cancel order
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", paymentStatus: "EXPIRED" },
    });
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Find order by stripe payment ID
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (order && order.paymentStatus !== "PAID") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });
  }
}
