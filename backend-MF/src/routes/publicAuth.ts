import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getServiceRoleClient } from "../config/supabase";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

type ConfirmSignupBody = {
  userId?: string;
};

export const confirmSignupHandler = asyncHandler(
  async (req: Request<unknown, unknown, ConfirmSignupBody>, res: Response) => {
    const userId = req.body?.userId;

    if (!userId || typeof userId !== "string") {
      throw new AppError("Identificador de usuario requerido", 400);
    }

    const adminClient = getServiceRoleClient();

    if (!adminClient) {
      throw new AppError("Registro no disponible", 500);
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true
    });

    if (updateError) {
      logger.warn({ error: updateError }, "No se pudo marcar email como confirmado");
      throw new AppError(updateError.message ?? "No se pudo confirmar el usuario", updateError.status ?? 400);
    }
    res.json({ userId });
  }
);

export default confirmSignupHandler;
