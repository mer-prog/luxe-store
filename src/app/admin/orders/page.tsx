export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { OrderTable } from "@/components/admin/order-table";
import { getTranslations } from "next-intl/server";

export default async function AdminOrdersPage() {
  const [orders, t] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
      },
    }),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">{t("orders")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("manageOrders")}
        </p>
      </div>

      <OrderTable orders={orders} />
    </div>
  );
}
