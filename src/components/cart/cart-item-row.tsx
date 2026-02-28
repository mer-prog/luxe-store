"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { updateCartItem, removeCartItem } from "@/lib/actions/cart";
import { useTranslations, useLocale } from "next-intl";
import type { CartItem, Product } from "@/types";

type CartItemWithProduct = CartItem & { product: Product };

export function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    setLoading(true);
    try {
      await updateCartItem(item.id, newQuantity);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeCartItem(item.id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 py-6">
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-neutral-100">
        <PlaceholderImage
          src={item.product.images[0] || "/images/products/product-01.jpg"}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium">{item.product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("sizeLabel", { size: item.size })}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRemove}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={loading}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <span className="text-sm font-semibold">
            {formatPrice(item.product.price * item.quantity, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
