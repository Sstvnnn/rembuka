import { NextResponse } from "next/server";
import { findCitizenByNik } from "@/lib/citizens";
import { createClient } from "@/lib/supabase/server";
import { isValidNik, normalizeNik } from "@/lib/supabase";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function uploadCitizenCard(
  supabase: SupabaseServerClient,
  nik: string,
  email: string,
  file: File,
) {
  const extension = file.name.split(".").pop() || "jpg";
  const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "-");
  const filePath = `pending/${nik}-${safeEmail}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("citizen-cards")
    .upload(filePath, file, { upsert: true, contentType: file.type || "image/jpeg" });

  if (error) {
    throw error;
  }

  return filePath;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const nik = normalizeNik(String(formData.get("nik") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const citizenCard = formData.get("citizenCard");

  if (!isValidNik(nik)) {
    return NextResponse.json(
      { error: "Please enter a valid identity number." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  if (!(citizenCard instanceof File) || citizenCard.size === 0) {
    return NextResponse.json(
      { error: "Please upload your identity card image." },
      { status: 400 },
    );
  }

  let citizen;

  try {
    citizen = await findCitizenByNik(nik);
  } catch {
    return NextResponse.json(
      { error: "We could not verify your registration details right now." },
      { status: 500 },
    );
  }

  if (!citizen) {
    return NextResponse.json(
      {
        error: "We could not find a matching account for this identity number.",
      },
      { status: 403 },
    );
  }

  const supabase = await createClient();

  let citizenCardPath: string;
  try {
    citizenCardPath = await uploadCitizenCard(supabase, citizen.nik, citizen.email, citizenCard);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json(
      { error: `Identity card upload failed: ${message}` },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const emailRedirectTo = appUrl
    ? `${appUrl.replace(/\/$/, "")}/auth/callback?next=/confirmed`
    : undefined;

  const { data, error } = await supabase.auth.signUp({
    email: citizen.email,
    password,
    options: {
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
      data: {
        nik: citizen.nik,
        full_name: citizen.full_name,
        location: citizen.location,
        citizen_card_path: citizenCardPath,
        verification_status: "pending_review",
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    emailConfirmationRequired: !data.session,
  });
}
