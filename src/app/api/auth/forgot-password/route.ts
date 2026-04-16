import { NextResponse } from "next/server";
import { findCitizenByNik } from "@/lib/citizens";
import { createClient } from "@/lib/supabase/server";
import { isValidNik, normalizeNik } from "@/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const nik = normalizeNik(String(formData.get("nik") ?? ""));
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  if (!isValidNik(nik)) {
    return NextResponse.json(
      { error: "Please enter a valid identity number." },
      { status: 400 },
    );
  }

  let citizen;

  try {
    citizen = await findCitizenByNik(nik);
  } catch {
    return NextResponse.json(
      { error: "Citizen registry lookup failed. Check your Supabase SQL setup." },
      { status: 500 },
    );
  }

  if (!citizen) {
    return NextResponse.json(
      {
        error: "We could not find an account for this identity number.",
      },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(citizen.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "A password reset link has been sent if the account exists and is ready.",
  });
}
