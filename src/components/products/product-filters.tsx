"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import type { Category } from "@/types";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const t = useTranslations("products");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "newest";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Select value={currentCategory} onValueChange={(v) => updateParams("category", v)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("newest")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("newest")}</SelectItem>
          <SelectItem value="price-asc">{t("priceLowToHigh")}</SelectItem>
          <SelectItem value="price-desc">{t("priceHighToLow")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
