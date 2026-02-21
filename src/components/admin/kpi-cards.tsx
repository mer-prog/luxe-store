import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface KpiData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  newCustomers: number;
}

export function KpiCards({ data }: { data: KpiData }) {
  const kpis = [
    {
      title: "Total Revenue",
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      title: "Avg Order Value",
      value: formatPrice(data.avgOrderValue),
      icon: TrendingUp,
    },
    {
      title: "New Customers",
      value: data.newCustomers.toString(),
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
