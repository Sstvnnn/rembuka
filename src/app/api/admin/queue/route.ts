import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (user?.email !== "rembuka.id@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createServiceClient();
    
    // Fetch both pending and rejected users
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("verification_status", ["pending_review", "rejected"])
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
