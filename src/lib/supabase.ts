const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export function getSupabaseEnv() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}

export function normalizeNik(nik: string) {
  return nik.replace(/\D/g, "").trim();
}

export function isValidNik(nik: string) {
  return /^\d{8,20}$/.test(normalizeNik(nik));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
