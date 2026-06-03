export interface SheetRow {
  [key: string]: string | number | boolean | null;
}

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: SheetRow[];
}

export type CharacterRow = {
  [key: string]: string | number | boolean | null | SheetRow;
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
