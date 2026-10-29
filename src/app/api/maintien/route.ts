import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Appelée chaque jour par Vercel Cron (voir vercel.json) : une petite requête
// suffit pour que Supabase ne mette pas en pause le projet gratuit après
// 7 jours sans activité.
export async function GET(request: NextRequest) {
  // Si CRON_SECRET est défini sur Vercel, seul Vercel Cron peut appeler cette route
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("instituts").select("id").limit(1);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, date: new Date().toISOString() });
}
