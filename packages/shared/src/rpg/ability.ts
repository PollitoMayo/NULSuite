import { parseCondition } from "./condition.js";

export enum TriggerEvent {
  PASSIVE      = "PASSIVE",
  ON_STATUS    = "ON_STATUS",
  ON_SPECIFIC_STATUS = "ON_SPECIFIC_STATUS",
  START_BATTLE = "START_BATTLE",
  ON_DEFEATED  = "ON_DEFEATED",
  DMG_ATK      = "DMG_ATK",
  DMG_SPATK    = "DMG_SPATK",
  DMG_ANY      = "DMG_ANY",
  USE_MOVE     = "USE_MOVE",
  START_ROUND  = "START_ROUND",
  END_ROUND    = "END_ROUND",
  AFTER_ATTACK = "AFTER_ATTACK",
}

export enum Subject {
  SELF   = "SELF",
  TARGET = "TARGET",
  ALLY   = "ALLY",
  ENEMY  = "ENEMY",
  ALL    = "ALL",
  ALLY_ALL = "ALLY_ALL",
  ENEMY_ALL = "ENEMY_ALL",
  ANY = "ANY",
}

export enum EffectCategory {
  STATUS       = "STATUS",
  BUFF_DEBUFF  = "BUFF_DEBUFF",
  CONDITION    = "CONDITION",
  FIELD_STATUS = "FIELD_STATUS",
  CURE         = "CURE",
  MECHANIC     = "MECHANIC",
}

export enum StatusEffect {
  POISONED = "POISONED",
  FROZEN   = "FROZEN",
  BURNED   = "BURNED",
  SLEEP    = "SLEEP",
}

export enum BuffDebuff {
  ATK_UP      = "ATK+1",
  ATK_DOWN    = "ATK-1",
  DEF_UP      = "DEF+1",
  DEF_DOWN    = "DEF-1",
  SP_ATK_UP   = "SP_ATK+1",
  SP_ATK_DOWN = "SP_ATK-1",
  SP_DEF_UP   = "SP_DEF+1",
  SP_DEF_DOWN = "SP_DEF-1",
  SPD_UP      = "SPD+1",
  SPD_DOWN    = "SPD-1",
  ACC_UP      = "ACC+1",
  ACC_DOWN    = "ACC-1",
}

export enum ConditionEffect {
  INFATUATED = "INFATUATED",
  CONFUSED   = "CONFUSED",
  HALFLIFE   = "HALFLIFE",
  CURSED     = "CURSED",
}

export enum FieldStatus {
  RAIN             = "RAIN",
  SUN              = "SUN",
  SANDSTORM        = "SANDSTORM",
  HAIL             = "HAIL",
  TRICK_ROOM       = "TRICK_ROOM",
  ELECTRIC_TERRAIN = "ELECTRIC_TERRAIN",
  GRASSY_TERRAIN   = "GRASSY_TERRAIN",
  MISTY_TERRAIN    = "MISTY_TERRAIN",
  PSYCHIC_TERRAIN  = "PSYCHIC_TERRAIN",
  HEAL_BLOCK       = "HEAL_BLOCK",
}

export enum MechanicEffect {
  COPY_LAST_MOVE = "COPY_LAST_MOVE",
  PRIORITY       = "PRIORITY",
}

export enum CureEffect {
  ALL_STATUS       = "CURE_ALL_STATUS",
  CURE_POISON      = "CURE_POISON",
  CURE_FREEZE      = "CURE_FREEZE",
  CURE_BURN        = "CURE_BURN",
  CURE_SLEEP       = "CURE_SLEEP",
  ALL_CONDITIONS   = "CURE_ALL_CONDITIONS",
  CURE_INFATUATED  = "CURE_INFATUATED",
  CURE_CONFUSED    = "CURE_CONFUSED",
  CURE_CURSED      = "CURE_CURSED",
  CURE_ALL         = "CURE_ALL",
}

export type AnyEffect = StatusEffect | BuffDebuff | ConditionEffect | FieldStatus | CureEffect | MechanicEffect;

export const STAT_STAGE_MAX =  6;
export const STAT_STAGE_MIN = -6;

