export enum Subject {
  SELF      = "SELF",     // Uno mismo
  TARGET    = "TARGET",   // Objetivo específico
  ALLY      = "ALLY",     // Aliado específico
  ALLY_ALL  = "ALLY_ALL", // Todos los aliados
  ALLY_ANY  = "ALLY_ANY", // Un aliado aleatorio
  ENEMY     = "ENEMY",     // Enemigo específico
  ENEMY_ALL = "ENEMY_ALL", // Todos los enemigos
  ENEMY_ANY = "ENEMY_ANY", // Un enemigo aleatorio
  ALL       = "ALL",       // Todos (aliados y enemigos)
  ANY       = "ANY",       // Cualquiera (aliado o enemigo)
}

export enum EffectCategory {
  STATUS         = "STATUS",         // Efecto de Estado
  BUFF_DEBUFF    = "BUFF_DEBUFF",    // Buff/Debuff de STAT
  CONDITION      = "CONDITION",      // Condición (enamorado, confundido, etc.)
  FIELD_STATUS   = "FIELD_STATUS",   // Estado del campo (potencia de movimiento, daño, etc)
  FIELD_WEATHER  = "FIELD_WEATHER",  // Estado del clima (lluvia, sol intenso, etc)
  CURE           = "CURE",           // Cura de estado
  MECHANIC       = "MECHANIC",       // Mecánica (copia el último movimiento, ataca primero, etc.)
}

export enum TriggerEvent {
  PASSIVE            = "PASSIVE",
  ON_STATUS          = "ON_STATUS",          // Al tener un estado
  ON_SPECIFIC_STATUS = "ON_SPECIFIC_STATUS", // Al tener un estado específico
  START_BATTLE       = "START_BATTLE",       // Al iniciar la batalla
  START_ROUND        = "START_ROUND",        // Inicio del turno
  END_ROUND          = "END_ROUND",          // Final del turno
  ON_DEFEATED        = "ON_DEFEATED",        // Al ser derrotado
  DMG_ATK            = "DMG_ATK",            // Recibe daño físico (ATK)
  DMG_SPATK          = "DMG_SPATK",          // Recibe daño especial (SP.ATK)
  DMG_ANY            = "DMG_ANY",            // Recibe cualquier daño
  ON_MOVE_TYPE       = "ON_MOVE_TYPE",       // Al recibir un movimiento de tipo específico
  USE_MOVE           = "USE_MOVE",           // Usa un movimiento específico
  AFTER_ATTACK       = "AFTER_ATTACK",       // Después de atacar
}

export enum StatusEffect {
  PARALYZED = "PARALYZED",           // Paralizado
  BURNED    = "BURNED",              // Quemado
  POISONED  = "POISONED",            // Envenenado
  BADLY_POISONED = "BADLY_POISONED", // Envenenado gravemente
  SLEEP     = "SLEEP",               // Dormido
  SLEEPY    = "SLEEPY",              // Somnoliento
  FROZEN    = "FROZEN",              // Congelado
  FROSTBITE = "FROSTBITE",           // Helado
}

export enum BuffDebuff {
  ATK_UP       = "ATK+1",
  ATK_DOWN     = "ATK-1",
  DEF_UP       = "DEF+1",
  DEF_DOWN     = "DEF-1",
  SP_ATK_UP    = "SP_ATK+1",
  SP_ATK_DOWN  = "SP_ATK-1",
  SP_DEF_UP    = "SP_DEF+1",
  SP_DEF_DOWN  = "SP_DEF-1",
  SPD_UP       = "SPD+1",
  SPD_DOWN     = "SPD-1",
  ACC_UP       = "ACC+1",
  ACC_DOWN     = "ACC-1",
  HIGHEST_STAT = "HIGHEST_STAT", // Estadísticas más altas
  LOWEST_STAT  = "LOWEST_STAT",  // Estadísticas más bajas
}

