import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}
