import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Review, User } from "@/types";

type ReviewWithUser = Review & { user: Pick<User, "id" | "name"> };

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: ReviewWithUser[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
    );
  }

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StarRating rating={Math.round(averageRating)} />
        <span className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} out of 5 ({reviews.length}{" "}
          {reviews.length === 1 ? "review" : "reviews"})
        </span>
      </div>

      <div className="space-y-6 divide-y">
        {reviews.map((review) => (
          <div key={review.id} className="pt-6 first:pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{review.user.name}</span>
                <StarRating rating={review.rating} />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
            {review.comment && (
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