export enum ConditionEffect {
  CONFUSED            = "CONFUSED",            // Confuso
  CURSED              = "CURSED",              // Maldito
  INFATUATION         = "INFATUATION",         // Enamorado
  TRAPPED             = "TRAPPED",             // Atrapado
  BOUND               = "BOUND",               // Apresado
  SEEDED              = "SEEDED",              // Drenadoras
  COUNTING_DOWN       = "COUNTING_DOWN",       // Cuenta atrás
  CENTER_OF_ATTENTION = "CENTER_OF_ATTENTION", // Centro de atención
  FLINCHED            = "FLINCHED",            // Amedrentado/Retroceder
  HALFLIFE            = "HALFLIFE",            // Mitad de vida
}

export enum FieldStatus {
  TRICK_ROOM       = "TRICK_ROOM",
  ELECTRIC_TERRAIN = "ELECTRIC_TERRAIN",  // Campo eléctrico
  GRASSY_TERRAIN   = "GRASSY_TERRAIN",    // Campo de césped
  MISTY_TERRAIN    = "MISTY_TERRAIN",     // Campo de niebla
  PSYCHIC_TERRAIN  = "PSYCHIC_TERRAIN",   // Campo psíquico
  HEAL_BLOCK       = "HEAL_BLOCK",        // Bloqueo de curación
}

export enum FieldWeather {
  X                = "X",                // Despejado (sin efectos)
  SUN              = "SUN",              // Sol 
  HARSH_SUN        = "HARSH_SUN",        // Sol abrazador
  RAIN             = "RAIN",             // Lluvia
  HEAVY_RAIN       = "HEAVY_RAIN",       // Diluvio
  THUNDERSTORM     = "THUNDERSTORM",     // Tormenta eléctrica
  SANDSTORM        = "SANDSTORM",        // Tormenta de arena
  HAIL             = "HAIL",             // Granizo
  FOG              = "FOG",              // Niebla
  STRONG_WINDS     = "STRONG_WINDS",     // Turbulencia
  SNOW             = "SNOW",             // Nieve
  SOOT_SACK        = "SOOT_SACK",        // Ceniza volcánica
  CLOUDY           = "CLOUDY",           // Nublado
  DIAMOND_DUST     = "DIAMOND_DUST",     // Polvo de diamante
  BLIZZARD         = "BLIZZARD",         // Ventisca
  RAINBOW_LIGHT    = "RAINBOW_LIGHT",    // Luz irisada
}

export enum MechanicEffect {
  COPY_LAST_MOVE              = "COPY_LAST_MOVE",
  PRIORITY                    = "PRIORITY",
  CHANGE_SPECIFIC_TYPE        = "CHANGE_SPECIFIC_TYPE",
  IGNORE_BARRIER              = "IGNORE_BARRIER",
  IGNORE_BARRIER_SPECIFIC     = "IGNORE_SPECIFIC_BARRIER",
  STATUS_IMMUNITY             = "STATUS_IMMUNITY",
  STATUS_IMMUNITY_SPECIFIC    = "STATUS_IMMUNITY_SPECIFIC",
  TYPE_IMMUNITY               = "TYPE_IMMUNITY",
  TYPE_IMMUNITY_SPECIFIC      = "TYPE_IMMUNITY_SPECIFIC",
  CONDITION_IMMUNITY          = "CONDITION_IMMUNITY",
  CONDITION_IMMUNITY_SPECIFIC = "CONDITION_IMMUNITY_SPECIFIC",
}

export enum Barrier {
  LIGHT_SCREEN    = "LIGHT_SCREEN",
  REFLECT         = "REFLECT",
  AURORA_VEIL     = "AURORA_VEIL",
  G_MAX_RESONANCE = "G_MAX_RESONANCE",
}

export enum EffectParamType {
  POKEMON_TYPE = "POKEMON_TYPE",
  STATUS       = "STATUS",
  BARRIER      = "BARRIER",
  CONDITION    = "CONDITION",
}

export const MECHANIC_PARAM_TYPE: Partial<Record<string, EffectParamType>> = {
  [MechanicEffect.CHANGE_SPECIFIC_TYPE]:         EffectParamType.POKEMON_TYPE,
  [MechanicEffect.IGNORE_BARRIER_SPECIFIC]:       EffectParamType.BARRIER,
  [MechanicEffect.STATUS_IMMUNITY_SPECIFIC]:      EffectParamType.STATUS,
  [MechanicEffect.TYPE_IMMUNITY_SPECIFIC]:        EffectParamType.POKEMON_TYPE,
  [MechanicEffect.CONDITION_IMMUNITY_SPECIFIC]:   EffectParamType.CONDITION,
};

