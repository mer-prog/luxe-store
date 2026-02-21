export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrderList } from "@/components/orders/order-list";
import { getCartCount } from "@/lib/actions/cart";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as Record<string, unknown>).id as string;

  const [orders, cartCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getCartCount(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <h1 className="font-serif text-4xl">Order History</h1>
          <p className="mt-2 text-muted-foreground">
            Track your orders and view past purchases
          </p>

          <div className="mt-8">
            <OrderList orders={orders} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
