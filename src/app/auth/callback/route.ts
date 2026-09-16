import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/dal";

// Cierra el flujo OAuth (Google) y el link de confirmación de email:
// Supabase redirige acá con un `code` que hay que canjear por la sesión.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/cuenta/login?error=oauth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/cuenta/login?error=oauth`);
  }

  await syncProfile(data.user);

  const target =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/cuenta";

  return NextResponse.redirect(`${origin}${target}`);
}
