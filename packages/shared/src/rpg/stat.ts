export enum Stat {
    ATK = "ATK",
    DEF = "DEF",
    ACC = "ACC",
    SP_ATK = "SP_ATK",
    SP_DEF = "SP_DEF",
    SPD = "SPD",
  }

  export const STAT_LABELS: Record<string, string> = {
    [Stat.ATK]: "ATK",
    [Stat.DEF]: "DEF",
    [Stat.ACC]: "ACC",
    [Stat.SP_ATK]: "SP.ATK",
    [Stat.SP_DEF]: "SP.DEF",
    [Stat.SPD]: "SPD",
  };