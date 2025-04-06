import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log("Middleware token:", token); // Debug log
    const isAdmin = token?.role === "ADMIN";
    const isModerator = token?.role === "MODERATOR";

    if (
      req.nextUrl.pathname.startsWith("/dashboard") &&
      !isAdmin &&
      !isModerator
    ) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
