"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  return (session.user as Record<string, unknown>).id as string;
}

export async function getCart() {
  const userId = await getUserId();

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { id: "asc" },
      },
    },
  });

  return cart;
}

export async function addToCart(productId: string, size: string, quantity: number = 1) {
  const userId = await getUserId();

  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_size: {
        cartId: cart.id,
        productId,
        size,
      },
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        size,
        quantity,
      },
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const userId = await getUserId();

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new Error("Cart item not found");
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeCartItem(cartItemId: string) {
  const userId = await getUserId();

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new Error("Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  revalidatePath("/cart");
  return { success: true };
}

export async function getCartCount() {
  try {
    const session = await auth();
    if (!session?.user) return 0;
    const userId = (session.user as Record<string, unknown>).id as string;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  } catch {
    return 0;
  }
}
