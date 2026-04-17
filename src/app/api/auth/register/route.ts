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
  try {
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

    // Password Validation: Min 8 chars, must contain letter and number
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain both letters and numbers." },
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

    // Check if NIK exists in the governance 'citizens' table
    let citizen;
    try {
      citizen = await findCitizenByNik(nik);
    } catch (error) {
      console.error("Governance check error:", error);
      return NextResponse.json(
        { error: "We could not verify your registration details right now." },
        { status: 500 },
      );
    }

    if (!citizen) {
      return NextResponse.json(
        { error: "We could not find a matching account for this identity number in our governance records." },
        { status: 403 },
      );
    }

    const supabase = await createClient();

    // Upload ID card
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

    // Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: citizen.email,
      password,
      options: {
        data: {
          nik: citizen.nik,
          full_name: citizen.full_name,
          location: citizen.location,
          citizen_card_path: citizenCardPath,
          verification_status: "unverified", // Default state
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      emailConfirmationRequired: !data.session,
      email: citizen.email,
    });
  } catch (error) {
    console.error("Registration route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 },
    );
  }
}
