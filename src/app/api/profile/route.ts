import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeNik } from "@/lib/supabase";

async function uploadCitizenCard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  nik: string,
  file: File,
) {
  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `${nik}/${userId}-${Date.now()}.${extension}`;

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

  const formData = await request.formData();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const citizenCard = formData.get("citizenCard");
  const nik = normalizeNik(String(user.user_metadata.nik ?? ""));

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }

  let citizenCardPath: string | undefined;
  let verificationStatus = "pending_review";

  if (citizenCard instanceof File && citizenCard.size > 0) {
    try {
      citizenCardPath = await uploadCitizenCard(supabase, user.id, nik, citizenCard);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    const { data: existingProfile } = await supabase
      .from("users")
      .select("citizen_card_path, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    citizenCardPath = existingProfile?.citizen_card_path ?? undefined;
    verificationStatus = existingProfile?.verification_status ?? "missing_card";
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      location,
      citizen_card_path: citizenCardPath ?? null,
      verification_status: citizenCardPath ? "pending_review" : verificationStatus,
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      location,
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