export interface AbilityEffectData {
  subject:  string;
  category: string;
  value:    string;
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

// ---- Labels for UI dropdowns ----

export const TRIGGER_EVENT_LABELS: Record<string, string> = {
  [TriggerEvent.PASSIVE]:      "Pasiva",
  [TriggerEvent.ON_STATUS]:    "Al tener un estado",
  [TriggerEvent.ON_SPECIFIC_STATUS]: "Al tener un estado específico",
  [TriggerEvent.START_BATTLE]: "Al iniciar la batalla",
  [TriggerEvent.ON_DEFEATED]:  "Al ser derrotado",
  [TriggerEvent.DMG_ATK]:      "Recibe daño físico (ATK)",
  [TriggerEvent.DMG_SPATK]:    "Recibe daño especial (SP.ATK)",
  [TriggerEvent.DMG_ANY]:      "Recibe cualquier daño",
  [TriggerEvent.USE_MOVE]:     "Usa un movimiento",
  [TriggerEvent.START_ROUND]:  "Inicio del turno",
  [TriggerEvent.END_ROUND]:    "Final del turno",
  [TriggerEvent.AFTER_ATTACK]: "Después de atacar",
};

export const SUBJECT_LABELS: Record<string, string> = {
  [Subject.SELF]:   "uno mismo",
  [Subject.TARGET]: "objetivo",
  [Subject.ALLY]:   "aliado",
  [Subject.ENEMY]:  "enemigo",
  [Subject.ALL]:    "todos",
  [Subject.ALLY_ALL]: "todos los aliados",
  [Subject.ENEMY_ALL]: "todos los enemigos",
  [Subject.ANY]: "cualquiera (aliado o enemigo)"
};

export const EFFECT_VALUE_LABELS: Record<string, string> = {
  [StatusEffect.POISONED]:           "Envenenado",
  [StatusEffect.FROZEN]:             "Congelado",
  [StatusEffect.BURNED]:             "Quemado",
  [StatusEffect.SLEEP]:              "Dormido",
  [BuffDebuff.ATK_UP]:               "ATK +1",
  [BuffDebuff.ATK_DOWN]:             "ATK -1",
  [BuffDebuff.DEF_UP]:               "DEF +1",
  [BuffDebuff.DEF_DOWN]:             "DEF -1",
  [BuffDebuff.SP_ATK_UP]:            "SP.ATK +1",
  [BuffDebuff.SP_ATK_DOWN]:          "SP.ATK -1",
  [BuffDebuff.SP_DEF_UP]:            "SP.DEF +1",
  [BuffDebuff.SP_DEF_DOWN]:          "SP.DEF -1",
  [BuffDebuff.SPD_UP]:               "SPD +1",
  [BuffDebuff.SPD_DOWN]:             "SPD -1",
  [ConditionEffect.INFATUATED]:      "Enamorado",
  [ConditionEffect.CONFUSED]:        "Confundido",
  [ConditionEffect.HALFLIFE]:        "Mitad de vida",
  [ConditionEffect.CURSED]:          "Maldito",
  [FieldStatus.RAIN]:                "Lluvia",
  [FieldStatus.SUN]:                 "Sol intenso",
  [FieldStatus.SANDSTORM]:           "Tormenta de arena",
  [FieldStatus.HAIL]:                "Granizo",
  [FieldStatus.TRICK_ROOM]:          "Sala trampa",
  [FieldStatus.ELECTRIC_TERRAIN]:    "Terreno eléctrico",
  [FieldStatus.GRASSY_TERRAIN]:      "Terreno gramíneo",
  [FieldStatus.MISTY_TERRAIN]:       "Terreno de niebla",
  [FieldStatus.PSYCHIC_TERRAIN]:     "Terreno psíquico",
  [FieldStatus.HEAL_BLOCK]:          "Bloqueo de curación",
  [CureEffect.ALL_STATUS]:           "Cura todos los estados",
  [CureEffect.CURE_POISON]:          "Cura Envenenamiento",
  [CureEffect.CURE_FREEZE]:          "Cura Congelación",
  [CureEffect.CURE_BURN]:            "Cura Quemadura",
  [CureEffect.CURE_SLEEP]:           "Cura Sueño",
  [CureEffect.ALL_CONDITIONS]:       "Cura todas las condiciones",
  [CureEffect.CURE_INFATUATED]:      "Cura Enamoramiento",
  [CureEffect.CURE_CONFUSED]:        "Cura Confusión",
  [CureEffect.CURE_CURSED]:          "Cura Maldición",
  [CureEffect.CURE_ALL]:             "Cura todo",
  [MechanicEffect.COPY_LAST_MOVE]:   "Copia el último movimiento",
  [MechanicEffect.PRIORITY]:         "Prioridad: ataca primero",
};

export const EFFECTS_BY_CATEGORY: Record<string, string[]> = {
  [EffectCategory.STATUS]:       Object.values(StatusEffect),
  [EffectCategory.BUFF_DEBUFF]:  Object.values(BuffDebuff),
  [EffectCategory.CONDITION]:    Object.values(ConditionEffect),
  [EffectCategory.FIELD_STATUS]: Object.values(FieldStatus),
  [EffectCategory.CURE]:         Object.values(CureEffect),
  [EffectCategory.MECHANIC]:     Object.values(MechanicEffect),
};

export const EFFECT_CATEGORY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  [EffectCategory.STATUS]:       { bg: "#3a1a1a", color: "#f08080", border: "#8a3a3a" },
  [EffectCategory.BUFF_DEBUFF]:  { bg: "#1a2a3a", color: "#80b0f0", border: "#3a5a8a" },
  [EffectCategory.CONDITION]:    { bg: "#2a1a3a", color: "#c080f0", border: "#6a3a8a" },
  [EffectCategory.FIELD_STATUS]: { bg: "#1a2e20", color: "#70d490", border: "#2a6a40" },
  [EffectCategory.CURE]:         { bg: "#1a2a2e", color: "#60d0e0", border: "#2a6a7a" },
  [EffectCategory.MECHANIC]:     { bg: "#2a2014", color: "#e0b860", border: "#7a5a20" },
};

