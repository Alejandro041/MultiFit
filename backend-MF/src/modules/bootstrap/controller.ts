import { Request, Response } from "express";
import { PostgrestError } from "@supabase/supabase-js";
import { asyncHandler } from "../../utils/asyncHandler";
import { ensureClient } from "../common/crudFactory";
import { AppError } from "../../utils/errors";
import { assertNoError, toHttpError } from "../../utils/supabase";
import { getServiceRoleClient } from "../../config/supabase";
import { logger } from "../../utils/logger";

const DEFAULT_ROLES = [
  {
    name: "SuperAdmin",
    description: "Acceso total a la organizacion",
    permissions: {}
  },
  {
    name: "AdminGym",
    description: "Gestiona una sucursal",
    permissions: {}
  },
  {
    name: "Entrenador",
    description: "Gestiona clases y rutinas",
    permissions: {}
  },
  {
    name: "Miembro",
    description: "Acceso a informacion personal",
    permissions: {}
  }
];

const ensureDefaultRoles = async () => {
  const adminClient = getServiceRoleClient();
  if (!adminClient) {
    return;
  }

  const { data: existingRoles, error } = await adminClient.from("rol").select("name");

  if (error) {
    logger.warn({ error }, "Failed to read roles during bootstrap");
    return;
  }

  const roles = (existingRoles ?? []) as Array<{ name?: string | null }>;
  const existingNames = new Set(roles.map((role) => (role?.name ?? "").toLowerCase()));
  const missing = DEFAULT_ROLES.filter((role) => !existingNames.has(role.name.toLowerCase()));

  if (!missing.length) {
    return;
  }

  const { error: insertError } = await adminClient
    .from("rol")
    .insert(
      missing.map((role) => ({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      })) as never
    );

  if (insertError) {
    logger.warn({ error: insertError }, "Failed to seed default roles");
  }
};

const isNotFoundError = (error: PostgrestError | null | undefined) => {
  return !!error && error.code === "PGRST116";
};

export const ensureUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const authUser = req.authUser;

  if (!authUser?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const client = ensureClient(req.supabase);

  await ensureDefaultRoles();

  const { data: existingProfile, error: fetchError } = await client
    .from("usuario")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (fetchError && !isNotFoundError(fetchError)) {
    throw toHttpError(fetchError);
  }

  const lastLogin = new Date().toISOString();

  if (!existingProfile) {
    const payload = {
      id: authUser.id,
      email: authUser.email ?? null,
      username: authUser.email ?? null,
      persona_id: null,
      is_active: true,
      last_login: lastLogin
    };

    const { data: createdProfile, error: insertError } = await client
      .from("usuario")
      .insert(payload as never)
      .select("*")
      .single();

    const profile = assertNoError(insertError as PostgrestError | null, createdProfile);
    return res.status(201).json({ profile });
  }

  await client
    .from("usuario")
    .update({ last_login: lastLogin } as never)
    .eq("id", authUser.id);

  return res.json({ profile: existingProfile });
});

export const bootstrapController = {
  ensureUserProfile
};

export default bootstrapController;
