import type { FastifyInstance } from "fastify";
import type { ApiResponse } from "@nul/shared";
import { getSheetData } from "../services/sheets.js";

export interface PokemonEntry {
  name:  string;
  form:  string;
  type1: string;
  type2: string;
}

export default async function pokedexRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  app.get("/pokedex", auth, async (_req, reply) => {
    // Skip the first decorative row by starting range at A2
    const data = await getSheetData("POKEDEX!A2:F");

    const [, , nameKey, formKey, type1Key, type2Key] = data.headers;

    const entries: PokemonEntry[] = data.rows
      .map((row) => ({
        name:  String(row[nameKey]  ?? ""),
        form:  String(row[formKey]  ?? ""),
        type1: String(row[type1Key] ?? ""),
        type2: String(row[type2Key] ?? ""),
      }))
      .filter((e) => e.name);

    return reply.send({ success: true, data: entries } satisfies ApiResponse<PokemonEntry[]>);
  });
}
