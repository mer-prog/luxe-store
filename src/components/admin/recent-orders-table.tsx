import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";
import type { OrderWithUser } from "@/types";

export async function RecentOrdersTable({ orders }: { orders: OrderWithUser[] }) {
  const t = await getTranslations("admin");
  const locale = await getLocale();

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("order")}</TableHead>
            <TableHead>{t("customer")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="text-right">{t("total")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.orderNumber || `${order.id.slice(0, 8)}...`}
              </TableCell>
              <TableCell>{order.user.name}</TableCell>
              <TableCell className="text-sm">
                {formatDate(order.createdAt, locale)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(order.total, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
