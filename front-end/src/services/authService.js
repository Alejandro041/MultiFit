import { supabase } from "./supabaseClient";

const normalizeSessionPayload = ({ session, user }) => {
  if (!session || !session.access_token) {
    throw new Error("No se pudo obtener la sesion de Supabase");
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in ?? 3600,
    user: user ?? session.user
  };
};

export const loginWithSupabase = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message || "Credenciales invalidas");
  }

  return normalizeSessionPayload(data);
};

export const signUpWithSupabase = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) {
    throw new Error(error.message || "No se pudo crear el usuario");
  }

  if (!data.session) {
    return {
      access_token: null,
      refresh_token: null,
      expires_in: null,
      user: data.user
    };
  }

  return normalizeSessionPayload(data);
};

export const refreshSupabaseToken = async (refreshToken) => {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    throw new Error(error.message || "No se pudo refrescar la sesion");
  }

  return normalizeSessionPayload(data);
};
