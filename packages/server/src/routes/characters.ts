import type { FastifyInstance } from "fastify";
import type { ApiResponse, CharacterSheetData, SheetRow } from "@nul/shared";
import { getSheetData } from "../services/sheets.js";

function colKey(row: SheetRow, key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  return String(found ? (row[found] ?? "") : "");
}

async function buildEnriched(filterDiscord?: string): Promise<CharacterSheetData> {
  const [charSheet, abilitySheet] = await Promise.all([
    getSheetData("CHARACTERS"),
    getSheetData("ABILITIES"),
  ]);

  const abilityMap = new Map<string, SheetRow>();
  abilitySheet.rows.forEach((row) => {
    const id = colKey(row, "id").toLowerCase();
    if (id) abilityMap.set(id, row);
  });

  const sourceRows = filterDiscord
    ? charSheet.rows.filter((row) =>
        colKey(row, "discord").toLowerCase() === filterDiscord.toLowerCase()
      )
    : charSheet.rows;

  const rows = sourceRows.map((row) => {
    const abilityId = colKey(row, "ability").toLowerCase();
    return { ...row, Ability: abilityMap.get(abilityId) ?? null };
  });

  return { sheetName: "CHARACTERS", headers: charSheet.headers, rows };
}

export default async function charactersRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  app.get("/characters", auth, async (_req, reply) => {
    const data = await buildEnriched();
    return reply.send({ success: true, data } satisfies ApiResponse<CharacterSheetData>);
  });

  app.get<{ Params: { discord: string } }>(
    "/user/:discord/characters",
    auth,
    async (req, reply) => {
      const data = await buildEnriched(req.params.discord);
      return reply.send({ success: true, data } satisfies ApiResponse<CharacterSheetData>);
    }
  );
}
