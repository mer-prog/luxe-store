export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { OrderTable } from "@/components/admin/order-table";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } },
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">Orders</h2>
        <p className="mt-1 text-muted-foreground">
          Manage and update order statuses
        </p>
      </div>

      <OrderTable orders={orders} />
    </div>
  );
}
