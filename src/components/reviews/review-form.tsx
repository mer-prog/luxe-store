"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { createReview } from "@/lib/actions/reviews";
import { useTranslations } from "next-intl";

export function ReviewForm({ productId }: { productId: string }) {
  const t = useTranslations("reviews");
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">
          {t("signInLink")}
        </a>{" "}
        {t("signInToReview", { link: "" }).replace("", "")}
      </p>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    if (rating === 0) {
      setMessage(t("selectRating"));
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");
    formData.set("rating", String(rating));

    const result = await createReview(productId, formData);

    if (result.error) {
      setMessage(result.error);
      setIsSuccess(false);
    } else {
      setMessage(t("submitted"));
      setIsSuccess(true);
      setRating(0);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">{t("rating")}</label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium">
          {t("commentLabel")}
        </label>
        <Textarea
          id="comment"
          name="comment"
          placeholder={t("commentPlaceholder")}
          className="mt-1"
          rows={3}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading} size="sm">
        {loading ? t("submitting") : t("submitReview")}
      </Button>
    </form>
  );
}
