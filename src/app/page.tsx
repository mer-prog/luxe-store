export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Button } from "@/components/ui/button";
import { getCartCount } from "@/lib/actions/cart";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [featuredProducts, categories, cartCount] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    getCartCount(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex h-[70vh] items-center justify-center bg-neutral-900 text-white">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center">
            <h1 className="font-serif text-5xl md:text-7xl tracking-wider">
              Discover Timeless
              <br />
              Elegance
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-neutral-300">
              Curated luxury fashion for the modern connoisseur
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 px-8 uppercase tracking-widest"
            >
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </section>

        {/* Featured Products */}
        <section className="container py-20">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl">Featured Collection</h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="bg-neutral-50 py-20">
          <div className="container">
            <h2 className="text-center font-serif text-3xl">Shop by Category</h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-neutral-200"
                >
                  <PlaceholderImage
                    src={category.image || "/images/products/product-01.jpg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="font-serif text-xl tracking-wider text-white">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="container py-20 text-center">
          <h2 className="font-serif text-3xl">The Art of Luxury</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            At LUXE, we believe in the power of exceptional craftsmanship. Every piece in our
            collection is carefully curated from the world&apos;s finest ateliers, combining
            traditional artistry with contemporary design. Experience fashion that transcends
            seasons.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
