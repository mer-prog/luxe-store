import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/order-number";
import { TAX_RATE } from "@/lib/constants";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Validate stock
  const outOfStock = cart.items.filter(
    (item) => item.product.stock < item.quantity
  );
  if (outOfStock.length > 0) {
    return NextResponse.json(
      {
        error: "Some items are out of stock",
        items: outOfStock.map((item) => ({
          name: item.product.name,
          requested: item.quantity,
          available: item.product.stock,
        })),
      },
      { status: 400 }
    );
  }

  const orderNumber = await generateOrderNumber();

  // Calculate totals (prices are in cents)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // Create order with optimistic stock lock
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock with optimistic lock
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`Out of stock: ${item.product.name}`);
      }
    }

    // Create order
    return tx.order.create({
      data: {
        orderNumber,
        userId,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  });

  // Create Stripe Checkout Session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        ...(item.size ? { description: `Size: ${item.size}` } : {}),
        ...(item.product.images[0]
          ? { images: [`${appUrl}${item.product.images[0]}`] }
          : {}),
      },
      unit_amount: item.price, // Already in cents
    },
    quantity: item.quantity,
  }));

  // Add tax as a separate line item
  if (tax > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax (10%)",
        },
        unit_amount: tax,
      },
      quantity: 1,
    });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB"],
    },
    metadata: {
      orderId: order.id,
      userId,
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  // Save Stripe session ID to order
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
