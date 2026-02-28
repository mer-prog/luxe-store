export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCartCount } from "@/lib/actions/cart";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CheckoutCancelPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [cartCount, t, tCommon] = await Promise.all([
    getCartCount(),
    getTranslations("checkoutCancel"),
    getTranslations("common"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="mx-auto max-w-md py-20 text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 font-serif text-3xl">{t("title")}</h1>
          <p className="mt-4 text-muted-foreground">
            {t("message")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/checkout">{t("tryAgain")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">{tCommon("continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
