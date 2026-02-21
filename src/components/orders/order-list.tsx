import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OrderStatusBadge } from "./order-status-badge";
import { PlaceholderImage } from "@/components/placeholder-image";
import { formatPrice, formatDate } from "@/lib/utils";
import type { OrderWithItems } from "@/types";

export function OrderList({ orders }: { orders: OrderWithItems[] }) {
  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">No orders yet.</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-primary hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {order.id}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} />
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-shrink-0 items-center gap-3">
                  <div className="relative h-16 w-14 overflow-hidden bg-neutral-100">
                    <PlaceholderImage
                      src={item.product.images[0] || "/images/products/product-01.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size} &middot; Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
