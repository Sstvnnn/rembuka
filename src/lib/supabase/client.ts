"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase";

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  // Use non-null assertion because we check these in getSupabaseEnv()
  return createBrowserClient(url!, anonKey!);
}
