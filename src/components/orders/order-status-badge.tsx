import { cn } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export async function OrderStatusBadge({ status }: { status: string }) {
  const t = await getTranslations("orderStatus");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {t(status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED")}
    </span>
  );
}
