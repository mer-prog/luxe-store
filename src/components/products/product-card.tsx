import Link from "next/link";
import { PlaceholderImage } from "@/components/placeholder-image";
import { formatPrice } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import type { Product } from "@/types";

export async function ProductCard({ product, locale }: { product: Product; locale: string }) {
  const t = await getTranslations("products");

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <PlaceholderImage
          src={product.images[0] || "/images/products/product-01.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.compareAtPrice && (
          <span className="absolute left-3 top-3 bg-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
            {t("sale")}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-sans text-sm font-medium tracking-wide">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price, locale)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
