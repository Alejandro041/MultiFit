import { Request, Response } from "express";
import { ensureClient } from "../common/crudFactory";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { usuarioOrganizationModel } from "./model";

const ensureBodyObject = (body: unknown) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Request body must be an object", 400);
  }

  return body as Record<string, unknown>;
};

const getCompositeParams = (req: Request) => {
  const { userId, organizationId } = req.params;

  if (!userId || !organizationId) {
    throw new AppError("Missing composite key parameters", 400);
  }

  return { userId, organizationId };
};

export const usuarioOrganizationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const client = ensureClient(req.supabase);
    const items = await usuarioOrganizationModel.list(client);
    res.json(items);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const client = ensureClient(req.supabase);
    const { userId, organizationId } = getCompositeParams(req);
    const item = await usuarioOrganizationModel.get(client, userId, organizationId);
    res.json(item);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const client = ensureClient(req.supabase);
    const payload = ensureBodyObject(req.body);
    const created = await usuarioOrganizationModel.create(client, payload as never);
    res.status(201).json(created);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const client = ensureClient(req.supabase);
    const { userId, organizationId } = getCompositeParams(req);
    const payload = ensureBodyObject(req.body);
    const updated = await usuarioOrganizationModel.update(
      client,
      userId,
      organizationId,
      payload as never
    );
    res.json(updated);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const client = ensureClient(req.supabase);
    const { userId, organizationId } = getCompositeParams(req);
    await usuarioOrganizationModel.remove(client, userId, organizationId);
    res.status(204).send();
  })
};
