export interface SheetRow {
  [key: string]: string | number | boolean | null;
}

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: SheetRow[];
}

export interface EnrichedAbility {
  [key: string]: string | number | boolean | null | SheetRow[];
  effects:  SheetRow[];
  triggers: SheetRow[];
}

export type EnrichedMove = EnrichedAbility;

export type CharacterRow = {
  [key: string]: string | number | boolean | null | EnrichedAbility | EnrichedMove[] | SheetRow;
};

export interface CharacterSheetData {
  sheetName: string;
  headers: string[];
  rows: CharacterRow[];
}

export interface AppendRowRequest {
  sheetName: string;
  values: (string | number | boolean | null)[];
}

export interface UpdateRowRequest {
  sheetName: string;
  rowIndex: number; // 1-based, excluding header row
  values: (string | number | boolean | null)[];
}
