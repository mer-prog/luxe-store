import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants";

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        PAYMENT_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}
