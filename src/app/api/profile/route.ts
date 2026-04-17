import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeNik } from "@/lib/supabase";

async function uploadCitizenCard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  nik: string,
  email: string,
  file: File,
) {
  const extension = file.name.split(".").pop() || "jpg";
  // Consistency with registration: pending/NIK-EMAIL-TIMESTAMP.ext
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

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Check current verification status - can't update if already verified
  const { data: profile } = await supabase
    .from("users")
    .select("verification_status, email")
    .eq("id", user.id)
    .single();

  if (profile?.verification_status === "verified") {
    return NextResponse.json({ error: "Verified profiles cannot be modified." }, { status: 403 });
  }

  const formData = await request.formData();
  const citizenCard = formData.get("citizenCard");
  const nik = normalizeNik(String(user.user_metadata.nik ?? ""));
  const email = profile?.email ?? user.email ?? "";

  if (!(citizenCard instanceof File) || citizenCard.size === 0) {
    return NextResponse.json({ error: "New citizen card image is required." }, { status: 400 });
  }

  let citizenCardPath: string;
  try {
    citizenCardPath = await uploadCitizenCard(supabase, user.id, nik, email, citizenCard);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Only update the citizen card path and status. 
  // Name, Location, etc. are governance data and stay locked.
  const { error: profileError } = await supabase
    .from("users")
    .update({
      citizen_card_path: citizenCardPath,
      verification_status: "pending_review",
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Also update Auth metadata so the UI stays in sync immediately
  await supabase.auth.updateUser({
    data: {
      citizen_card_path: citizenCardPath,
      verification_status: "pending_review",
    }
  });

  return NextResponse.json({ success: true });
}
