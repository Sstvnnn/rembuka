import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServiceClient();

    // Check if user is an admin in the governance table
    const { data: govProfile } = await supabase
      .from("governance")
      .select("role")
      .eq("id", user.id)
      .single();

    if (govProfile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }
    
    // Fetch pending, unverified, verified and rejected users
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("verification_status", ["pending_review", "rejected", "unverified", "verified"])
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const queue = await Promise.all((data || []).map(async (item) => {
      let card_url = null;
      if (item.citizen_card_path) {
        const { data: signedData } = await supabase.storage
          .from("citizen-cards")
          .createSignedUrl(item.citizen_card_path, 3600);
        card_url = signedData?.signedUrl;
      }
      return { ...item, card_url };
    }));

    return NextResponse.json({ queue });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
