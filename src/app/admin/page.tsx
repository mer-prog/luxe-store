export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { KpiCards } from "@/components/admin/kpi-cards";
import { SalesChart } from "@/components/admin/sales-chart";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";

export default async function AdminDashboardPage() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, newCustomers, recentOrders] = await Promise.all([
    prisma.order.findMany({
      select: { total: true, createdAt: true },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: thisMonthStart },
      },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
      },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Generate monthly revenue data for chart
  const monthlyData: Record<string, number> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyData[key] = 0;
  }

  orders.forEach((order) => {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in monthlyData) {
      monthlyData[key] += order.total;
    }
  });

  const salesChartData = Object.entries(monthlyData).map(([key, revenue]) => {
    const [, monthIndex] = key.split("-");
    return {
      month: months[parseInt(monthIndex)],
      revenue: Math.round(revenue),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      <KpiCards
        data={{
          totalRevenue,
          totalOrders,
          avgOrderValue,
          newCustomers,
        }}
      />

      <SalesChart data={salesChartData} />

      <div>
        <h2 className="mb-4 font-serif text-xl">Recent Orders</h2>
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
