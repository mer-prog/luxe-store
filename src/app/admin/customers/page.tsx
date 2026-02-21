export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { CustomerTable } from "@/components/admin/customer-table";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">Customers</h2>
        <p className="mt-1 text-muted-foreground">
          View customer details and order history
        </p>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
