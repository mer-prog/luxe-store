import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/orders") ||
        nextUrl.pathname.startsWith("/checkout") ||
        nextUrl.pathname.startsWith("/cart");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAdmin = (auth?.user as any)?.role === "ADMIN";
        if (!isAdmin) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isProtectedRoute) {
        if (!isLoggedIn) return false;
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
