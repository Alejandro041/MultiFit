import { createCrudController } from "../common/controllerFactory";
import { tipoMembresiaModel } from "./model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ensureClient } from "../common/crudFactory";
import { getServiceRoleClient, TypedSupabaseClient } from "../../config/supabase";
import { toHttpError } from "../../utils/supabase";
import { AppError } from "../../utils/errors";

const ADMIN_ROLES = new Set(["SuperAdmin", "service_role"]); // FIX: Roles con acceso global a planes de membresía.

const baseController = createCrudController({
  table: "tipo_membresia",
  model: tipoMembresiaModel
});

const resolveUserGymId = async (
  client: TypedSupabaseClient,
  userId: string
) => {
  const { data, error } = await client
    .from("usuario")
    .select("persona:persona_id(id, gym_id)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw toHttpError(error);
  }

  const persona = (data as { persona?: { gym_id?: string | null } } | null)?.persona;
  return persona?.gym_id ?? null; // FIX: Limita los resultados cuando el usuario pertenece a un gimnasio concreto.
};

const list = asyncHandler(async (req, res) => {
  const authUser = req.authUser;
  const requestClient = ensureClient(req.supabase);
  const serviceClient = getServiceRoleClient();
  const queryClient = serviceClient ?? requestClient;

  let query = queryClient.from("tipo_membresia").select("*");

  if (authUser?.id && !ADMIN_ROLES.has(authUser.role ?? "")) {
    const userGymId = await resolveUserGymId(queryClient, authUser.id);
    if (userGymId) {
      query = query.eq("gym_id", userGymId);
    } else if (!serviceClient) {
      throw new AppError("No tienes permisos para listar tipos de membresía", 403);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw toHttpError(error);
  }

  res.json(Array.isArray(data) ? data : []);
}); // FIX: Fallback seguro para leer planes respetando RLS y roles.

export const tipoMembresiaController = {
  ...baseController,
  list
};
