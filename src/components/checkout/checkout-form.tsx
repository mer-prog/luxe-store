"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/constants";
import { Lock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { CartWithItems } from "@/types";

export function CheckoutForm({ cart }: { cart: CartWithItems }) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale();
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
        setError(data.error || t("somethingWentWrong"));
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError(t("failedToConnect"));
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6">
        <h2 className="font-serif text-2xl">{t("payment")}</h2>

        <p className="text-muted-foreground">
          {t("stripeRedirect")}
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
          {loading ? t("redirecting") : t("proceedToPayment")}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t("securePayment")}
        </p>
      </div>

      <div className="rounded-lg border bg-neutral-50 p-6">
        <h2 className="font-serif text-lg">{t("orderSummary")}</h2>

        <div className="mt-6 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} ({item.size}) x{item.quantity}
              </span>
              <span>{formatPrice(item.product.price * item.quantity, locale)}</span>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tCart("subtotal")}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tCart("tax")}</span>
            <span>{formatPrice(tax, locale)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tCart("shipping")}</span>
            <span className="text-green-600">{tCart("free")}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-semibold">
            <span>{tCart("total")}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
