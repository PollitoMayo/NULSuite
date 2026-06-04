export interface ArchetypeData {
  id:       string;
  isPublic: boolean;
  name:     string;
  emoji:    string;
  hp:       string;
  atk:      string;
  def:      string;
  spAtk:    string;
  spDef:    string;
  spd:      string;
}

function rv(row: Record<string, unknown>, key: string): string {
  const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
  const v = found ? row[found] : "";
  if (!v || typeof v === "object") return "";
  return String(v);
}

export function parseArchetypeData(row: Record<string, unknown>): ArchetypeData {
  return {
    id:       rv(row, "id"),
    isPublic: rv(row, "public").toUpperCase() === "TRUE",
    name:     rv(row, "name"),
    emoji:    rv(row, "emoji"),
    hp:       rv(row, "hp"),
    atk:      rv(row, "atk"),
    def:      rv(row, "def"),
    spAtk:    rv(row, "sp.atk"),
    spDef:    rv(row, "sp.def"),
    spd:      rv(row, "spd"),
  };
}