export const TRIGGERS_WITH_SUBJECT = new Set<string>([
  TriggerEvent.ON_STATUS,
  TriggerEvent.ON_SPECIFIC_STATUS,
  TriggerEvent.DMG_ATK,
  TriggerEvent.DMG_SPATK,
  TriggerEvent.DMG_ANY,
  TriggerEvent.USE_MOVE,
  TriggerEvent.AFTER_ATTACK,
  TriggerEvent.ON_DEFEATED,
]);

// ---- Formatters ----

type TriggerFn = (subject: string, param: string) => string;

const TRIGGER_FORMAT: Record<string, TriggerFn> = {
  [TriggerEvent.PASSIVE]:      ()      => "Pasiva (siempre activa)",
  [TriggerEvent.ON_STATUS]:    (s)     => `Cuando ${s} tiene un estado`,
  [TriggerEvent.ON_SPECIFIC_STATUS]: (s, p) => `Cuando ${s} tiene ${p}`,
  [TriggerEvent.START_BATTLE]: ()      => "Al iniciar la batalla",
  [TriggerEvent.ON_DEFEATED]:  ()      => "Al ser derrotado",
  [TriggerEvent.DMG_ATK]:      (s)     => `Cuando ${s} recibe daño físico (ATK)`,
  [TriggerEvent.DMG_SPATK]:    (s)     => `Cuando ${s} recibe daño especial (SP.ATK)`,
  [TriggerEvent.DMG_ANY]:      (s)     => `Cuando ${s} recibe daño`,
  [TriggerEvent.USE_MOVE]:     (s, p)  => `Cuando ${s} usa ${p || "un movimiento"}`,
  [TriggerEvent.START_ROUND]:  ()      => "Al inicio del turno",
  [TriggerEvent.END_ROUND]:    ()      => "Al final del turno",
  [TriggerEvent.AFTER_ATTACK]: (s)     => `Después de que ${s} ataca`,
};

export function formatTrigger(trigger: AbilityTriggerData): string {
  const event = trigger.event?.toUpperCase() ?? "";
  const fn = TRIGGER_FORMAT[event];
  if (!fn) return trigger.event ?? "";
  const who = SUBJECT_LABELS[trigger.subject?.toUpperCase()] ?? trigger.subject ?? "uno mismo";
  return fn(who, trigger.param ?? "");
}

export function formatEffect(effect: AbilityEffectData): string {
  const what = EFFECT_VALUE_LABELS[effect.value?.toUpperCase()] ?? effect.value ?? "?";
  const cat = effect.category?.toUpperCase();
  if (cat === EffectCategory.FIELD_STATUS) return `Activa ${what}`;
  if (effect.value?.toUpperCase() === MechanicEffect.PRIORITY) {
    const who = SUBJECT_LABELS[effect.subject?.toUpperCase()] ?? effect.subject ?? "?";
    return `⚡ ${who} ataca primero`;
  }
  const who = SUBJECT_LABELS[effect.subject?.toUpperCase()] ?? effect.subject ?? "?";
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
  row:          Record<string, unknown>,
  effectRows:   Record<string, unknown>[],
  triggerRows:  Record<string, unknown>[] = [],
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
    })),
  };
}
