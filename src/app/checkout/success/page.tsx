export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartCount } from "@/lib/actions/cart";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlaceholderImage } from "@/components/placeholder-image";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as Record<string, unknown>).id as string;
  const params = await searchParams;
  if (!params.session_id) redirect("/orders");

  const [order, cartCount, t, tCommon, locale] = await Promise.all([
    prisma.order.findUnique({
      where: { stripeSessionId: params.session_id },
      include: {
        items: { include: { product: true } },
      },
    }),
    getCartCount(),
    getTranslations("checkoutSuccess"),
    getTranslations("common"),
    getLocale(),
  ]);

  if (!order || order.userId !== userId) redirect("/orders");

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
              <h1 className="mt-6 font-serif text-3xl">{t("title")}</h1>
              <p className="mt-4 text-muted-foreground">
                {t("message")}
              </p>
              <div className="mt-4 inline-block rounded-md border px-4 py-2" style={{ borderColor: "#C9A96E" }}>
                <p className="text-sm text-muted-foreground">{t("orderNumber")}</p>
                <p className="font-mono text-lg font-semibold" style={{ color: "#C9A96E" }}>
                  {order.orderNumber || order.id}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(order.createdAt, locale)}
              </p>
            </div>

            <Separator className="my-8" />

            <div className="space-y-4">
              <h2 className="font-serif text-xl">{t("items")}</h2>
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-neutral-100">
                    <PlaceholderImage
                      src={
                        item.product.images[0] ||
                        "/images/products/product-01.jpg"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size} &middot; {t("qty", { quantity: item.quantity })}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between text-lg font-semibold">
              <span>{t("total")}</span>
              <span>{formatPrice(order.total, locale)}</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/orders">{t("viewOrders")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">{tCommon("continueShopping")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
