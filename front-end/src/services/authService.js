import { supabase } from "./supabaseClient";

const normalizeEmail = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

const ensureEmail = (rawEmail) => {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    throw new Error("Correo electronico requerido");
  }
  return email;
};

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
  const normalizedEmail = ensureEmail(email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password
  });

  if (error) {
    throw new Error(error.message || "Credenciales invalidas");
  }

  return normalizeSessionPayload(data);
};

export const signUpWithSupabase = async (email, password, metadata = {}) => {
  const normalizedEmail = ensureEmail(email);
  const normalizedMetadata =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? { ...metadata }
      : {};

  if (
    Object.prototype.hasOwnProperty.call(normalizedMetadata, "full_name") &&
    typeof normalizedMetadata.full_name === "string"
  ) {
    normalizedMetadata.full_name = normalizedMetadata.full_name.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(normalizedMetadata, "appRole") &&
    typeof normalizedMetadata.appRole === "string"
  ) {
    const trimmedRole = normalizedMetadata.appRole.trim();
    normalizedMetadata.appRole = trimmedRole || "SuperAdmin";
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: normalizedMetadata
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

export const updateSupabasePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error(error.message || "No se pudo actualizar la contrasena");
  }

  return data;
};
