"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SizeSelector } from "./size-selector";
import { addToCart } from "@/lib/actions/cart";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

interface AddToCartButtonProps {
  productId: string;
  sizes: string[];
  stock: number;
}

export function AddToCartButton({ productId, sizes, stock }: AddToCartButtonProps) {
  const t = useTranslations("products");
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      setMessage(t("selectSize"));
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addToCart(productId, selectedSize);
      setMessage(t("addedToCart"));
      setIsSuccess(true);
      router.refresh();
    } catch {
      setMessage(t("failedToAdd"));
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SizeSelector
        sizes={sizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      <Button
        onClick={handleAddToCart}
        disabled={stock === 0 || loading}
        className="w-full h-12 text-sm uppercase tracking-wider"
        size="lg"
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        {stock === 0 ? t("outOfStockButton") : loading ? t("adding") : t("addToCart")}
      </Button>

      {message && (
        <p
          className={`text-sm ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
