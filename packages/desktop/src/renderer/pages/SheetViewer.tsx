import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";
import type { SheetData } from "@nul/shared";

export default function SheetViewer() {
  const sheets = useApi<string[]>();
  const sheetData = useApi<SheetData>();
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    sheets.call("/sheets");
  }, []);

  useEffect(() => {
    if (sheets.data && sheets.data.length > 0 && !selected) {
      setSelected(sheets.data[0]);
    }
  }, [sheets.data]);

  useEffect(() => {
    if (selected) sheetData.call(`/sheets/${encodeURIComponent(selected)}`);
  }, [selected]);

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <span style={styles.label}>Sheet</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={sheets.loading}
        >
          {(sheets.data ?? []).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          className="ghost"
          style={{ marginLeft: "auto" }}
          onClick={() => selected && sheetData.call(`/sheets/${encodeURIComponent(selected)}`)}
          disabled={sheetData.loading}
        >
          Refresh
        </button>
      </div>

      {sheetData.error && <p style={styles.error}>{sheetData.error}</p>}

      <div style={styles.tableWrapper}>
        {sheetData.loading ? (
          <p style={styles.muted}>Loading…</p>
        ) : sheetData.data ? (
          <table>
            <thead>
              <tr>
                {sheetData.data.headers.map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {sheetData.data.rows.map((row, i) => (
                <tr key={i}>
                  {sheetData.data!.headers.map((h) => (
                    <td key={h}>{String(row[h] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.muted}>Select a sheet to view data.</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  label: { color: "var(--text-muted)", fontSize: 12, fontWeight: 600 },
  tableWrapper: { flex: 1, overflow: "auto", padding: "0 20px" },
  muted: { color: "var(--text-muted)", padding: "20px 0" },
  error: { color: "var(--danger)", padding: "12px 20px" },
};
