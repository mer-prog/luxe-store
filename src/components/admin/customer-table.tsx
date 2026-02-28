import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";
import type { CustomerWithOrders } from "@/types";

export async function CustomerTable({ customers }: { customers: CustomerWithOrders[] }) {
  const t = await getTranslations("admin");
  const locale = await getLocale();

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("joined")}</TableHead>
            <TableHead>{t("orders")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell className="text-sm">
                {formatDate(customer.createdAt, locale)}
              </TableCell>
              <TableCell>{customer._count.orders}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
