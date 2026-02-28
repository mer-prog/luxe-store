"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";

interface SalesData {
  month: string;
  revenue: number;
}

export function SalesChart({ data }: { data: SalesData[] }) {
  const t = useTranslations("admin");
  const locale = useLocale();

  const currencySymbol = locale === "ja" ? "¥" : "$";
  const formatValue = (v: number) =>
    locale === "ja"
      ? `¥${(v / 1000).toFixed(0)}k`
      : `$${(v / 1000).toFixed(0)}k`;

  const formatTooltip = (value: number) =>
    locale === "ja"
      ? [`¥${value.toLocaleString()}`, t("revenue")]
      : [`$${value.toLocaleString()}`, t("revenue")];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-base">{t("monthlyRevenue")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
