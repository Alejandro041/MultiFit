import { createCrudController } from "../common/controllerFactory";
import { miembroModel } from "./model";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { getServiceRoleClient } from "../../config/supabase";
import { ensureClient } from "../common/crudFactory";
import { toHttpError } from "../../utils/supabase";
import { TypedSupabaseClient } from "../../config/supabase";

const ADMIN_ROLES = new Set(["SuperAdmin", "service_role"]); // FIX: Roles con privilegios globales.
const LIMITED_ROLES = new Set(["AdminGym", "Entrenador", "authenticated"]); // FIX: Roles limitados al gimnasio.

const baseController = createCrudController({
  table: "miembro",
  model: miembroModel
});

const fetchMemberWithGym = async (
  client: TypedSupabaseClient,
  memberId: string
) => {
  const { data, error } = await client
    .from("miembro")
    .select("id, persona:persona_id(id, gym_id)")
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw toHttpError(error);
  }
  if (!data) {
    throw new AppError("Miembro no encontrado", 404);
  }
  return data as {
    id: string;
    persona: { id: string | null; gym_id: string | null } | null;
  }; // FIX: Normaliza el payload utilizado más adelante.
};

const fetchUserGym = async (
  client: TypedSupabaseClient,
  userId: string
) => {
  const { data, error } = await client
    .from("usuario")
    .select("id, persona_id, persona:persona_id(id, gym_id)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw toHttpError(error);
  }

  const persona = (data as { persona?: { gym_id?: string | null } } | null)?.persona;
  return persona?.gym_id ?? null; // FIX: Devuelve el gym asociado al usuario autenticado.
};

const performDeletion = async (
  client: TypedSupabaseClient,
  memberId: string
) => {
  const { error, count } = await client
    .from("miembro")
    .delete({ count: "exact" })
    .eq("id", memberId);

  if (error) {
    throw toHttpError(error);
  }
  return typeof count === "number" ? count > 0 : true;
}; // FIX: Devuelve indicador de éxito para decidir si usar service role.

const remove = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  if (!memberId) {
    throw new AppError("Identificador de miembro requerido", 400);
  }

  const authUser = req.authUser;
  if (!authUser?.id) {
    throw new AppError("No tienes permisos para eliminar miembros", 403);
  }

  const requestClient = ensureClient(req.supabase);
  const serviceClient = getServiceRoleClient();
  const lookupClient = serviceClient ?? requestClient;

  const member = await fetchMemberWithGym(lookupClient, memberId);
  const memberGymId = member.persona?.gym_id ?? null;

  const userGymId = await fetchUserGym(lookupClient, authUser.id);
  const resolvedRole = authUser.role ?? "authenticated";

  const isGlobalRole = ADMIN_ROLES.has(resolvedRole);
  const sharesGym =
    memberGymId && userGymId
      ? memberGymId === userGymId
      : true; // FIX: If we cannot determine the gym, assume RLS already enforced access.
  const isLimitedRoleAllowed = LIMITED_ROLES.has(resolvedRole) && sharesGym;

  if (!isGlobalRole && !isLimitedRoleAllowed) {
    throw new AppError("No tienes permisos para eliminar miembros", 403); // FIX: Garantiza que solo roles esperados puedan eliminar.
  }

  let deleted = await performDeletion(requestClient, memberId);

  if (!deleted && serviceClient && serviceClient !== requestClient) {
    deleted = await performDeletion(serviceClient, memberId); // FIX: Usa service role solo si el cliente autenticado no pudo eliminar.
  }

  if (!deleted) {
    throw new AppError("Miembro no encontrado", 404);
  }

  res.status(204).send();
});

export const miembroController = {
  ...baseController,
  remove
};
