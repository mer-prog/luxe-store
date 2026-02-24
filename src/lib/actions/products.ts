"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug is too long"),
  description: z.string().min(1, "Description is required").max(5000, "Description is too long"),
  price: z.coerce.number().positive("Price must be positive").max(99999999, "Price is too high"),
  compareAtPrice: z.coerce.number().positive().max(99999999).nullable().optional(),
  images: z.string().min(1, "At least one image is required").max(2000, "Too many images"),
  sizes: z.string().min(1, "At least one size is required").max(500, "Too many sizes"),
  categoryId: z.string().min(1, "Category is required").max(100),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative").max(999999, "Stock is too high"),
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

  const { images, sizes, compareAtPrice, price, ...rest } = parsed.data;

  await prisma.product.create({
    data: {
      ...rest,
      price: Math.round(price * 100),
      compareAtPrice: compareAtPrice ? Math.round(compareAtPrice * 100) : null,
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

  const { images, sizes, compareAtPrice, price, ...rest } = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      price: Math.round(price * 100),
      compareAtPrice: compareAtPrice ? Math.round(compareAtPrice * 100) : null,
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
