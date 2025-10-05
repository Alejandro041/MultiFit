const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

const buildAuthRequest = (body) => ({
  method: "POST",
  headers: {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

export const loginWithSupabase = async (email, password) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, buildAuthRequest({ email, password }));

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Auth error" }));
    throw new Error(error.error_description || error.message || "Credenciales invalidas");
  }

  return response.json();
};

export const signUpWithSupabase = async (email, password, metadata = {}) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, buildAuthRequest({ email, password, data: metadata }));

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Signup error" }));
    throw new Error(error.error_description || error.message || "No se pudo crear el usuario");
  }

  return response.json();
};

export const refreshSupabaseToken = async (refreshToken) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, buildAuthRequest({ refresh_token: refreshToken }));

  if (!response.ok) {
    throw new Error("No se pudo refrescar la sesion");
  }

  return response.json();
};
