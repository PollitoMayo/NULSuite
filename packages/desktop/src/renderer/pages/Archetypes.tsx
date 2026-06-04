import { useEffect, useState } from "react";
import { useApi, request } from "../hooks/useApi.js";
import ArchetypeForm from "../components/ArchetypeForm.js";
import type { ArchetypeData, ArchetypeRequest, ApiResponse } from "@nul/shared";

function toRequest(a: ArchetypeData): ArchetypeRequest {
  return { id: a.id, isPublic: a.isPublic, name: a.name, emoji: a.emoji, hp: a.hp, atk: a.atk, def: a.def, spAtk: a.spAtk, spDef: a.spDef, spd: a.spd };
}

const STATS: { key: keyof ArchetypeData; label: string }[] = [
  { key: "hp",    label: "HP" },
  { key: "atk",   label: "ATK" },
  { key: "def",   label: "DEF" },
  { key: "spAtk", label: "SP.ATK" },
  { key: "spDef", label: "SP.DEF" },
  { key: "spd",   label: "SPD" },
];

export default function Archetypes() {
  const { data, loading, error, call } = useApi<ArchetypeData[]>();
  const [showAdd, setShowAdd]     = useState(false);
  const [newId, setNewId]         = useState("1");
  const [editing, setEditing]     = useState<ArchetypeData | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { refresh(); }, []);

  const archetypes = data ?? [];

  function refresh() { call("/archetypes"); }

  function computeNextId(): string {
    const nums = archetypes.map(a => parseInt(a.id)).filter(n => !isNaN(n));
    return nums.length > 0 ? String(Math.max(...nums) + 1) : "1";
  }

  function openAdd() {
    setSaveError(null);
    setNewId(computeNextId());
    setShowAdd(true);
  }

  async function handleAdd(v: ArchetypeData) {
    setSaving(true); setSaveError(null);
    const res = await request<void>("/archetypes", {
      method: "POST",
      body: JSON.stringify(toRequest(v)),
    });
    setSaving(false);
    if (res.success) { setShowAdd(false); refresh(); }
    else setSaveError(res.error ?? "Error al guardar");
  }

  async function handleEdit(v: ArchetypeData) {
    if (!editing) return;
    setSaving(true); setSaveError(null);
    const res = await request<void>(`/archetypes/${encodeURIComponent(editing.id)}`, {
      method: "PUT",
      body: JSON.stringify(toRequest(v)),
    });
    setSaving(false);
    if (res.success) { setEditing(null); refresh(); }
    else setSaveError(res.error ?? "Error al actualizar");
  }

  async function handleDelete(a: ArchetypeData) {
    if (!window.confirm(`¿Eliminar el arquetipo "${a.name}"?`)) return;
    const res = await request<void>(`/archetypes/${encodeURIComponent(a.id)}`, { method: "DELETE" });
    if (res.success) refresh();
    else alert(res.error ?? "Error al eliminar");
  }

  const subtitle = loading ? "Cargando…" : `${archetypes.length} arquetipo${archetypes.length !== 1 ? "s" : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-left">
          <div>
            <p className="page-title">Arquetipos</p>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>
        <button onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Arquetipo
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {loading ? (
          <div className="empty-state"><p className="muted">Cargando arquetipos…</p></div>
        ) : archetypes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <p className="empty-title">Sin arquetipos</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Agrega el primer arquetipo.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {archetypes.map((a) => (
              <div key={a.name} style={s.card} onClick={() => { setSaveError(null); setEditing(a); }}>
                <div style={s.cardHeader}>
                  <span style={s.emoji}>{a.emoji}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <p style={s.name}>{a.name}</p>
                    <span style={{ ...s.badge, ...(a.isPublic ? s.badgePublic : s.badgeSecret) }}>
                      {a.isPublic ? "Público" : "Privado"}
                    </span>
                  </div>
                  <button className="ghost" style={{ marginLeft: "auto", fontSize: 12, color: "var(--danger)", padding: "4px 10px", flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(a); }}>
                    Eliminar
                  </button>
                </div>
                <div style={s.statsGrid}>
                  {STATS.map(({ key, label }) => (
                    <div key={key} style={s.statCell}>
                      <p style={s.statLabel}>{label}</p>
                      <p style={s.statValue}>{a[key] || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span>Nuevo Arquetipo</span>
              <button className="ghost" style={{ padding: "4px 10px" }} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <ArchetypeForm
                initial={{ id: newId, isPublic: false, name: "", emoji: "❓", hp: "", atk: "", def: "", spAtk: "", spDef: "", spd: "" }}
                isEdit={false} saving={saving} error={saveError}
                onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span>Editar Arquetipo</span>
              <button className="ghost" style={{ padding: "4px 10px" }} onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <ArchetypeForm initial={editing} isEdit={true} saving={saving} error={saveError}
                onSubmit={handleEdit} onClose={() => setEditing(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 12,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 16,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "border-color 0.15s, background 0.15s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  emoji:     { fontSize: 26, lineHeight: 1, flexShrink: 0 },
  name:      { fontSize: 16, fontWeight: 700 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
  },
  statCell: {
    background: "var(--bg)",
    borderRadius: 6,
    padding: "6px 10px",
    textAlign: "center" as const,
  },
  statLabel:   { fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" },
  statValue:   { fontSize: 15, fontWeight: 700, marginTop: 2 },
  badge:       { fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, alignSelf: "flex-start" as const },
  badgePublic: { background: "#1a2e20", color: "#70d490", border: "1px solid #2a6a40" },
  badgeSecret: { background: "#2e2510", color: "#e8c96a", border: "1px solid #6b520e" },
};
