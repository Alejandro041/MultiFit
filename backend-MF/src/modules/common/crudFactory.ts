import { TypedSupabaseClient } from "../../config/supabase";
import { Database } from "../../types/database";
import { AppError } from "../../utils/errors";
import { assertNoError } from "../../utils/supabase";

export type TableName = keyof Database["public"]["Tables"];

type TableConfig<TName extends TableName> = {
  table: TName;
  idColumn?: keyof Database["public"]["Tables"][TName]["Row"];
};

type TableDefinition<TName extends TableName> = Database["public"]["Tables"][TName];

export type CrudModel<TName extends TableName> = {
  list(client: TypedSupabaseClient): Promise<TableDefinition<TName>["Row"][]>;
  getById(client: TypedSupabaseClient, id: string): Promise<TableDefinition<TName>["Row"]>;
  create(
    client: TypedSupabaseClient,
    payload: TableDefinition<TName>["Insert"]
  ): Promise<TableDefinition<TName>["Row"]>;
  update(
    client: TypedSupabaseClient,
    id: string,
    payload: TableDefinition<TName>["Update"]
  ): Promise<TableDefinition<TName>["Row"]>;
  remove(client: TypedSupabaseClient, id: string): Promise<void>;
};

export const createCrudModel = <TName extends TableName>(
  config: TableConfig<TName>
): CrudModel<TName> => {
  const tableName = config.table as string;
  const idColumn = (config.idColumn ?? "id") as string;

  return {
    async list(client) {
      const table = client.from(tableName) as any;
      const { data, error } = await table.select("*");

      const rows = assertNoError<any[]>(error as any, data as any);
      return rows as TableDefinition<TName>["Row"][];
    },

    async getById(client, id) {
      const table = client.from(tableName) as any;
      const { data, error } = await table
        .select("*")
        .eq(idColumn, id)
        .maybeSingle();

      const row = assertNoError<any>(error as any, (data ?? null) as any);
      return row as TableDefinition<TName>["Row"];
    },

    async create(client, payload) {
      const table = client.from(tableName) as any;
      const { data, error } = await table
        .insert(payload as unknown as Record<string, unknown>)
        .select("*")
        .single();

      const row = assertNoError<any>(error as any, data as any);
      return row as TableDefinition<TName>["Row"];
    },

    async update(client, id, payload) {
      const table = client.from(tableName) as any;
      const { data, error } = await table
        .update(payload as unknown as Record<string, unknown>)
        .eq(idColumn, id)
        .select("*")
        .single();

      const row = assertNoError<any>(error as any, data as any);
      return row as TableDefinition<TName>["Row"];
    },

    async remove(client, id) {
      const table = client.from(tableName) as any;
      const { data, error } = await table
        .delete()
        .eq(idColumn, id)
        .select("*")
        .single();

      assertNoError<any>(error as any, data as any);
    }
  };
};

export const ensureClient = (client: TypedSupabaseClient | undefined) => {
  if (!client) {
    throw new AppError("Supabase client not found on request", 500);
  }

  return client;
};
