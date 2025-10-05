import { TypedSupabaseClient } from "../config/supabase";

declare global {
  namespace Express {
    interface UserInfo {
      id: string;
      email?: string;
      role?: string;
    }

    interface Request {
      authUser?: UserInfo;
      supabase?: TypedSupabaseClient;
      accessToken?: string;
    }
  }
}

export {};
