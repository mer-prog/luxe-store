export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";
import { Separator } from "@/components/ui/separator";
import { getCartCount } from "@/lib/actions/cart";
import { getTranslations } from "next-intl/server";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const t = await getTranslations("products");

  const [product, cartCount] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getCartCount(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <div className="container py-10">
          <div className="grid gap-10 md:grid-cols-2">
            <ProductGallery images={product.images} name={product.name} />

            <div className="space-y-8">
              <ProductInfo product={product} />
              <Separator />
              <AddToCartButton
                productId={product.id}
                sizes={product.sizes}
                stock={product.stock}
              />
            </div>
          </div>

          <Separator className="my-16" />

          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl">{t("customerReviews")}</h2>
            <div className="mt-6">
              <ReviewList reviews={product.reviews} />
            </div>

            <Separator className="my-8" />

            <h3 className="font-serif text-xl">{t("writeReview")}</h3>
            <div className="mt-4">
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
