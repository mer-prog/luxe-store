import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/constants";
import { getTranslations, getLocale } from "next-intl/server";
import type { CartWithItems } from "@/types";

export async function CartSummary({ cart }: { cart: CartWithItems }) {
  const t = await getTranslations("cart");
  const locale = await getLocale();

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="rounded-lg border bg-neutral-50 p-6">
      <h2 className="font-serif text-lg">{t("orderSummary")}</h2>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("tax")}</span>
          <span>{formatPrice(tax, locale)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("shipping")}</span>
          <span className="text-green-600">{t("free")}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>{t("total")}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>
      </div>

      <Button asChild className="mt-6 w-full h-12 uppercase tracking-wider" size="lg">
        <Link href="/checkout">{t("proceedToCheckout")}</Link>
      </Button>
    </div>
  );
}
