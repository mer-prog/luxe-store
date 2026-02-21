"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if ((session.user as Record<string, unknown>).role !== "ADMIN") {
    throw new Error("Not authorized");
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  return { success: true };
}
