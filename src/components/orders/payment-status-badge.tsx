import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export async function PaymentStatusBadge({ status }: { status: string }) {
  const t = await getTranslations("paymentStatus");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        PAYMENT_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {t(status as "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "EXPIRED")}
    </span>
  );
}
