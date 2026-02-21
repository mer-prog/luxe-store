import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProductWithCategory } from "@/types";

export function ProductInfo({ product }: { product: ProductWithCategory }) {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          {product.category.name}
        </Badge>
        <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      <p className="leading-relaxed text-muted-foreground">{product.description}</p>

      <div className="text-sm text-muted-foreground">
        {product.stock > 0 ? (
          <span className="text-green-600">In stock ({product.stock} available)</span>
        ) : (
          <span className="text-red-600">Out of stock</span>
        )}
      </div>
    </div>
  );
}
