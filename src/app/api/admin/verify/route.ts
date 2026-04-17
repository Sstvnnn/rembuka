import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (user?.email !== "rembuka.id@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, status } = await request.json();

    if (!userId || !["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Get current user data to find the file path
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("citizen_card_path, nik")
      .eq("id", userId)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newPath = userData.citizen_card_path;

    // 2. Move file in storage if path exists
    if (userData.citizen_card_path && userData.citizen_card_path.startsWith("pending/")) {
      const fileName = userData.citizen_card_path.split("/").pop();
      const folder = status === "verified" ? "verified" : "rejected";
      const targetPath = `${folder}/${fileName}`;

      const { error: moveError } = await supabase.storage
        .from("citizen-cards")
        .move(userData.citizen_card_path, targetPath);

      if (!moveError) {
        newPath = targetPath;
      } else {
        console.error("Storage Move Error:", moveError);
        // We continue anyway, but log it
      }
    }

    // 3. Update database
    const { error: dbError } = await supabase
      .from("users")
      .update({ 
        verification_status: status,
        citizen_card_path: newPath 
      })
      .eq("id", userId);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Update Auth Metadata so the user sees it immediately
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { 
        verification_status: status,
        citizen_card_path: newPath
      }
    });

  return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Process failed" }, { status: 500 });
  }
}
