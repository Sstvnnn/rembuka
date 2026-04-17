import { NextResponse } from "next/server";
import { findCitizenByNik, syncCitizenProfile } from "@/lib/citizens";
import { createClient } from "@/lib/supabase/server";
import { isValidNik, normalizeNik } from "@/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const nik = normalizeNik(String(formData.get("nik") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidNik(nik)) {
    return NextResponse.json(
      { error: "Please enter a valid identity number." },
      { status: 400 },
    );
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      { error: "Invalid NIK or password format. Password should be at least 8 characters and alphanumeric." },
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
      { error: "This NIK is not registered in the governance database." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: citizen.email,
    password,
  });

  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes("confirm your email")) {
      // Re-send OTP if it's an unconfirmed user
      await supabase.auth.resend({
        type: 'signup',
        email: citizen.email,
      });

      return NextResponse.json(
        { 
          error: "Your email is not verified yet. A new verification code has been sent.", 
          email: citizen.email,
          requiresVerification: true 
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Invalid NIK or password. Please try again." },
      { status: 400 },
    );
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    
    // Re-send OTP
    await supabase.auth.resend({
      type: 'signup',
      email: citizen.email,
    });

    return NextResponse.json(
      {
        error: "Your email is not verified yet. A new verification code has been sent.",
        email: citizen.email,
        requiresVerification: true
      },
      { status: 403 },
    );
  }

  await syncCitizenProfile({
    userId: data.user.id,
    citizen,
    citizenCardPath: (data.user.user_metadata.citizen_card_path as string | undefined) ?? null,
    verificationStatus:
      (data.user.user_metadata.verification_status as string | undefined) ?? null,
  });

  return NextResponse.json({
    success: true,
    user: {
      nik: citizen.nik,
      email: citizen.email,
      fullName: citizen.full_name,
      location: citizen.location,
    },
  });
}
