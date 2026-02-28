export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, getCartCount } from "@/lib/actions/cart";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getTranslations } from "next-intl/server";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [cart, cartCount, t] = await Promise.all([
    getCart(),
    getCartCount(),
    getTranslations("checkout"),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <h1 className="font-serif text-4xl">{t("title")}</h1>
          <div className="mt-8">
            <CheckoutForm cart={cart} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
