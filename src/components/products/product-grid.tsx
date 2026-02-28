import { ProductCard } from "./product-card";
import { getTranslations } from "next-intl/server";
import type { Product } from "@/types";

export async function ProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  const t = await getTranslations("products");

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">{t("noProductsFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