export enum CureEffect {
  ALL_STATUS      = "CURE_ALL_STATUS",
  CURE_PARALYZE  = "CURE_PARALYZE",
  CURE_BURN       = "CURE_BURN",
  CURE_POISON     = "CURE_POISON",
  CURE_SLEEP      = "CURE_SLEEP",
  CURE_FREEZE     = "CURE_FREEZE",
  ALL_CONDITIONS  = "CURE_ALL_CONDITIONS",
  CURE_CONFUSE    = "CURE_CONFUSE",
  CURE_INFATUATE  = "CURE_INFATUATE",
  CURE_ALL        = "CURE_ALL",
  CURE_HP         = "CURE_HP",
}

export type AnyEffect =
  | StatusEffect
  | BuffDebuff
  | ConditionEffect
  | FieldStatus
  | FieldWeather
  | CureEffect
  | MechanicEffect;

export const STAT_STAGE_MAX =  6;
export const STAT_STAGE_MIN = -6;

type TriggerFn = (subject: string, param: string) => string;

export const TRIGGERS_WITH_SUBJECT = new Set<string>([
  TriggerEvent.PASSIVE,
  TriggerEvent.ON_STATUS,
  TriggerEvent.ON_SPECIFIC_STATUS,
  TriggerEvent.START_BATTLE,
  TriggerEvent.START_ROUND,
  TriggerEvent.END_ROUND,
  TriggerEvent.ON_DEFEATED,
  TriggerEvent.DMG_ATK,
  TriggerEvent.DMG_SPATK,
  TriggerEvent.DMG_ANY,
  TriggerEvent.ON_MOVE_TYPE,
  TriggerEvent.USE_MOVE,
  TriggerEvent.AFTER_ATTACK,
]);

export const SUBJECT_LABELS: Record<string, string> = {
  [Subject.SELF]:      "uno mismo",
  [Subject.TARGET]:    "objetivo",
  [Subject.ALLY]:      "aliado",
  [Subject.ALLY_ALL]:  "todos los aliados",
  [Subject.ALLY_ANY]:  "un aliado aleatorio",
  [Subject.ENEMY]:     "enemigo",
  [Subject.ENEMY_ALL]: "todos los enemigos",
  [Subject.ENEMY_ANY]: "un enemigo aleatorio",
  [Subject.ALL]:       "todos",
  [Subject.ANY]:       "cualquiera (aliado o enemigo)",
};

export const TRIGGER_EVENT_LABELS: Record<string, string> = {
  [TriggerEvent.PASSIVE]:            "Pasiva",
  [TriggerEvent.ON_STATUS]:          "Al tener un estado",
  [TriggerEvent.ON_SPECIFIC_STATUS]: "Al tener un estado específico",
  [TriggerEvent.START_BATTLE]:       "Al iniciar la batalla",
  [TriggerEvent.START_ROUND]:        "Inicio del turno",
  [TriggerEvent.END_ROUND]:          "Final del turno",
  [TriggerEvent.ON_DEFEATED]:        "Al ser derrotado",
  [TriggerEvent.DMG_ATK]:            "Recibe daño físico (ATK)",
  [TriggerEvent.DMG_SPATK]:          "Recibe daño especial (SP.ATK)",
  [TriggerEvent.DMG_ANY]:            "Recibe cualquier daño",
  [TriggerEvent.ON_MOVE_TYPE]:       "Al recibir un movimiento de tipo específico",
  [TriggerEvent.USE_MOVE]:           "Usa un movimiento",
  [TriggerEvent.AFTER_ATTACK]:       "Después de atacar",
};

