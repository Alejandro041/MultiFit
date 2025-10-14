import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { getServiceRoleClient } from "../../config/supabase";
import { ensureClient } from "../common/crudFactory";
import { toHttpError } from "../../utils/supabase";
import { Database } from "../../types/database";

type MemberAccountPayload = {
  personaId?: string;
  email?: string;
  organizationId?: string;
  roleSlug?: string;
  roleName?: string;
  metadata?: Record<string, unknown>;
};

type RolRow = Database["public"]["Tables"]["rol"]["Row"];
type UsuarioInsert = Database["public"]["Tables"]["usuario"]["Insert"];
type UsuarioOrganizationInsert = Database["public"]["Tables"]["usuario_organization"]["Insert"];

type PersonaRow = Database["public"]["Tables"]["persona"]["Row"];

const generateTemporaryPassword = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789@$#";
  const bytes = randomBytes(24);
  let result = "";

  for (let i = 0; i < bytes.length && result.length < 12; i += 1) {
    const index = bytes[i] % alphabet.length;
    result += alphabet[index];
  }

  if (result.length < 12) {
    result = `${result}${Date.now().toString(36)}`;
  }

  return result.slice(0, 12);
};

export const memberAccountController = {
  invite: asyncHandler(async (req: Request, res: Response) => {
    const client = ensureClient(req.supabase);
    const adminClient = getServiceRoleClient();

    if (!adminClient) {
      throw new AppError("Servicio de autenticacion no disponible", 503);
    }

    const { personaId, email, organizationId, roleSlug, roleName, metadata } =
      req.body as MemberAccountPayload;

    if (!personaId) {
      throw new AppError("personaId requerido", 400);
    }
    if (!email) {
      throw new AppError("Email requerido", 400);
    }
    if (!organizationId) {
      throw new AppError("organizationId requerido", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const desiredRole = (roleSlug || roleName || "miembro").toLowerCase();

    const { data: personaRow, error: personaError } = await client
      .from("persona")
      .select("id, first_name, last_name, gym_id")
      .eq("id", personaId)
      .maybeSingle<PersonaRow>();

    if (personaError) {
      throw toHttpError(personaError);
    }

    if (!personaRow) {
      throw new AppError("La persona indicada no existe", 404);
    }

    const { data: existingPersonaUser, error: existingPersonaError } = await adminClient
      .from("usuario")
      .select("id")
      .eq("persona_id", personaId)
      .maybeSingle();

    if (existingPersonaError && existingPersonaError.code !== "PGRST116") {
      throw toHttpError(existingPersonaError);
    }

    if (existingPersonaUser) {
      throw new AppError("La persona ya tiene una cuenta creada", 409);
    }

    const { data: existingEmailUser, error: existingEmailError } = await adminClient
      .from("usuario")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingEmailError && existingEmailError.code !== "PGRST116") {
      throw toHttpError(existingEmailError);
    }

    if (existingEmailUser) {
      throw new AppError("Ya existe un usuario con ese email", 409);
    }

    const { data: roleBySlug, error: roleSlugError } = await adminClient
      .from("rol")
      .select("id, slug, name")
      .eq("slug", desiredRole)
      .maybeSingle<RolRow>();

    if (roleSlugError) {
      throw toHttpError(roleSlugError);
    }

    let roleId = roleBySlug?.id ?? null;

    if (!roleId) {
      const { data: roleByName, error: roleNameError } = await adminClient
        .from("rol")
        .select("id, slug, name")
        .ilike("name", desiredRole)
        .maybeSingle<RolRow>();

      if (roleNameError) {
        throw toHttpError(roleNameError);
      }

      roleId = roleByName?.id ?? null;
    }

    if (!roleId) {
      throw new AppError("Rol especificado no encontrado", 404);
    }

    const temporaryPassword = generateTemporaryPassword();

    let supabaseUserId: string | null = null;

    try {
      const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          personaId,
          organizationId,
          gymId: personaRow.gym_id,
          appRole: desiredRole,
          ...metadata
        }
      });

      if (createUserError) {
        throw new AppError(
          createUserError.message ?? "No se pudo crear el usuario",
          createUserError.status ?? 400
        );
      }

      supabaseUserId = createdUser.user?.id ?? null;

      if (!supabaseUserId) {
        throw new AppError("No se obtuvo identificador de usuario", 500);
      }

      const usuarioInsert: UsuarioInsert = {
        id: supabaseUserId,
        persona_id: personaId,
        username: null,
        email: normalizedEmail,
        is_active: true,
        last_login: null,
        created_at: null,
        updated_at: null
      };

      const { error: insertUserError } = await (adminClient as any)
        .from("usuario")
        .insert(usuarioInsert);

      if (insertUserError) {
        throw toHttpError(insertUserError);
      }

      const usuarioOrganizationInsert: UsuarioOrganizationInsert = {
        user_id: supabaseUserId,
        organization_id: organizationId,
        rol_id: roleId,
        is_active: true,
        created_at: null
      };

      const { error: linkError } = await (adminClient as any)
        .from("usuario_organization")
        .insert(usuarioOrganizationInsert);

      if (linkError) {
        throw toHttpError(linkError);
      }

      res.status(201).json({
        userId: supabaseUserId,
        email: normalizedEmail,
        temporaryPassword
      });
    } catch (error) {
      if (supabaseUserId) {
        try {
          await adminClient.auth.admin.deleteUser(supabaseUserId);
        } catch (_cleanupError) {
          // Ignorar errores al revertir la creacion del usuario
        }
      }
      throw error;
    }
  })
};

export default memberAccountController;
