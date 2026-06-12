import { parseCondition } from "./condition.js";
import {
  Subject, EffectCategory, MechanicEffect, MECHANIC_PARAM_TYPE,
  SUBJECT_LABELS, EFFECT_VALUE_LABELS,
  TRIGGER_FORMAT,
} from "./effects.js";

export {
  Subject, EffectCategory,
  StatusEffect, BuffDebuff, ConditionEffect, FieldStatus, MechanicEffect, CureEffect,
  AnyEffect,
  STAT_STAGE_MAX, STAT_STAGE_MIN,
  SUBJECT_LABELS, EFFECT_VALUE_LABELS, EFFECTS_BY_CATEGORY, EFFECT_CATEGORY_STYLE,
} from "./effects.js";

export interface AbilityEffectData {
  subject:  string;
  category: string;
  value:    string;
  param?:   string;
}

export interface AbilityTriggerData {
  event:   string;
  subject: string;
  param:   string;
}

export interface AbilityData {
  id:              string;
  name:            string;
  entry:           string;
  triggers:        AbilityTriggerData[];
  effectDice:      string;
  effectCondition: string;
  effects:         AbilityEffectData[];
}

// ---- Formatters ----

export function formatTrigger(trigger: AbilityTriggerData): string {
  const event = trigger.event?.toUpperCase() ?? "";
  const fn = TRIGGER_FORMAT[event];
  if (!fn) return trigger.event ?? "";
  const who = SUBJECT_LABELS[trigger.subject?.toUpperCase()] ?? trigger.subject ?? "uno mismo";
  return fn(who, trigger.param ?? "");
}

export function formatEffect(effect: AbilityEffectData): string {
  const what = EFFECT_VALUE_LABELS[effect.value?.toUpperCase()] ?? effect.value ?? "?";
  const cat  = effect.category?.toUpperCase();
  if (cat === EffectCategory.FIELD_STATUS || cat === EffectCategory.FIELD_WEATHER) return `Activa ${what}`;
  if (effect.value?.toUpperCase() === MechanicEffect.PRIORITY) {
    const who = SUBJECT_LABELS[effect.subject?.toUpperCase()] ?? effect.subject ?? "?";
    return `⚡ ${who} ataca primero`;
  }
  const who = SUBJECT_LABELS[effect.subject?.toUpperCase()] ?? effect.subject ?? "?";
  if (MECHANIC_PARAM_TYPE[effect.value?.toUpperCase()] && effect.param) {
    const paramLabel = EFFECT_VALUE_LABELS[effect.param?.toUpperCase()] ?? effect.param;
    return `${who} - ${what}: ${paramLabel}`;
  }
  return `${who} - ${what}`;
}

export function formatEffectCondition(ability: AbilityData): string {
  if (!ability.effectDice && !ability.effectCondition) return "";
  const dice = ability.effectDice ? `🎲 1d${ability.effectDice}` : "";
  const cond = ability.effectCondition ? parseCondition(ability.effectCondition) : "";
  if (dice && cond) return `${dice} — ${cond}`;
  return dice || cond;
}

// ---- Parse from raw sheet row ----

function rv(row: Record<string, unknown>, key: string): string {
  const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
  const v = found ? row[found] : "";
  if (!v || typeof v === "object") return "";
  return String(v);
}

export function parseAbilityData(
  row:         Record<string, unknown>,
  effectRows:  Record<string, unknown>[],
  triggerRows: Record<string, unknown>[] = [],
): AbilityData {
  return {
    id:              rv(row, "id"),
    name:            rv(row, "name"),
    entry:           rv(row, "entry"),
    triggers: triggerRows.map(tr => ({
      event:   rv(tr, "triggerevent"),
      subject: rv(tr, "triggersubject"),
      param:   rv(tr, "triggerparam"),
    })),
    effectDice:      rv(row, "effectdice"),
    effectCondition: rv(row, "effectcondition"),
    effects: effectRows.map(er => ({
      subject:  rv(er, "effectsubject"),
      category: rv(er, "effectcategory"),
      value:    rv(er, "effectvalue"),
      param:    rv(er, "effectparam") || undefined,
    })),
  };
}
