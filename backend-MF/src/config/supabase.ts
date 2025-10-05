import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import { Database } from "../types/database";

export type TypedSupabaseClient = SupabaseClient<Database>;

export const createSupabaseClient = (accessToken?: string): TypedSupabaseClient => {
  const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`
          }
        : undefined
    }
  });

  return supabase;
};
