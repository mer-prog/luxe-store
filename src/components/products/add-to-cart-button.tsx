"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SizeSelector } from "./size-selector";
import { addToCart } from "@/lib/actions/cart";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  sizes: string[];
  stock: number;
}

export function AddToCartButton({ productId, sizes, stock }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      setMessage("Please select a size");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addToCart(productId, selectedSize);
      setMessage("Added to cart!");
      router.refresh();
    } catch {
      setMessage("Failed to add to cart");
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
        {stock === 0 ? "Out of Stock" : loading ? "Adding..." : "Add to Cart"}
      </Button>

      {message && (
        <p
          className={`text-sm ${
            message.includes("Added") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
