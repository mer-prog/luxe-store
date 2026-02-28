"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  const shopLinks = [
    { href: "/products?category=outerwear", label: t("outerwear") },
    { href: "/products?category=tops", label: t("tops") },
    { href: "/products?category=bottoms", label: t("bottoms") },
    { href: "/products?category=shoes", label: t("shoes") },
    { href: "/products?category=accessories", label: t("accessories") },
  ];

  const helpLinks = [
    { href: "#", label: t("shippingReturns") },
    { href: "#", label: t("sizeGuide") },
    { href: "#", label: t("contactUs") },
    { href: "#", label: t("faq") },
  ];

  return (
    <footer className="border-t bg-neutral-50">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-2xl tracking-[0.3em]">LUXE</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("brandDescription")}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">{t("shop")}</h4>
            <ul className="mt-4 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {t("customerService")}
            </h4>
            <ul className="mt-4 space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {t("stayInTouch")}
            </h4>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("newsletterSubtitle")}
            </p>
            <form className="mt-4 flex gap-2" action="#">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {t("join")}
              </button>
            </form>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
