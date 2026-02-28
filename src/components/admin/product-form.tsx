"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { useTranslations } from "next-intl";
import type { Product, Category } from "@/types";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSuccess?: () => void;
}

export function ProductForm({ product, categories, onSuccess }: ProductFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [featured, setFeatured] = useState(product?.featured || false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    formData.set("categoryId", categoryId);
    formData.set("featured", String(featured));

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    onSuccess?.();
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="slug">{t("slug")}</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          required
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">{t("price")}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={product?.price ? (product.price / 100).toFixed(2) : ""}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">{t("compareAtPrice")}</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            defaultValue={product?.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="stock">{t("stock")}</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            defaultValue={product?.stock || 0}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t("category")}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t("selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sizes">{t("sizes")}</Label>
          <Input
            id="sizes"
            name="sizes"
            defaultValue={product?.sizes.join(", ")}
            placeholder="S, M, L, XL"
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="images">{t("imageUrls")}</Label>
        <Input
          id="images"
          name="images"
          defaultValue={product?.images.join(", ")}
          placeholder="/images/products/product-01.jpg"
          required
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="featured" className="font-normal">
          {t("featuredProduct")}
        </Label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? product
            ? t("updating")
            : t("creating")
          : product
          ? t("updateProduct")
          : t("createProduct")}
      </Button>
    </form>
  );
}
