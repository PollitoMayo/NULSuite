import { useEffect, useState, FormEvent } from "react";
import { useApi, request } from "../hooks/useApi.js";
import Modal from "../components/Modal.js";
import type { SheetData, AppendRowRequest, UpdateRowRequest } from "@nul/shared";

const SHEET = "USERS";

export interface User {
  rowIndex: number;
  discord: string;
  username: string;
}

interface Props {
  onUserClick: (user: User) => void;
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

export default function Users({ onUserClick }: Props) {
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

      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">
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

      {error && <p className="error-banner">{error}</p>}

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {loading ? (
          <div className="empty-state"><p className="muted">Cargando usuarios…</p></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p className="empty-title">No hay usuarios registrados</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Agrega tu primer usuario para comenzar.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {users.map((user) => {
              const color = avatarColor(user.username || user.discord);
              const initials = (user.username || user.discord).slice(0, 2).toUpperCase();
              return (
                <div key={user.rowIndex} className="user-card" onClick={() => onUserClick(user)}>
                  <div className="avatar" style={{ background: color }}>{initials}</div>
                  <div className="card-body">
                    <p className="card-name">{user.username || <em className="muted">Sin nombre</em>}</p>
                    <p className="card-sub">@{user.discord}</p>
                  </div>
                  <button
                    className="icon-btn"
                    title="Editar usuario"
                    onClick={(e) => { e.stopPropagation(); openEdit(user); }}
                  >
                    ✏️
                  </button>
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
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
  inputWrapper: { display: "flex", alignItems: "stretch" },
  inputPrefix: {
    background: "var(--border)", color: "var(--text-muted)",
    padding: "9px 10px", borderRadius: "6px 0 0 6px",
    border: "1px solid var(--border)", borderRight: "none",
    fontSize: 14, fontWeight: 600,
  },
  hint: { fontSize: 12, color: "var(--text-muted)", marginTop: 5 },
};
