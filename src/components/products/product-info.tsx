import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getTranslations, getLocale } from "next-intl/server";
import type { ProductWithCategory } from "@/types";

export async function ProductInfo({ product }: { product: ProductWithCategory }) {
  const t = await getTranslations("products");
  const locale = await getLocale();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          {product.category.name}
        </Badge>
        <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold">{formatPrice(product.price, locale)}</span>
        {product.compareAtPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compareAtPrice, locale)}
          </span>
        )}
      </div>

      <p className="leading-relaxed text-muted-foreground">{product.description}</p>

      <div className="text-sm text-muted-foreground">
        {product.stock > 0 ? (
          <span className="text-green-600">{t("inStock", { count: product.stock })}</span>
        ) : (
          <span className="text-red-600">{t("outOfStock")}</span>
        )}
      </div>
    </div>
  );
}
