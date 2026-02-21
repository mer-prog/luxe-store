"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/constants";
import { placeOrder } from "@/lib/actions/checkout";
import type { CartWithItems } from "@/types";

export function CheckoutForm({ cart }: { cart: CartWithItems }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    const result = await placeOrder(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/checkout?success=true&orderId=${result.orderId}`);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form action={handleSubmit} className="space-y-6">
        <h2 className="font-serif text-2xl">Shipping Information</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shippingAddress">Address</Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              placeholder="123 Main Street"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shippingCity">City</Label>
              <Input
                id="shippingCity"
                name="shippingCity"
                placeholder="New York"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="shippingZip">ZIP Code</Label>
              <Input
                id="shippingZip"
                name="shippingZip"
                placeholder="10001"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shippingCountry">Country</Label>
            <Input
              id="shippingCountry"
              name="shippingCountry"
              placeholder="United States"
              required
              className="mt-1"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 uppercase tracking-wider"
          size="lg"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </Button>
      </form>

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
