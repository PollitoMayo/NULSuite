import type { FastifyInstance } from "fastify";
import type { ApiResponse, ArchetypeRequest } from "@nul/shared";
import { parseArchetypeData } from "@nul/shared";
import { getSheetData, appendRow, updateRow, deleteRow } from "../services/sheets.js";

const ARCHETYPES = "ARCHETYPES";

function colKey(row: Record<string, unknown>, key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  const v = found ? row[found] : "";
  if (!v || typeof v === "object") return "";
  return String(v);
}

function archetypeToRow(b: ArchetypeRequest): (string | boolean | null)[] {
  return [b.id, b.isPublic, b.emoji, b.name, b.hp, b.atk, b.def, b.spAtk, b.spDef, b.spd];
}

export default async function archetypesRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  // ---- LIST ----
  app.get("/archetypes", auth, async (_req, reply) => {
    const sheet = await getSheetData(ARCHETYPES);
    const data = sheet.rows.map((row) => parseArchetypeData(row as Record<string, unknown>));
    return reply.send({ success: true, data } satisfies ApiResponse<typeof data>);
  });

  // ---- CREATE ----
  app.post("/archetypes", auth, async (req, reply) => {
    const body = req.body as ArchetypeRequest;
    await appendRow({ sheetName: ARCHETYPES, values: archetypeToRow(body) });
    return reply.code(201).send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- UPDATE ----
  app.put<{ Params: { id: string } }>("/archetypes/:id", auth, async (req, reply) => {
    const { id } = req.params;
    const body = req.body as ArchetypeRequest;

    const sheet = await getSheetData(ARCHETYPES);
    const idx = sheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (idx === -1) return reply.code(404).send({ success: false, error: "Archetype not found" });

    await updateRow({ sheetName: ARCHETYPES, rowIndex: idx, values: archetypeToRow(body) });
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- DELETE ----
  app.delete<{ Params: { id: string } }>("/archetypes/:id", auth, async (req, reply) => {
    const { id } = req.params;

    const sheet = await getSheetData(ARCHETYPES);
    const idx = sheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (idx === -1) return reply.code(404).send({ success: false, error: "Archetype not found" });

    await deleteRow(ARCHETYPES, idx);
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });
}
