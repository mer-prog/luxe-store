"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusSelect } from "./order-status-select";
import { formatPrice, formatDate } from "@/lib/utils";
import type { OrderWithUser } from "@/types";

export function OrderTable({ orders }: { orders: OrderWithUser[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell>{order.items.length} items</TableCell>
              <TableCell className="font-medium">
                {formatPrice(order.total)}
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
