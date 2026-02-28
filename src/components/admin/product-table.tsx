"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { deleteProduct } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { ProductWithCategory, Category } from "@/types";

interface ProductTableProps {
  products: ProductWithCategory[];
  categories: Category[];
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [editProduct, setEditProduct] = useState<ProductWithCategory | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setDeletingId(id);
    await deleteProduct(id);
    router.refresh();
    setDeletingId(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl">{t("products")}</h2>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("addProduct")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("addProductTitle")}</DialogTitle>
              <DialogDescription>{t("addProductDescription")}</DialogDescription>
            </DialogHeader>
            <ProductForm
              categories={categories}
              onSuccess={() => setShowAdd(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("stock")}</TableHead>
              <TableHead>{t("featured")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>{formatPrice(product.price, locale)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  {product.featured && (
                    <Badge variant="secondary">{t("featured")}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={editProduct?.id === product.id}
                      onOpenChange={(open) =>
                        setEditProduct(open ? product : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("editProduct")}</DialogTitle>
                          <DialogDescription>{t("editProductDescription")}</DialogDescription>
                        </DialogHeader>
                        <ProductForm
                          product={product}
                          categories={categories}
                          onSuccess={() => setEditProduct(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
