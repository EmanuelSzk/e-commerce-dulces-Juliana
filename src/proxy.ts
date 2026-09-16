import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const ADMIN_PREFIX = "/admin";
const ACCOUNT_PREFIX = "/cuenta";
const PUBLIC_ACCOUNT_ROUTES = ["/cuenta/login", "/cuenta/registro"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isPublicAccountRoute = PUBLIC_ACCOUNT_ROUTES.some((route) =>
    path.startsWith(route),
  );
  const requiresAuth =
    path.startsWith(ADMIN_PREFIX) ||
    (path.startsWith(ACCOUNT_PREFIX) && !isPublicAccountRoute);

  if (!user && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
