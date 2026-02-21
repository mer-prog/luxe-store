"use client";

import { useState } from "react";
import { PlaceholderImage } from "@/components/placeholder-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const displayImages = images.length > 0 ? images : ["/images/products/product-01.jpg"];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <PlaceholderImage
          src={displayImages[selectedIndex]}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden border-2 bg-neutral-100",
                selectedIndex === i ? "border-primary" : "border-transparent"
              )}
            >
              <PlaceholderImage
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
