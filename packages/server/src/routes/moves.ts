import type { FastifyInstance } from "fastify";
import type { ApiResponse, MoveRequest } from "@nul/shared";
import { parseMoveData } from "@nul/shared";
import { getSheetData, appendRow, appendRows, updateRow, deleteRow, deleteRows } from "../services/sheets.js";

const MOVES        = "MOVES";
const MOVE_EFFECTS = "MOVE_EFFECTS";

function colKey(row: Record<string, unknown>, key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  const v = found ? row[found] : "";
  if (!v || typeof v === "object") return "";
  return String(v);
}

function buildEffectsMap(effectRows: Record<string, unknown>[]): Map<string, Record<string, unknown>[]> {
  const map = new Map<string, Record<string, unknown>[]>();
  effectRows.forEach((row) => {
    const id = colKey(row, "moveid").toLowerCase();
    if (!id) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(row);
  });
  return map;
}

function moveToRow(b: MoveRequest): (string | null)[] {
  return [b.id, b.name, b.entry, b.type, b.category,
          b.hitDice, b.hitStat, b.hitCondition, b.damageDice, b.damageStat,
          b.effectDice, b.effectCondition];
}

export default async function movesRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  // ---- LIST ----
  app.get("/moves", auth, async (_req, reply) => {
    const [moveSheet, effectSheet] = await Promise.all([
      getSheetData(MOVES),
      getSheetData(MOVE_EFFECTS),
    ]);
    const effectsMap = buildEffectsMap(effectSheet.rows as Record<string, unknown>[]);
    const data = moveSheet.rows.map((row) => {
      const id = colKey(row as Record<string, unknown>, "id").toLowerCase();
      return parseMoveData(row as Record<string, unknown>, effectsMap.get(id) ?? []);
    });
    return reply.send({ success: true, data } satisfies ApiResponse<typeof data>);
  });

  // ---- CREATE ----
  app.post("/moves", auth, async (req, reply) => {
    const body = req.body as MoveRequest;
    await appendRow({ sheetName: MOVES, values: moveToRow(body) });
    if (body.effects.length > 0) {
      await appendRows(MOVE_EFFECTS, body.effects.map((e) => [body.id, e.subject, e.category, e.value, e.param ?? ""]));
    }
    return reply.code(201).send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- UPDATE ----
  app.put<{ Params: { id: string } }>("/moves/:id", auth, async (req, reply) => {
    const { id } = req.params;
    const body = req.body as MoveRequest;

    const [moveSheet, effectSheet] = await Promise.all([
      getSheetData(MOVES),
      getSheetData(MOVE_EFFECTS),
    ]);

    const moveIdx = moveSheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (moveIdx === -1) return reply.code(404).send({ success: false, error: "Move not found" });

    const effectIndices = effectSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "moveid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    await updateRow({ sheetName: MOVES, rowIndex: moveIdx, values: moveToRow(body) });
    await deleteRows(MOVE_EFFECTS, effectIndices);
    if (body.effects.length > 0) {
      await appendRows(MOVE_EFFECTS, body.effects.map((e) => [body.id, e.subject, e.category, e.value, e.param ?? ""]));
    }
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });

  // ---- DELETE ----
  app.delete<{ Params: { id: string } }>("/moves/:id", auth, async (req, reply) => {
    const { id } = req.params;

    const [moveSheet, effectSheet, charSheet] = await Promise.all([
      getSheetData(MOVES),
      getSheetData(MOVE_EFFECTS),
      getSheetData("CHARACTERS"),
    ]);

    const moveIdx = moveSheet.rows.findIndex(
      (r) => colKey(r as Record<string, unknown>, "id").toLowerCase() === id.toLowerCase()
    );
    if (moveIdx === -1) return reply.code(404).send({ success: false, error: "Move not found" });

    const usedBy = charSheet.rows
      .filter((r) => colKey(r as Record<string, unknown>, "moveset")
        .split(",").map((m) => m.trim().toLowerCase()).includes(id.toLowerCase()))
      .map((r) => colKey(r as Record<string, unknown>, "name"))
      .filter(Boolean);
    if (usedBy.length > 0)
      return reply.code(409).send({ success: false, error: `En uso por: ${usedBy.join(", ")}` });

    const effectIndices = effectSheet.rows.reduce<number[]>((acc, r, i) => {
      if (colKey(r as Record<string, unknown>, "moveid").toLowerCase() === id.toLowerCase()) acc.push(i);
      return acc;
    }, []);

    await deleteRow(MOVES, moveIdx);
    await deleteRows(MOVE_EFFECTS, effectIndices);
    return reply.send({ success: true } satisfies ApiResponse<void>);
  });
}
