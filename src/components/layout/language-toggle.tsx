"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/lib/actions/locale";
import type { Locale } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (newLocale: Locale) => {
    if (newLocale === locale) return;
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <div className={`flex items-center gap-1 text-xs tracking-wider ${isPending ? "opacity-50" : ""}`}>
      <button
        onClick={() => handleSwitch("ja")}
        className={`transition-colors ${
          locale === "ja"
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
        disabled={isPending}
      >
        JP
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => handleSwitch("en")}
        className={`transition-colors ${
          locale === "en"
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
        disabled={isPending}
      >
        EN
      </button>
    </div>
  );
}
