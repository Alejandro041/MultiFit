import { TypedSupabaseClient } from "../../config/supabase";
import { Database } from "../../types/database";
import { assertNoError } from "../../utils/supabase";

export type UsuarioOrganizationRow = Database["public"]["Tables"]["usuario_organization"]["Row"];
export type UsuarioOrganizationInsert = Database["public"]["Tables"]["usuario_organization"]["Insert"];
export type UsuarioOrganizationUpdate = Database["public"]["Tables"]["usuario_organization"]["Update"];

export const usuarioOrganizationModel = {
  async list(client: TypedSupabaseClient) {
    const table = client.from("usuario_organization") as any;
    const { data, error } = await table.select("*");
    const rows = assertNoError<any[]>(error as any, data as any);
    return rows as UsuarioOrganizationRow[];
  },

  async get(client: TypedSupabaseClient, userId: string, organizationId: string) {
    const table = client.from("usuario_organization") as any;
    const { data, error } = await table
      .select("*")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    const row = assertNoError<any>(error as any, (data ?? null) as any);
    return row as UsuarioOrganizationRow;
  },

  async create(client: TypedSupabaseClient, payload: UsuarioOrganizationInsert) {
    const table = client.from("usuario_organization") as any;
    const { data, error } = await table
      .insert(payload as unknown as Record<string, unknown>)
      .select("*")
      .single();

    const row = assertNoError<any>(error as any, data as any);
    return row as UsuarioOrganizationRow;
  },

  async update(
    client: TypedSupabaseClient,
    userId: string,
    organizationId: string,
    payload: UsuarioOrganizationUpdate
  ) {
    const table = client.from("usuario_organization") as any;
    const { data, error } = await table
      .update(payload as unknown as Record<string, unknown>)
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .select("*")
      .single();

    const row = assertNoError<any>(error as any, data as any);
    return row as UsuarioOrganizationRow;
  },

  async remove(client: TypedSupabaseClient, userId: string, organizationId: string) {
    const table = client.from("usuario_organization") as any;
    const { data, error } = await table
      .delete()
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .select("*")
      .single();

    assertNoError<any>(error as any, data as any);
  }
};
