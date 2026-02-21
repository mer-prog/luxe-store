import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/admin/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/cart/:path*",
  ],
};
