export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/admin/product-table";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <ProductTable products={products} categories={categories} />
    </div>
  );
}
