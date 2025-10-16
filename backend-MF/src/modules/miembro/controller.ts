import { createCrudController } from "../common/controllerFactory";
import { miembroModel } from "./model";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { getServiceRoleClient } from "../../config/supabase";
import { ensureClient } from "../common/crudFactory";
import { toHttpError } from "../../utils/supabase";

const ALLOWED_DELETE_ROLES = new Set(["SuperAdmin", "AdminGym", "Entrenador", "authenticated", "service_role"]);

const baseController = createCrudController({
  table: "miembro",
  model: miembroModel
});

const remove = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  if (!memberId) {
    throw new AppError("Identificador de miembro requerido", 400);
  }

  const role = req.authUser?.role ?? "authenticated";
  if (!ALLOWED_DELETE_ROLES.has(role)) {
    throw new AppError("No tienes permisos para eliminar miembros", 403);
  }

  const serviceClient = getServiceRoleClient();
  const client = serviceClient ?? ensureClient(req.supabase);

  const { data, error } = await client.from("miembro").delete().eq("id", memberId).select("id");

  if (error) {
    throw toHttpError(error);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new AppError("Miembro no encontrado", 404);
  }

  res.status(204).send();
});

export const miembroController = {
  ...baseController,
  remove
};
