import { NextResponse } from "next/server";
import { findCitizenByNik, syncCitizenProfile } from "@/lib/citizens";
import { createClient } from "@/lib/supabase/server";
import { isValidNik, normalizeNik } from "@/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const loginType = String(formData.get("loginType") ?? "citizen");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  let authEmail = "";

  if (loginType === "citizen") {
    // Citizen-specific password validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Invalid password format. Citizens must use at least 8 alphanumeric characters." },
        { status: 400 },
      );
    }

    const nik = normalizeNik(String(formData.get("nik") ?? ""));
    if (!isValidNik(nik)) {
      return NextResponse.json(
        { error: "Please enter a valid identity number." },
        { status: 400 },
      );
    }

    try {
      const citizen = await findCitizenByNik(nik);
      if (!citizen) {
        return NextResponse.json(
          { error: "This NIK is not registered in the governance database." },
          { status: 403 },
        );
      }
      authEmail = citizen.email;
    } catch {
      return NextResponse.json(
        { error: "Citizen registry lookup failed." },
        { status: 500 },
      );
    }
  } else {
    authEmail = String(formData.get("email") ?? "");
    if (!authEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid official email." },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Invalid credentials. Please try again." },
      { status: 400 },
    );
  }

  // --- Post-Authentication Verification ---

  if (loginType === "governance") {
    // Verify user ID exists in governance table
    const { data: govProfile } = await supabase
      .from("governance")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!govProfile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "This account is not authorized for the Governance Portal." },
        { status: 403 },
      );
    }
  } else {
    // Citizen Sync...

    const nik = normalizeNik(String(formData.get("nik") ?? ""));
    const citizen = await findCitizenByNik(nik);
    if (citizen) {
      await syncCitizenProfile({
        userId: data.user.id,
        citizen,
        citizenCardPath: (data.user.user_metadata.citizen_card_path as string | undefined) ?? null,
        verificationStatus:
          (data.user.user_metadata.verification_status as string | undefined) ?? null,
      });
    }
  }

  return NextResponse.json({
    success: true,
    user: {
      email: data.user.email,
    },
  });
}
