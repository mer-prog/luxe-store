"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelectSize }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Size</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelectSize(size)}
            className={cn(
              "flex h-10 min-w-[3rem] items-center justify-center border px-3 text-sm font-medium transition-colors",
              selectedSize === size
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
