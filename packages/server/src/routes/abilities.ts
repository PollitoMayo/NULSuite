import type { FastifyInstance } from "fastify";
import type { ApiResponse, AbilityRequest } from "@nul/shared";
import { parseAbilityData } from "@nul/shared";
import { getSheetData, appendRow, appendRows, updateRow, deleteRow, deleteRows } from "../services/sheets.js";

const ABILITIES = "ABILITIES";
const EFFECTS   = "EFFECTS";
const TRIGGERS  = "ABILITY_TRIGGERS";

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
  // Columns: Id | Name | Entry | TriggerEvent | TriggerSubject | TriggerParam | EffectDice | EffectCondition
  // Trigger columns kept as empty — triggers are now stored in ABILITY_TRIGGERS sheet
  return [b.id, b.name, b.entry, null, null, null, b.effectDice, b.effectCondition];
}

function buildTriggersMap(rows: Record<string, unknown>[]): Map<string, Record<string, unknown>[]> {
  const map = new Map<string, Record<string, unknown>[]>();
  rows.forEach((row) => {
    const id = colKey(row, "abilityid").toLowerCase();
    if (!id) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(row);
  });
  return map;
}

export default async function abilitiesRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  // ---- LIST ----
  app.get("/abilities", auth, async (_req, reply) => {
    const [abilitySheet, effectSheet, triggerSheet] = await Promise.all([
      getSheetData(ABILITIES),
      getSheetData(EFFECTS),
      getSheetData(TRIGGERS),
    ]);
    const effectsMap  = buildEffectsMap(effectSheet.rows as Record<string, unknown>[]);
    const triggersMap = buildTriggersMap(triggerSheet.rows as Record<string, unknown>[]);
    const data = abilitySheet.rows.map((row) => {
      const id = colKey(row as Record<string, unknown>, "id").toLowerCase();
      return parseAbilityData(row as Record<string, unknown>, effectsMap.get(id) ?? [], triggersMap.get(id) ?? []);
    });
    return reply.send({ success: true, data } satisfies ApiResponse<typeof data>);
  });

  // ---- CREATE ----
  app.post("/abilities", auth, async (req, reply) => {
    const body = req.body as AbilityRequest;
    await appendRow({ sheetName: ABILITIES, values: abilityToRow(body) });
    if (body.triggers.length > 0) {
      await appendRows(TRIGGERS, body.triggers.map((t) => [body.id, t.event, t.subject, t.param]));
    }
    if (body.effects.length > 0) {
      await appendRows(EFFECTS, body.effects.map((e) => [body.id, e.subject, e.category, e.value]));
    }
    return reply.code(201).send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- UPDATE ----
  app.put<{ Params: { id: string } }>("/abilities/:id", auth, async (req, reply) => {
    const { id } = req.params;
    const body = req.body as AbilityRequest;

    const [abilitySheet, effectSheet, triggerSheet] = await Promise.all([
      getSheetData(ABILITIES),
      getSheetData(EFFECTS),
      getSheetData(TRIGGERS),
    ]);

    const abilityIdx = abilitySheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (abilityIdx === -1) return reply.code(404).send({ success: false, error: "Ability not found" });

    const effectIndices = effectSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "abilityid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    const triggerIndices = triggerSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "abilityid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    await updateRow({ sheetName: ABILITIES, rowIndex: abilityIdx, values: abilityToRow(body) });
    await deleteRows(TRIGGERS, triggerIndices);
    if (body.triggers.length > 0) {
      await appendRows(TRIGGERS, body.triggers.map((t) => [body.id, t.event, t.subject, t.param]));
    }
    await deleteRows(EFFECTS, effectIndices);
    if (body.effects.length > 0) {
      await appendRows(EFFECTS, body.effects.map((e) => [body.id, e.subject, e.category, e.value]));
    }
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- DELETE ----
  app.delete<{ Params: { id: string } }>("/abilities/:id", auth, async (req, reply) => {
    const { id } = req.params;

    const [abilitySheet, effectSheet, triggerSheet] = await Promise.all([
      getSheetData(ABILITIES),
      getSheetData(EFFECTS),
      getSheetData(TRIGGERS),
    ]);

    const abilityIdx = abilitySheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (abilityIdx === -1) return reply.code(404).send({ success: false, error: "Ability not found" });

    const effectIndices = effectSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "abilityid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    const triggerIndices = triggerSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "abilityid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    await deleteRow(ABILITIES, abilityIdx);
    await deleteRows(EFFECTS, effectIndices);
    await deleteRows(TRIGGERS, triggerIndices);
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });
}
