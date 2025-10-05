import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import { Database } from "../types/database";

export type TypedSupabaseClient = SupabaseClient<Database>;

export const createSupabaseClient = (accessToken?: string): TypedSupabaseClient => {
  const headers = accessToken
    ? {
        Authorization: "Bearer " + accessToken
      }
    : undefined;

  const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers
    }
  });

  return supabase;
};

let serviceRoleClient: TypedSupabaseClient | null = null;

export const getServiceRoleClient = (): TypedSupabaseClient | null => {
  if (!env.supabaseServiceRoleKey) {
    return null;
  }

  if (!serviceRoleClient) {
    serviceRoleClient = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return serviceRoleClient;
};

export default createSupabaseClient;
