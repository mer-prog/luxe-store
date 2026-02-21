import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const shopLinks = [
  { href: "/products?category=outerwear", label: "Outerwear" },
  { href: "/products?category=tops", label: "Tops" },
  { href: "/products?category=bottoms", label: "Bottoms" },
  { href: "/products?category=shoes", label: "Shoes" },
  { href: "/products?category=accessories", label: "Accessories" },
];

const helpLinks = [
  { href: "#", label: "Shipping & Returns" },
  { href: "#", label: "Size Guide" },
  { href: "#", label: "Contact Us" },
  { href: "#", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-t bg-neutral-50">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-2xl tracking-[0.3em]">LUXE</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Timeless elegance meets modern luxury. Curating the finest in
              contemporary fashion since 2024.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Shop</h4>
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
              Customer Service
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
              Stay in Touch
            </h4>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form className="mt-4 flex gap-2" action="#">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LUXE. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
