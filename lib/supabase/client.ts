import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseSingleton: SupabaseClient | null = null;

// 🔁 Backward-compatible singleton
export function createClient(): SupabaseClient {
  if (!supabaseSingleton) {
    supabaseSingleton = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseSingleton;
}

// 🔒 Keep existing imports working
export const supabase = createClient();