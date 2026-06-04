import type { FastifyInstance } from "fastify";
import type { ApiResponse, CharacterSheetData, SheetRow, EnrichedAbility, EnrichedMove } from "@nul/shared";
import { getSheetData } from "../services/sheets.js";

function colKey(row: SheetRow, key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  return String(found ? (row[found] ?? "") : "");
}

async function buildEnriched(filterDiscord?: string): Promise<CharacterSheetData> {
  const [charSheet, abilitySheet, effectSheet, moveSheet, moveEffectSheet, archetypeSheet] = await Promise.all([
    getSheetData("CHARACTERS"),
    getSheetData("ABILITIES"),
    getSheetData("EFFECTS"),
    getSheetData("MOVES"),
    getSheetData("MOVE_EFFECTS"),
    getSheetData("ARCHETYPES"),
  ]);

  // ability effects map: abilityId -> effect rows
  const effectsMap = new Map<string, SheetRow[]>();
  effectSheet.rows.forEach((row) => {
    const id = colKey(row, "abilityid").toLowerCase();
    if (!id) return;
    if (!effectsMap.has(id)) effectsMap.set(id, []);
    effectsMap.get(id)!.push(row);
  });

  // ability map: abilityId -> ability row + effects
  const abilityMap = new Map<string, EnrichedAbility>();
  abilitySheet.rows.forEach((row) => {
    const id = colKey(row, "id").toLowerCase();
    if (id) abilityMap.set(id, { ...row, effects: effectsMap.get(id) ?? [] } as EnrichedAbility);
  });

  // move effects map: moveId -> effect rows
  const moveEffectsMap = new Map<string, SheetRow[]>();
  moveEffectSheet.rows.forEach((row) => {
    const id = colKey(row, "moveid").toLowerCase();
    if (!id) return;
    if (!moveEffectsMap.has(id)) moveEffectsMap.set(id, []);
    moveEffectsMap.get(id)!.push(row);
  });

  // move map: moveId -> move row + effects
  const moveMap = new Map<string, EnrichedMove>();
  moveSheet.rows.forEach((row) => {
    const id = colKey(row, "id").toLowerCase();
    if (id) moveMap.set(id, { ...row, effects: moveEffectsMap.get(id) ?? [] } as EnrichedMove);
  });

  // archetype map: name -> raw row
  const archetypeMap = new Map<string, SheetRow>();
  archetypeSheet.rows.forEach((row) => {
    const name = colKey(row, "name").toLowerCase();
    if (name) archetypeMap.set(name, row);
  });

  const sourceRows = filterDiscord
    ? charSheet.rows.filter((r) => colKey(r, "discord").toLowerCase() === filterDiscord.toLowerCase())
    : charSheet.rows;

  const rows = sourceRows.map((row) => {
    const abilityId    = colKey(row, "ability").toLowerCase();
    const archetypeName = colKey(row, "archetype").toLowerCase();
    const moveIds      = colKey(row, "moveset").split(",").map((m) => m.trim().toLowerCase()).filter(Boolean);
    const moves        = moveIds.map((id) => moveMap.get(id) ?? null).filter(Boolean) as EnrichedMove[];
    return {
      ...row,
      Ability:   abilityMap.get(abilityId) ?? null,
      Moves:     moves,
      Archetype: archetypeMap.get(archetypeName) ?? null,
    };
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
