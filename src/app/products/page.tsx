export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { getCartCount } from "@/lib/actions/cart";
import type { Prisma } from "@prisma/client";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { category, sort, search } = params;

  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };

  const [products, categories, cartCount] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getCartCount(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <h1 className="font-serif text-4xl">
            {category
              ? categories.find((c) => c.slug === category)?.name || "Products"
              : search
              ? `Search: "${search}"`
              : "All Products"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>

          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
