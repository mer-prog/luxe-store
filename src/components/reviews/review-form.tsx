"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { createReview } from "@/lib/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>{" "}
        to leave a review.
      </p>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    if (rating === 0) {
      setMessage("Please select a rating");
      return;
    }

    setLoading(true);
    setMessage("");
    formData.set("rating", String(rating));

    const result = await createReview(productId, formData);

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Review submitted!");
      setRating(0);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Rating</label>
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
          Comment (optional)
        </label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="Share your thoughts..."
          className="mt-1"
          rows={3}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("submitted") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