export const TRIGGER_FORMAT: Record<string, TriggerFn> = {
  [TriggerEvent.PASSIVE]:            ()     => "Pasiva (siempre activa)",
  [TriggerEvent.ON_STATUS]:          (s)    => `Cuando ${s} tiene un estado`,
  [TriggerEvent.ON_SPECIFIC_STATUS]: (s, p) => `Cuando ${s} tiene ${p}`,
  [TriggerEvent.START_BATTLE]:       ()     => "Al iniciar la batalla",
  [TriggerEvent.START_ROUND]:        ()     => "Al inicio del turno",
  [TriggerEvent.END_ROUND]:          ()     => "Al final del turno",
  [TriggerEvent.ON_DEFEATED]:        ()     => "Al ser derrotado",
  [TriggerEvent.DMG_ATK]:            (s)    => `Cuando ${s} recibe daño físico (ATK)`,
  [TriggerEvent.DMG_SPATK]:          (s)    => `Cuando ${s} recibe daño especial (SP.ATK)`,
  [TriggerEvent.DMG_ANY]:            (s)    => `Cuando ${s} recibe daño`,
  [TriggerEvent.ON_MOVE_TYPE]:       (s, p) => `Cuando ${s} recibe un movimiento de tipo ${p}`,
  [TriggerEvent.USE_MOVE]:           (s, p) => `Cuando ${s} usa ${p || "un movimiento"}`,
  [TriggerEvent.AFTER_ATTACK]:       (s)    => `Después de que ${s} ataca`,
};

export const EFFECT_VALUE_LABELS: Record<string, string> = {
  [StatusEffect.PARALYZED]:          "Paralizado",
  [StatusEffect.BURNED]:             "Quemado",
  [StatusEffect.POISONED]:           "Envenenado",
  [StatusEffect.BADLY_POISONED]:     "Envenenado gravemente",
  [StatusEffect.SLEEP]:              "Dormido",
  [StatusEffect.SLEEPY]:             "Somnoliento",
  [StatusEffect.FROZEN]:             "Congelado",
  [StatusEffect.FROSTBITE]:          "Helado",
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
  [BuffDebuff.ACC_UP]:               "ACC +1",
  [BuffDebuff.ACC_DOWN]:             "ACC -1",
  [BuffDebuff.HIGHEST_STAT]:         "Estadísticas más altas",
  [BuffDebuff.LOWEST_STAT]:          "Estadísticas más bajas",
  [ConditionEffect.CONFUSED]:        "Confundido",
  [ConditionEffect.CURSED]:          "Maldito",
  [ConditionEffect.INFATUATION]:     "Enamorado",
  [ConditionEffect.TRAPPED]:         "Atrapado",
  [ConditionEffect.BOUND]:           "Apresado",
  [ConditionEffect.SEEDED]:          "Drenadoras",
  [ConditionEffect.COUNTING_DOWN]:   "Cuenta atrás",
  [ConditionEffect.CENTER_OF_ATTENTION]: "Centro de atención",
  [ConditionEffect.FLINCHED]:          "Amedrentado/Retroceder",
  [ConditionEffect.HALFLIFE]:        "Mitad de vida",
  [FieldWeather.X]:                   "Despejado",
  [FieldWeather.SUN]:                 "Sol",
  [FieldWeather.HARSH_SUN]:          "Sol abrazador",
  [FieldWeather.RAIN]:                "Lluvia",
  [FieldWeather.HEAVY_RAIN]:          "Diluvio",
  [FieldWeather.THUNDERSTORM]:        "Tormenta eléctrica",
  [FieldWeather.SANDSTORM]:           "Tormenta de arena",
  [FieldWeather.HAIL]:                "Granizo",
  [FieldWeather.FOG]:                 "Niebla",
  [FieldWeather.STRONG_WINDS]:        "Turbulencia",
  [FieldWeather.SNOW]:                "Nieve",
  [FieldWeather.SOOT_SACK]:           "Ceniza volcánica",
  [FieldWeather.CLOUDY]:              "Nublado",
  [FieldWeather.DIAMOND_DUST]:        "Polvo de diamante",
  [FieldWeather.BLIZZARD]:            "Ventisca",
  [FieldWeather.RAINBOW_LIGHT]:       "Luz irisada",
  [FieldStatus.TRICK_ROOM]:          "Sala trampa",
  [FieldStatus.ELECTRIC_TERRAIN]:    "Terreno eléctrico",
  [FieldStatus.GRASSY_TERRAIN]:      "Terreno gramíneo",
  [FieldStatus.MISTY_TERRAIN]:       "Terreno de niebla",
  [FieldStatus.PSYCHIC_TERRAIN]:     "Terreno psíquico",
  [FieldStatus.HEAL_BLOCK]:          "Bloqueo de curación",
  [CureEffect.ALL_STATUS]:           "Cura todos los estados",
  [CureEffect.CURE_PARALYZE]:        "Cura Parálisis",
  [CureEffect.CURE_BURN]:            "Cura Quemadura",
  [CureEffect.CURE_POISON]:          "Cura Envenenamiento",
  [CureEffect.CURE_SLEEP]:           "Cura Dormido",
  [CureEffect.CURE_FREEZE]:          "Cura Congelación",
  [CureEffect.ALL_CONDITIONS]:       "Cura todas las condiciones",
  [CureEffect.CURE_CONFUSE]:        "Cura Confusión",
  [CureEffect.CURE_INFATUATE]:      "Cura Enamoramiento",
  [CureEffect.CURE_ALL]:             "Cura todo",
  [CureEffect.CURE_HP]:              "Cura vida",
  [MechanicEffect.COPY_LAST_MOVE]:              "Copia el último movimiento",
  [MechanicEffect.PRIORITY]:                    "Prioridad: ataca primero",
  [MechanicEffect.CHANGE_SPECIFIC_TYPE]:        "Cambia el tipo específico",
  [MechanicEffect.IGNORE_BARRIER]:              "Ignora barreras",
  [MechanicEffect.IGNORE_BARRIER_SPECIFIC]:     "Ignora barrera específica",
  [MechanicEffect.STATUS_IMMUNITY]:             "Inmunidad a estados",
  [MechanicEffect.STATUS_IMMUNITY_SPECIFIC]:    "Inmunidad a estado específico",
  [MechanicEffect.TYPE_IMMUNITY]:               "Inmunidad a tipos",
  [MechanicEffect.TYPE_IMMUNITY_SPECIFIC]:      "Inmunidad a tipo específico",
  [MechanicEffect.CONDITION_IMMUNITY]:          "Inmunidad a condiciones",
  [MechanicEffect.CONDITION_IMMUNITY_SPECIFIC]: "Inmunidad a condición específica",
  [Barrier.LIGHT_SCREEN]:                       "Light Screen (Pantalla de luz)",
  [Barrier.REFLECT]:                            "Reflect (Reflejo)",
  [Barrier.AURORA_VEIL]:                        "Aurora Veil (Velo Aurora)",
  [Barrier.G_MAX_RESONANCE]:                    "G-Max Resonance (Gigamelodía)",
};

