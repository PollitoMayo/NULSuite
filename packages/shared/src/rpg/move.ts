import { parseCondition } from "./condition.js";
import {
  EffectCategory, Subject,
  EFFECT_VALUE_LABELS, EFFECTS_BY_CATEGORY, SUBJECT_LABELS,
} from "./ability.js";

export enum MoveCategory {
  PHYSICAL = "PHYSICAL",
  SPECIAL  = "SPECIAL",
  STATUS   = "STATUS",
}

export enum DamageStat {
  ATK    = "ATK",
  SP_ATK = "SP_ATK",
}

export const MOVE_CATEGORY_LABELS: Record<string, string> = {
  [MoveCategory.PHYSICAL]: "Físico",
  [MoveCategory.SPECIAL]:  "Especial",
  [MoveCategory.STATUS]:   "Estado",
};

export const DAMAGE_STAT_LABELS: Record<string, string> = {
  [DamageStat.ATK]:    "ATK",
  [DamageStat.SP_ATK]: "SP.ATK",
};

export const MOVE_CATEGORY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  [MoveCategory.PHYSICAL]: { bg: "#3a2010", color: "#f0a060", border: "#8a4010" },
  [MoveCategory.SPECIAL]:  { bg: "#1a1a3a", color: "#8080f0", border: "#3a3a8a" },
  [MoveCategory.STATUS]:   { bg: "#2a1a3a", color: "#c080f0", border: "#6a3a8a" },
};

export interface MoveEffectData {
  subject:  string;
  category: string;
  value:    string;
}

export interface MoveData {
  id:              string;
  name:            string;
  entry:           string;
  type:            string;
  category:        string;
  hitDice:         string;
  hitCondition:    string;
  damageDice:      string;
  damageStat:      string;
  effectDice:      string;
  effectCondition: string;
  effects:         MoveEffectData[];
}

// ---- Formatters ----

export function formatHitRoll(move: MoveData): string {
  if (!move.hitDice && !move.hitCondition) return "";
  const dice = move.hitDice ? `🎯 1d${move.hitDice}` : "";
  const cond = move.hitCondition ? parseCondition(move.hitCondition) : "";
  if (dice && cond) return `${dice} — ${cond}`;
  return dice || cond;
}

export function formatDamageRoll(move: MoveData): string {
  if (!move.damageDice) return "";
  const stat = DAMAGE_STAT_LABELS[move.damageStat] ?? move.damageStat;
  return stat ? `⚔️ 1d${move.damageDice} + ${stat}` : `⚔️ 1d${move.damageDice}`;
}

export function formatMoveEffectCondition(move: MoveData): string {
  if (!move.effectDice && !move.effectCondition) return "";
  const dice = move.effectDice ? `🎲 1d${move.effectDice}` : "";
  const cond = move.effectCondition ? parseCondition(move.effectCondition) : "";
  if (dice && cond) return `${dice} — ${cond}`;
  return dice || cond;
}

export function formatMoveEffect(effect: MoveEffectData): string {
  const what = EFFECT_VALUE_LABELS[effect.value?.toUpperCase()] ?? effect.value ?? "?";
  if (effect.category?.toUpperCase() === EffectCategory.FIELD_STATUS) return `Activa ${what}`;
  const who = SUBJECT_LABELS[effect.subject?.toUpperCase()] ?? effect.subject ?? "?";
  return `${who} - ${what}`;
}

// ---- Parse from raw sheet row ----

function rv(row: Record<string, unknown>, key: string): string {
  const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
  const v = found ? row[found] : "";
  if (!v || typeof v === "object") return "";
  return String(v);
}

export function parseMoveData(
  row:        Record<string, unknown>,
  effectRows: Record<string, unknown>[]
): MoveData {
  return {
    id:              rv(row, "id"),
    name:            rv(row, "name"),
    entry:           rv(row, "entry"),
    type:            rv(row, "type"),
    category:        rv(row, "category"),
    hitDice:         rv(row, "hitdice"),
    hitCondition:    rv(row, "hitcondition"),
    damageDice:      rv(row, "damagedice"),
    damageStat:      rv(row, "damagestat"),
    effectDice:      rv(row, "effectdice"),
    effectCondition: rv(row, "effectcondition"),
    effects: effectRows.map(er => ({
      subject:  rv(er, "effectsubject"),
      category: rv(er, "effectcategory"),
      value:    rv(er, "effectvalue"),
    })),
  };
}

export { EffectCategory, Subject, EFFECT_VALUE_LABELS, EFFECTS_BY_CATEGORY, SUBJECT_LABELS };
