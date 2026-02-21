"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function createReview(productId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.review.create({
    data: {
      userId,
      productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  revalidatePath(`/products/${productId}`);
  return { success: true };
}
