import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function getCurrentProfile() {
  const user = await requireUser();
  const supabase = await createClient();

  // 1. Try fetching Governance profile first (higher precedence)
  const { data: govProfile } = await supabase
    .from("governance")
    .select("id, full_name, role, position, location, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (govProfile) {
    return {
      user,
      profile: {
        ...govProfile,
        email: user.email,
      },
      userType: "governance",
      role: govProfile.role,
      position: govProfile.position,
      citizenCardUrl: null,
    };
  }

  // 2. Try fetching Citizen profile
  const { data: citizenProfile } = await supabase
    .from("users")
    .select("id, nik, email, full_name, location, citizen_card_path, verification_status, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const userType = "citizen";
  const profile = citizenProfile || {
    id: user.id,
    nik: (user.user_metadata.nik as string) ?? "-",
    email: user.email ?? "-",
    full_name: (user.user_metadata.full_name as string) ?? "Citizen",
    location: (user.user_metadata.location as string) ?? "Unknown",
    verification_status: (user.user_metadata.verification_status as string) ?? "missing_card",
  };

  let citizenCardUrl: string | null = null;
  const cardPath = citizenProfile?.citizen_card_path || (user.user_metadata.citizen_card_path as string);
  
  if (cardPath) {
    const { data } = await supabase.storage
      .from("citizen-cards")
      .createSignedUrl(cardPath, 60 * 30);
    citizenCardUrl = data?.signedUrl ?? null;
  }

  return {
    user,
    profile,
    userType,
    role: "citizen",
    position: null,
    citizenCardUrl,
  };
}
