import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lien reçu par e-mail : confirmation d'inscription ou réinitialisation du mot de passe
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const suite = searchParams.get("suite") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // N'accepte que les chemins internes pour éviter les redirections externes
    if (!error) return NextResponse.redirect(`${origin}${suite.startsWith("/") && !suite.startsWith("//") ? suite : "/"}`);
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}
