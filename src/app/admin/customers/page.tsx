export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { CustomerTable } from "@/components/admin/customer-table";
import { getTranslations } from "next-intl/server";

export default async function AdminCustomersPage() {
  const [customers, t] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        orders: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">{t("customers")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("viewCustomers")}
        </p>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
