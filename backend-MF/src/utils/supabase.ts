import { PostgrestError } from "@supabase/supabase-js";
import { AppError } from "./errors";

const STATUS_MAP: Record<string, number> = {
  PGRST116: 404,
  PGRST301: 400,
  PGRST305: 400,
  PGRST302: 403,
  "42501": 403
}; // FIX: Ajusta códigos conocidos a sus equivalentes HTTP.

const isRlsViolation = (error: PostgrestError): boolean => {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error.code === "42501" ||
    error.code === "PGRST302" ||
    message.includes("row-level security") ||
    message.includes("rls")
  );
}; // FIX: Detecta bloqueos de RLS para responder con 403.

export const toHttpError = (error: PostgrestError): AppError => {
  const status = STATUS_MAP[error.code] ?? (isRlsViolation(error) ? 403 : 400);
  return new AppError(error.message, status, {
    details: error.details,
    hint: error.hint
  });
};

export const assertNoError = <T>(
  error: PostgrestError | null,
  data?: T | null
): T => {
  if (error) {
    throw toHttpError(error);
  }

  if (data === null || data === undefined) {
    throw new AppError("Resource not found", 404);
  }

  return data as unknown as T;
};
