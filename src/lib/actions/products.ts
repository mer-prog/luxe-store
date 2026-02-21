"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  images: z.string().min(1, "At least one image is required"),
  sizes: z.string().min(1, "At least one size is required"),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  featured: z.boolean().optional().default(false),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if ((session.user as Record<string, unknown>).role !== "ADMIN") {
    throw new Error("Not authorized");
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    images: formData.get("images"),
    sizes: formData.get("sizes"),
    categoryId: formData.get("categoryId"),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { images, sizes, compareAtPrice, ...rest } = parsed.data;

  await prisma.product.create({
    data: {
      ...rest,
      compareAtPrice: compareAtPrice ?? null,
      images: images.split(",").map((s) => s.trim()),
      sizes: sizes.split(",").map((s) => s.trim()),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    images: formData.get("images"),
    sizes: formData.get("sizes"),
    categoryId: formData.get("categoryId"),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { images, sizes, compareAtPrice, ...rest } = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      compareAtPrice: compareAtPrice ?? null,
      images: images.split(",").map((s) => s.trim()),
      sizes: sizes.split(",").map((s) => s.trim()),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}
