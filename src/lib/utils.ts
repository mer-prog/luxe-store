import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents: number, locale?: string): string {
  if (locale === "ja") {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(priceInCents);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

export function formatDate(date: Date | string, locale?: string): string {
  const loc = locale === "ja" ? "ja-JP" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
