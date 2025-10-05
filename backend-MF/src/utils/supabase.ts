import { PostgrestError } from "@supabase/supabase-js";
import { AppError } from "./errors";

const STATUS_MAP: Record<string, number> = {
  PGRST116: 404,
  PGRST301: 400,
  PGRST305: 400
};

export const toHttpError = (error: PostgrestError): AppError => {
  const status = STATUS_MAP[error.code] ?? 400;
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
