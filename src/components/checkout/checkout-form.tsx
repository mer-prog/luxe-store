"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/constants";
import { Lock } from "lucide-react";
import type { CartWithItems } from "@/types";

export function CheckoutForm({ cart }: { cart: CartWithItems }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Failed to connect to payment service");
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6">
        <h2 className="font-serif text-2xl">Payment</h2>

        <p className="text-muted-foreground">
          You will be redirected to Stripe to securely complete your payment and
          enter shipping details.
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full h-12 uppercase tracking-wider"
          size="lg"
        >
          <Lock className="mr-2 h-4 w-4" />
          {loading ? "Redirecting..." : "Proceed to Payment"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Payments are processed securely by Stripe
        </p>
      </div>

      <div className="rounded-lg border bg-neutral-50 p-6">
        <h2 className="font-serif text-lg">Order Summary</h2>

        <div className="mt-6 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} ({item.size}) x{item.quantity}
              </span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}

          <Separator />

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

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
