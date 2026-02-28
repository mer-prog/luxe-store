import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";

interface KpiData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  newCustomers: number;
}

export async function KpiCards({ data }: { data: KpiData }) {
  const t = await getTranslations("admin");
  const locale = await getLocale();

  const kpis = [
    {
      title: t("totalRevenue"),
      value: formatPrice(data.totalRevenue, locale),
      icon: DollarSign,
    },
    {
      title: t("totalOrders"),
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      title: t("avgOrderValue"),
      value: formatPrice(data.avgOrderValue, locale),
      icon: TrendingUp,
    },
    {
      title: t("newCustomers"),
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
