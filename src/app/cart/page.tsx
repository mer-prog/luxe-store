export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, getCartCount } from "@/lib/actions/cart";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CartPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [cart, cartCount, t, tCommon] = await Promise.all([
    getCart(),
    getCartCount(),
    getTranslations("cart"),
    getTranslations("common"),
  ]);

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <h1 className="font-serif text-4xl">{t("title")}</h1>

          {isEmpty ? (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">
                {t("empty")}
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">{tCommon("continueShopping")}</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CartItems cart={cart} />
              </div>
              <div>
                <CartSummary cart={cart} />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
