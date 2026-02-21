import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/constants";
import type { CartWithItems } from "@/types";

export function CartSummary({ cart }: { cart: CartWithItems }) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="rounded-lg border bg-neutral-50 p-6">
      <h2 className="font-serif text-lg">Order Summary</h2>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Button asChild className="mt-6 w-full h-12 uppercase tracking-wider" size="lg">
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>
    </div>
  );
}
