import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { toHttpError } from "../../utils/supabase";
import { createCrudController } from "../common/controllerFactory";
import { ensureClient } from "../common/crudFactory";
import { organizationsModel } from "./model";

const baseController = createCrudController({
  table: "organizations",
  model: organizationsModel
});

export const organizationsController = {
  ...baseController,
  create: asyncHandler(async (req, res) => {
    const client = ensureClient(req.supabase);
    const authUserId = req.authUser?.id;

    if (!authUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      throw new AppError("Nombre de organizacion requerido", 400);
    }

    const insertPayload = {
      name,
      legal_name: body.legal_name ?? null,
      tax_id: body.tax_id ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      address: body.address ?? null,
      status: body.status ?? "active",
      owner_id: authUserId
    };

    const { data, error } = await client
      .from("organizations")
      .insert(insertPayload as never)
      .select("*")
      .single();

    if (error) {
      throw toHttpError(error);
    }

    res.status(201).json(data);
  }),
  list: asyncHandler(async (req, res) => {
    const client = ensureClient(req.supabase);
    const authUserId = req.authUser?.id;

    if (!authUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { data: membershipRows, error: membershipError } = await client
      .from("usuario_organization")
      .select("organization_id, is_active")
      .eq("user_id", authUserId);

    if (membershipError) {
      throw toHttpError(membershipError);
    }

    const membershipIds = new Set<string>();
    (membershipRows ?? []).forEach(
      (row: { organization_id?: string | null; is_active?: boolean | null } | null) => {
        const orgId = row?.organization_id ?? null;
        const isActive = row?.is_active ?? null;
        if (orgId && isActive !== false) {
          membershipIds.add(orgId);
        }
      }
    );

    let membershipOrganizations: Array<Record<string, unknown>> = [];

    if (membershipIds.size > 0) {
      const { data, error } = await client
        .from("organizations")
        .select("*")
        .in("id", Array.from(membershipIds));

      if (error) {
        throw toHttpError(error);
      }

      membershipOrganizations = Array.isArray(data) ? data : [];
    }

    const { data: ownedOrganizations, error: ownedError } = await client
      .from("organizations")
      .select("*")
      .eq("owner_id", authUserId);

    if (ownedError) {
      throw toHttpError(ownedError);
    }

    const combined = [...membershipOrganizations, ...(ownedOrganizations ?? [])];
    const uniqueById = new Map<string, Record<string, unknown>>();

    combined.forEach((organization: any) => {
      if (organization?.id && !uniqueById.has(organization.id)) {
        uniqueById.set(organization.id, organization);
      }
    });

    res.json(Array.from(uniqueById.values()));
  })
};
