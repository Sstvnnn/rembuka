import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function getCurrentProfile() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, nik, email, full_name, location, citizen_card_path, verification_status, created_at")
    .eq("id", user.id)
    .maybeSingle();

  let citizenCardUrl: string | null = null;

  if (profile?.citizen_card_path) {
    const { data } = await supabase.storage
      .from("citizen-cards")
      .createSignedUrl(profile.citizen_card_path, 60 * 30);

    citizenCardUrl = data?.signedUrl ?? null;
  }

  return {
    user,
    profile,
    citizenCardUrl,
  };
}
