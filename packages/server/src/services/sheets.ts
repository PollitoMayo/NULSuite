import { google, sheets_v4 } from "googleapis";
import type { AppendRowRequest, SheetData, SheetRow, UpdateRowRequest } from "@nul/shared";

let _sheets: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (_sheets) return _sheets;

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  _sheets = google.sheets({ version: "v4", auth });
  return _sheets;
}

const spreadsheetId = () => {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID is not set");
  return id;
};

export async function getSheetData(sheetName: string): Promise<SheetData> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: sheetName,
  });

  const [headerRow, ...dataRows] = res.data.values ?? [];
  const headers: string[] = headerRow ?? [];

  const rows: SheetRow[] = (dataRows ?? []).map((row) => {
    const obj: SheetRow = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? null;
    });
    return obj;
  });

  return { sheetName, headers, rows };
}

export async function appendRow(req: AppendRowRequest): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: req.sheetName,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [req.values] },
  });
}

export async function updateRow(req: UpdateRowRequest): Promise<void> {
  const sheets = getClient();
  // +2: 1 for header row, 1 because Sheets rows are 1-based
  const range = `${req.sheetName}!A${req.rowIndex + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [req.values] },
  });
}

export async function deleteRow(sheetName: string, rowIndex: number): Promise<void> {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: spreadsheetId() });
  const sheet = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (!sheet?.properties?.sheetId) throw new Error(`Sheet "${sheetName}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties!.sheetId!,
              dimension: "ROWS",
              // +1 for header row, 0-based in batchUpdate
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}

export async function listSheets(): Promise<string[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId: spreadsheetId() });
  return (res.data.sheets ?? [])
    .map((s) => s.properties?.title ?? "")
    .filter(Boolean);
}