export const EFFECTS_BY_CATEGORY: Record<string, string[]> = {
  [EffectCategory.STATUS]:       Object.values(StatusEffect),
  [EffectCategory.BUFF_DEBUFF]:  Object.values(BuffDebuff),
  [EffectCategory.CONDITION]:    Object.values(ConditionEffect),
  [EffectCategory.FIELD_STATUS]: Object.values(FieldStatus),
  [EffectCategory.FIELD_WEATHER]: Object.values(FieldWeather),
  [EffectCategory.CURE]:         Object.values(CureEffect),
  [EffectCategory.MECHANIC]:     Object.values(MechanicEffect),
};

export const EFFECT_CATEGORY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  [EffectCategory.STATUS]:       { bg: "#3a1a1a", color: "#f08080", border: "#8a3a3a" },
  [EffectCategory.BUFF_DEBUFF]:  { bg: "#1a2a3a", color: "#80b0f0", border: "#3a5a8a" },
  [EffectCategory.CONDITION]:    { bg: "#2a1a3a", color: "#c080f0", border: "#6a3a8a" },
  [EffectCategory.FIELD_STATUS]: { bg: "#1a2e20", color: "#70d490", border: "#2a6a40" },
  [EffectCategory.FIELD_WEATHER]: { bg: "#1a2a2e", color: "#60d0e0", border: "#2a6a7a" },
  [EffectCategory.CURE]:         { bg: "#1a2a2e", color: "#60d0e0", border: "#2a6a7a" },
  [EffectCategory.MECHANIC]:     { bg: "#2a2014", color: "#e0b860", border: "#7a5a20" },
};
