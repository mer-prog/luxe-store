"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/orders";
import { ORDER_STATUSES } from "@/lib/constants";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "@prisma/client";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const t = useTranslations("orderStatus");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (value: string) => {
    setLoading(true);
    await updateOrderStatus(orderId, value as OrderStatus);
    router.refresh();
    setLoading(false);
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
