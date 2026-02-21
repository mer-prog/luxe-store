export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, getCartCount } from "@/lib/actions/cart";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderComplete } from "@/components/checkout/order-complete";

interface CheckoutPageProps {
  searchParams: Promise<{
    success?: string;
    orderId?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const cartCount = await getCartCount();

  if (params.success === "true" && params.orderId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartCount={cartCount} />
        <main className="flex-1">
          <OrderComplete orderId={params.orderId} />
        </main>
        <Footer />
      </div>
    );
  }

  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <h1 className="font-serif text-4xl">Checkout</h1>
          <div className="mt-8">
            <CheckoutForm cart={cart} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
