import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Verify the OTP
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (verifyError) {
      return NextResponse.json(
        { error: verifyError.message },
        { status: 400 },
      );
    }

    const user = data.user;
    if (!user) {
      return NextResponse.json(
        { error: "User not found after verification." },
        { status: 404 },
      );
    }

    // 2. Extract metadata we saved during registration
    const metadata = user.user_metadata;
    
    // 3. Create the profile in public.users
    // We use the authenticated session from verifyOtp to perform the insert
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        nik: metadata.nik,
        full_name: metadata.full_name,
        location: metadata.location,
        citizen_card_path: metadata.citizen_card_path,
        verification_status: "unverified", // Default as requested
      }, { onConflict: 'nik' });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // We don't return error here because the user IS verified in Auth, 
      // but we should log it. In a production app, you might want more robust handling.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 },
    );
  }
}
