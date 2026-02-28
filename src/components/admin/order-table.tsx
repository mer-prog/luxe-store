"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "./order-status-select";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import type { OrderWithUser } from "@/types";

export function OrderTable({ orders }: { orders: OrderWithUser[] }) {
  const t = useTranslations("admin");
  const locale = useLocale();

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("order")}</TableHead>
            <TableHead>{t("customer")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("items")}</TableHead>
            <TableHead>{t("total")}</TableHead>
            <TableHead>{t("payment")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.orderNumber || `${order.id.slice(0, 8)}...`}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(order.createdAt, locale)}
              </TableCell>
              <TableCell>{t("itemsCount", { count: order.items.length })}</TableCell>
              <TableCell className="font-medium">
                {formatPrice(order.total, locale)}
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={order.paymentStatus} />
              </TableCell>
              <TableCell>
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
