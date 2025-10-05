import { PostgrestError } from "@supabase/supabase-js";
import { asyncHandler } from "../../utils/asyncHandler";
import { toHttpError } from "../../utils/supabase";
import { getServiceRoleClient } from "../../config/supabase";
import { ensureClient } from "../common/crudFactory";
import { createCrudController } from "../common/controllerFactory";
import { rolModel } from "./model";

const baseController = createCrudController({
  table: "rol",
  model: rolModel
});

const list = asyncHandler(async (req, res) => {
  const serviceClient = getServiceRoleClient();
  const client = serviceClient ?? ensureClient(req.supabase);

  const { data, error } = await client.from("rol").select("*").order("name");

  if (error) {
    throw toHttpError(error as PostgrestError);
  }

  res.json(data ?? []);
});

export const rolController = {
  ...baseController,
  list
};
