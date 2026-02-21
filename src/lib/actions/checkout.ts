"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TAX_RATE } from "@/lib/constants";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, "Address is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingZip: z.string().min(1, "ZIP code is required"),
  shippingCountry: z.string().min(1, "Country is required"),
});

export async function placeOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  const parsed = checkoutSchema.safeParse({
    shippingAddress: formData.get("shippingAddress"),
    shippingCity: formData.get("shippingCity"),
    shippingZip: formData.get("shippingZip"),
    shippingCountry: formData.get("shippingCountry"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "Cart is empty" };
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
      shippingZip: parsed.data.shippingZip,
      shippingCountry: parsed.data.shippingCountry,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
  });

  // Clear the cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  revalidatePath("/cart");
  revalidatePath("/orders");

  return { success: true, orderId: order.id };
}
