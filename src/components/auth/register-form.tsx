"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/actions/auth";
import { useTranslations } from "next-intl";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    setError("");

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl">{t("createAccount")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("registerSubtitle")}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{t("fullName")}</Label>
          <Input
            id="name"
            name="name"
            placeholder={t("namePlaceholder")}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={t("passwordMinLength")}
            required
            minLength={6}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder={t("confirmPasswordPlaceholder")}
            required
            className="mt-1"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full h-11 uppercase tracking-wider">
          {loading ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
