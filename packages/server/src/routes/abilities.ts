import type { FastifyInstance } from "fastify";
import type { ApiResponse, AbilityRequest } from "@nul/shared";
import { parseAbilityData } from "@nul/shared";
import { getSheetData, appendRow, appendRows, updateRow, deleteRow, deleteRows } from "../services/sheets.js";

const ABILITIES = "ABILITIES";
const EFFECTS   = "EFFECTS";

function colKey(row: Record<string, unknown>, key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  const v = found ? row[found] : "";
  if (!v || typeof v === "object") return "";
  return String(v);
}

function buildEffectsMap(effectRows: Record<string, unknown>[]): Map<string, Record<string, unknown>[]> {
  const map = new Map<string, Record<string, unknown>[]>();
  effectRows.forEach((row) => {
    const id = colKey(row, "abilityid").toLowerCase();
    if (!id) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(row);
  });
  return map;
}

function abilityToRow(b: AbilityRequest): (string | null)[] {
  return [b.id, b.name, b.entry, b.triggerEvent, b.triggerSubject,
          b.triggerParam, b.effectDice, b.effectCondition];
}

export default async function abilitiesRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  // ---- LIST ----
  app.get("/abilities", auth, async (_req, reply) => {
    const [abilitySheet, effectSheet] = await Promise.all([
      getSheetData(ABILITIES),
      getSheetData(EFFECTS),
    ]);
    const effectsMap = buildEffectsMap(effectSheet.rows as Record<string, unknown>[]);
    const data = abilitySheet.rows.map((row) => {
      const id = colKey(row as Record<string, unknown>, "id").toLowerCase();
      return parseAbilityData(row as Record<string, unknown>, effectsMap.get(id) ?? []);
    });
    return reply.send({ success: true, data } satisfies ApiResponse<typeof data>);
  });

  // ---- CREATE ----
  app.post("/abilities", auth, async (req, reply) => {
    const body = req.body as AbilityRequest;
    await appendRow({ sheetName: ABILITIES, values: abilityToRow(body) });
    if (body.effects.length > 0) {
      await appendRows(EFFECTS, body.effects.map((e) => [body.id, e.subject, e.category, e.value]));
    }
    return reply.code(201).send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- UPDATE ----
  app.put<{ Params: { id: string } }>("/abilities/:id", auth, async (req, reply) => {
    const { id } = req.params;
    const body = req.body as AbilityRequest;

    const [abilitySheet, effectSheet] = await Promise.all([
      getSheetData(ABILITIES),
      getSheetData(EFFECTS),
    ]);

    const abilityIdx = abilitySheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (abilityIdx === -1) return reply.code(404).send({ success: false, error: "Ability not found" });

    const effectIndices = effectSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "abilityid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    await updateRow({ sheetName: ABILITIES, rowIndex: abilityIdx, values: abilityToRow(body) });
    await deleteRows(EFFECTS, effectIndices);
    if (body.effects.length > 0) {
      await appendRows(EFFECTS, body.effects.map((e) => [body.id, e.subject, e.category, e.value]));
    }
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- DELETE ----
  app.delete<{ Params: { id: string } }>("/abilities/:id", auth, async (req, reply) => {
    const { id } = req.params;

    const [abilitySheet, effectSheet] = await Promise.all([
      getSheetData(ABILITIES),
      getSheetData(EFFECTS),
    ]);

    const abilityIdx = abilitySheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (abilityIdx === -1) return reply.code(404).send({ success: false, error: "Ability not found" });

    const effectIndices = effectSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "abilityid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    await deleteRow(ABILITIES, abilityIdx);
    await deleteRows(EFFECTS, effectIndices);
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });
}
