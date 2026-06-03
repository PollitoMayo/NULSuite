import { useEffect, useState, FormEvent } from "react";
import { useApi, request } from "../hooks/useApi.js";
import Modal from "../components/Modal.js";
import type { SheetData, AppendRowRequest, UpdateRowRequest } from "@nul/shared";

const SHEET = "USERS";

interface User {
  rowIndex: number; // 0-based, for the API
  discord: string;
  username: string;
}

// Case-insensitive column lookup
function col(row: SheetData["rows"][number], key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  return String(found ? (row[found] ?? "") : "");
}

function parseUsers(data: SheetData): User[] {
  return data.rows.map((row, i) => ({
    rowIndex: i,
    discord: col(row, "discord"),
    username: col(row, "username"),
  }));
}

const AVATAR_COLORS = ["#5865f2", "#3ba55c", "#faa61a", "#ed4245", "#eb459e", "#00b0f4"];
function avatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Users() {
  const { data, loading, error, call } = useApi<SheetData>();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [discord, setDiscord] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const users = data ? parseUsers(data) : [];

  useEffect(() => { call(`/sheets/${SHEET}`); }, []);

  function openEdit(user: User) {
    setEditing(user);
    setDiscord(user.discord);
    setUsername(user.username);
    setSaveError(null);
  }

  function closeModal() {
    setShowAdd(false);
    setEditing(null);
    setDiscord("");
    setUsername("");
    setSaveError(null);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const res = await request<void>("/sheets/rows", {
      method: "POST",
      body: JSON.stringify({ sheetName: SHEET, values: [discord, username] } satisfies AppendRowRequest),
    });
    setSaving(false);
    if (res.success) { closeModal(); call(`/sheets/${SHEET}`); }
    else setSaveError(res.error ?? "Failed to save");
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    const res = await request<void>("/sheets/rows", {
      method: "PUT",
      body: JSON.stringify({
        sheetName: SHEET,
        rowIndex: editing.rowIndex,
        values: [discord, username],
      } satisfies UpdateRowRequest),
    });
    setSaving(false);
    if (res.success) { closeModal(); call(`/sheets/${SHEET}`); }
    else setSaveError(res.error ?? "Failed to update");
  }

  const isEditing = !!editing;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      <div style={s.toolbar}>
        <div>
          <h1 style={s.title}>Usuarios</h1>
          <p style={s.subtitle}>
            {loading ? "Cargando…" : `${users.length} usuario${users.length !== 1 ? "s" : ""} registrado${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={() => { setSaveError(null); setShowAdd(true); }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Usuario
        </button>
      </div>

      {error && <p style={s.errorBanner}>{error}</p>}

      <div style={s.listWrapper}>
        {loading ? (
          <div style={s.center}><p style={{ color: "var(--text-muted)" }}>Cargando usuarios…</p></div>
        ) : users.length === 0 ? (
          <div style={s.center}>
            <div style={s.emptyIcon}>👥</div>
            <p style={s.emptyTitle}>No hay usuarios registrados</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Agrega tu primer usuario para comenzar.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {users.map((user) => {
              const color = avatarColor(user.username || user.discord);
              const initials = (user.username || user.discord).slice(0, 2).toUpperCase();
              return (
                <div key={user.rowIndex} style={s.card} onClick={() => openEdit(user)}>
                  <div style={{ ...s.avatar, background: color }}>{initials}</div>
                  <div style={s.cardBody}>
                    <p style={s.cardName}>{user.username || <em style={{ color: "var(--text-muted)" }}>No name</em>}</p>
                    <p style={s.cardDiscord}>@{user.discord}</p>
                  </div>
                  <div style={s.editHint}>Editar</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(showAdd || isEditing) && (
        <Modal title={isEditing ? `Editar — ${editing!.username || editing!.discord}` : "Agregar Usuario"} onClose={closeModal}>
          <form onSubmit={isEditing ? handleEdit : handleAdd} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label>Etiqueta de Discord</label>
              <div style={s.inputWrapper}>
                <span style={s.inputPrefix}>@</span>
                <input
                  style={{ borderRadius: "0 6px 6px 0", borderLeft: "none" }}
                  type="text"
                  placeholder=""
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value.replace(/^@/, ""))}
                  required
                  autoFocus
                />
              </div>
              <p style={s.hint}>La etiqueta de Discord sin el símbolo @.</p>
            </div>

            <div>
              <label>Nombre de Usuario</label>
              <input
                type="text"
                placeholder="ej: fulanito"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p style={s.hint}>Como se referirá el bot a este usuario en los mensajes.</p>
            </div>

            {saveError && <p style={{ color: "var(--danger)", fontSize: 13 }}>{saveError}</p>}

            <div className="modal-footer">
              <button type="button" className="ghost" onClick={closeModal}>Cancelar</button>
              <button type="submit" disabled={saving}>
                {saving ? "Guardando…" : isEditing ? "Guardar Cambios" : "Agregar Usuario"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  toolbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "24px 28px", borderBottom: "1px solid var(--border)",
  },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" },
  subtitle: { fontSize: 13, color: "var(--text-muted)", marginTop: 2 },
  errorBanner: { background: "#3b1213", color: "var(--danger)", padding: "10px 28px", fontSize: 13 },
  listWrapper: { flex: 1, overflowY: "auto", padding: "24px 28px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },
  card: {
    display: "flex", alignItems: "center", gap: 14, position: "relative",
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "14px 16px", cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  avatar: {
    width: 42, height: 42, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0,
  },
  cardBody: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 },
  cardName: { fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardDiscord: { fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  editHint: {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0,
  },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: 600 },
  inputWrapper: { display: "flex", alignItems: "stretch" },
  inputPrefix: {
    background: "var(--border)", color: "var(--text-muted)",
    padding: "9px 10px", borderRadius: "6px 0 0 6px",
    border: "1px solid var(--border)", borderRight: "none",
    fontSize: 14, fontWeight: 600,
  },
  hint: { fontSize: 12, color: "var(--text-muted)", marginTop: 5 },
};
