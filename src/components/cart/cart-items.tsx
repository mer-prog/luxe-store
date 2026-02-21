"use client";

import { CartItemRow } from "./cart-item-row";
import { Separator } from "@/components/ui/separator";
import type { CartWithItems } from "@/types";

export function CartItems({ cart }: { cart: CartWithItems }) {
  return (
    <div className="divide-y">
      {cart.items.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
