import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeEmail, normalizeNik } from "@/lib/supabase";

export type CitizenRecord = {
  nik: string;
  full_name: string;
  email: string;
  location: string | null;
};

type SyncCitizenProfileInput = {
  userId: string;
  citizen: CitizenRecord;
  citizenCardPath?: string | null;
  verificationStatus?: string | null;
};

export async function findCitizenByNik(nik: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_citizen_by_nik", {
    input_nik: normalizeNik(nik),
  });

  if (error) {
    throw error;
  }

  return (data?.[0] ?? null) as CitizenRecord | null;
}

export async function findCitizenByNikAndEmail(nik: string, email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_citizen_by_nik_email", {
    input_nik: normalizeNik(nik),
    input_email: normalizeEmail(email),
  });

  if (error) {
    throw error;
  }

  return (data?.[0] ?? null) as CitizenRecord | null;
}

export async function syncCitizenProfile({
  userId,
  citizen,
  citizenCardPath,
  verificationStatus,
}: SyncCitizenProfileInput) {
  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("users")
    .select("citizen_card_path, verification_status")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      nik: citizen.nik,
      email: citizen.email,
      full_name: citizen.full_name,
      location: citizen.location ?? "Unknown",
      citizen_card_path: citizenCardPath ?? existingProfile?.citizen_card_path ?? null,
      verification_status:
        verificationStatus ??
        (citizenCardPath ? "pending_review" : existingProfile?.verification_status ?? "missing_card"),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    throw error;
  }
}
