const ICON_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/";
const SYMBOL_BASE= "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/small/";

interface TypeDef {
  id: string;
  codeName: string;
  displayName: string;
  color: string;
  aliases: string[];
}

const TYPE_DEFS: TypeDef[] = [
  { id:'1', codeName: "normal",   displayName: "Normal",    color: "#A8A878", aliases: [] },
  { id:'10', codeName: "fire",     displayName: "Fuego",     color: "#F08030", aliases: ["fuego"] },
  { id:'11', codeName: "water",    displayName: "Agua",      color: "#6890F0", aliases: ["agua"] },
  { id: '13', codeName: "electric", displayName: "Eléctrico", color: "#F8D030", aliases: ["eléctrico", "electrico"] },
  { id:'12', codeName: "grass",    displayName: "Planta",    color: "#78C850", aliases: ["planta"] },
  { id:'15', codeName: "ice",      displayName: "Hielo",     color: "#98D8D8", aliases: ["hielo"] },
  { id:'2', codeName: "fighting", displayName: "Lucha",     color: "#C03028", aliases: ["lucha"] },
  { id:'4', codeName: "poison",   displayName: "Veneno",    color: "#A040A0", aliases: ["veneno"] },
  { id:'5', codeName: "ground",   displayName: "Tierra",    color: "#E0C068", aliases: ["tierra"] },
  { id:'3', codeName: "flying",   displayName: "Volador",   color: "#A890F0", aliases: ["volador"] },
  { id:'14', codeName: "psychic",  displayName: "Psíquico",  color: "#F85888", aliases: ["psíquico", "psiquico"] },
  { id:'7', codeName: "bug",      displayName: "Bicho",     color: "#A8B820", aliases: ["bicho"] },
  { id:'6', codeName: "rock",     displayName: "Roca",      color: "#B8A038", aliases: ["roca"] },
  { id:'8', codeName: "ghost",    displayName: "Fantasma",  color: "#705898", aliases: ["fantasma"] },
  { id:'16', codeName: "dragon",   displayName: "Dragón",    color: "#7038F8", aliases: ["dragón", "dragon"] },
  { id:'17', codeName: "dark",     displayName: "Siniestro", color: "#705848", aliases: ["siniestro"] },
  { id:'9', codeName: "steel",    displayName: "Acero",     color: "#B8B8D0", aliases: ["acero"] },
  { id:'18', codeName: "fairy",    displayName: "Hada",      color: "#EE99AC", aliases: ["hada"] },
];

const LIGHT_CODES = new Set(["electric", "ice", "ground", "steel", "fairy", "normal"]);

export class PokemonType {
  readonly codeName: string;
  readonly displayName: string;
  readonly color: string;
  readonly iconUrl: string;
  readonly symbolUrl: string;
  readonly lightText: boolean;

  private constructor(def: TypeDef) {
    this.codeName    = def.codeName;
    this.displayName = def.displayName;
    this.color       = def.color;
    this.iconUrl     = `${ICON_BASE}/${def.id}.png`;
    this.symbolUrl = `${SYMBOL_BASE}/${def.id}.png`;
    this.lightText   = LIGHT_CODES.has(def.codeName);
  }

  // --- Static registry ---

  static readonly NORMAL   = new PokemonType(TYPE_DEFS[0]);
  static readonly FIRE     = new PokemonType(TYPE_DEFS[1]);
  static readonly WATER    = new PokemonType(TYPE_DEFS[2]);
  static readonly ELECTRIC = new PokemonType(TYPE_DEFS[3]);
  static readonly GRASS    = new PokemonType(TYPE_DEFS[4]);
  static readonly ICE      = new PokemonType(TYPE_DEFS[5]);
  static readonly FIGHTING = new PokemonType(TYPE_DEFS[6]);
  static readonly POISON   = new PokemonType(TYPE_DEFS[7]);
  static readonly GROUND   = new PokemonType(TYPE_DEFS[8]);
  static readonly FLYING   = new PokemonType(TYPE_DEFS[9]);
  static readonly PSYCHIC  = new PokemonType(TYPE_DEFS[10]);
  static readonly BUG      = new PokemonType(TYPE_DEFS[11]);
  static readonly ROCK     = new PokemonType(TYPE_DEFS[12]);
  static readonly GHOST    = new PokemonType(TYPE_DEFS[13]);
  static readonly DRAGON   = new PokemonType(TYPE_DEFS[14]);
  static readonly DARK     = new PokemonType(TYPE_DEFS[15]);
  static readonly STEEL    = new PokemonType(TYPE_DEFS[16]);
  static readonly FAIRY    = new PokemonType(TYPE_DEFS[17]);

  private static readonly _all: PokemonType[] = [
    PokemonType.NORMAL, PokemonType.FIRE, PokemonType.WATER, PokemonType.ELECTRIC,
    PokemonType.GRASS, PokemonType.ICE, PokemonType.FIGHTING, PokemonType.POISON,
    PokemonType.GROUND, PokemonType.FLYING, PokemonType.PSYCHIC, PokemonType.BUG,
    PokemonType.ROCK, PokemonType.GHOST, PokemonType.DRAGON, PokemonType.DARK,
    PokemonType.STEEL, PokemonType.FAIRY,
  ];

  private static readonly _byKey: Map<string, PokemonType> = (() => {
    const map = new Map<string, PokemonType>();
    PokemonType._all.forEach((t, i) => {
      map.set(t.codeName, t);
      TYPE_DEFS[i].aliases.forEach((a) => map.set(a, t));
    });
    return map;
  })();

  // --- Public API ---

  /** Returns all 18 types in Pokédex order. */
  static all(): PokemonType[] {
    return [...PokemonType._all];
  }

  /**
   * Parses a raw string from the sheet (English or Spanish, any case).
   * Returns null if the string does not match any known type.
   */
  static parseFrom(raw: string | null | undefined): PokemonType | null {
    if (!raw) return null;
    return PokemonType._byKey.get(raw.trim().toLowerCase()) ?? null;
  }
}
