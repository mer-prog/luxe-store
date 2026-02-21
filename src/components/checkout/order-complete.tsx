import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function OrderComplete({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
      <h1 className="mt-6 font-serif text-3xl">Order Confirmed</h1>
      <p className="mt-4 text-muted-foreground">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Order ID: <span className="font-mono font-medium text-foreground">{orderId}</span>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/orders">View Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
