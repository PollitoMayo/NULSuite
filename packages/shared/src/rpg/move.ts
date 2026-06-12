import { parseCondition } from "./condition.js";
import {
  EffectCategory, MechanicEffect, EffectParamType,
  EFFECT_VALUE_LABELS, SUBJECT_LABELS, MECHANIC_PARAM_TYPE, formatCureAmount,
} from "./effects.js";
import { Stat, STAT_LABELS } from "./stat.js";

export {
  Subject, EffectCategory, MechanicEffect,
  EFFECT_VALUE_LABELS, EFFECTS_BY_CATEGORY, SUBJECT_LABELS,
} from "./effects.js";

export enum DamageStat {
  ATK = "ATK",
  SP_ATK = "SP_ATK",
}

export const DAMAGE_STAT_LABELS: Record<string, string> = {
  [DamageStat.ATK]: "ATK",
  [DamageStat.SP_ATK]: "SP.ATK",
};

export interface MoveEffectData {
  subject:  string;
  category: string;
  value:    string;
  param?:   string;
}

export interface MoveData {
  id: string;
  name: string;
  entry: string;
  type: string;
  category: string;
  hitDice: string;
  hitStat: string;
  hitCondition: string;
  damageDice: string;
  damageStat: string;
  effectDice: string;
  effectCondition: string;
  effects: MoveEffectData[];
}

// ---- Formatters ----

export function formatHitRoll(move: MoveData): string {
  if (!move.hitDice && !move.hitCondition) return "";
  const stat = STAT_LABELS[move.hitStat?.toUpperCase()] ?? move.hitStat ?? STAT_LABELS[Stat.SPD];
  const dice = move.hitDice ? `🎯 1d${move.hitDice} + ${stat}` : "";
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
  const cat  = effect.category?.toUpperCase();
  if (cat === EffectCategory.FIELD_STATUS || cat === EffectCategory.FIELD_WEATHER) return `Activa ${what}`;
  if (effect.value?.toUpperCase() === MechanicEffect.PRIORITY) return `⚡ Ataca primero`;
  const who = SUBJECT_LABELS[effect.subject?.toUpperCase()] ?? effect.subject ?? "?";
  const paramType = MECHANIC_PARAM_TYPE[effect.value?.toUpperCase()];
  if (paramType && effect.param) {
    const paramLabel = paramType === EffectParamType.CURE_AMOUNT
      ? formatCureAmount(effect.param)
      : (EFFECT_VALUE_LABELS[effect.param?.toUpperCase()] ?? effect.param);
    return `${who} - ${what}: ${paramLabel}`;
  }
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
  row: Record<string, unknown>,
  effectRows: Record<string, unknown>[]
): MoveData {
  return {
    id: rv(row, "id"),
    name: rv(row, "name"),
    entry: rv(row, "entry"),
    type: rv(row, "type"),
    category: rv(row, "category"),
    hitDice: rv(row, "hitdice"),
    hitStat: rv(row, "hitstat") || STAT_LABELS[Stat.SPD],
    hitCondition: rv(row, "hitcondition"),
    damageDice: rv(row, "damagedice"),
    damageStat: rv(row, "damagestat"),
    effectDice: rv(row, "effectdice"),
    effectCondition: rv(row, "effectcondition"),
    effects: effectRows.map(er => ({
      subject:  rv(er, "effectsubject"),
      category: rv(er, "effectcategory"),
      value:    rv(er, "effectvalue"),
      param:    rv(er, "effectparam") || undefined,
    })),
  };
}
