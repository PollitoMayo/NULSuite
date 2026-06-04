import { useEffect, useState } from "react";
import { useApi, request } from "../hooks/useApi.js";
import MoveForm from "../components/MoveForm.js";
import {
  PokemonType,
  MoveCategory, MOVE_CATEGORY_STYLE, EFFECT_CATEGORY_STYLE,
  formatHitRoll, formatDamageRoll, formatMoveEffectCondition, formatMoveEffect,
  type MoveData,
} from "@nul/shared";
import type { ApiResponse, MoveRequest } from "@nul/shared";

function toRequest(m: MoveData): MoveRequest {
  return {
    id: m.id, name: m.name, entry: m.entry,
    type: m.type, category: m.category,
    hitDice: m.hitDice, hitStat: m.hitStat, hitCondition: m.hitCondition,
    damageDice: m.damageDice, damageStat: m.damageStat,
    effectDice: m.effectDice, effectCondition: m.effectCondition,
    effects: m.effects.map((e) => ({ subject: e.subject, category: e.category, value: e.value })),
  };
}

export default function Moves() {
  const { data, loading, error, call } = useApi<MoveData[]>();
  const [showAdd, setShowAdd]     = useState(false);
  const [editing, setEditing]     = useState<MoveData | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { refresh(); }, []);

  const moves = data ?? [];

  function refresh() { call("/moves"); }

  async function handleAdd(v: MoveData) {
    setSaving(true); setSaveError(null);
    const res = await request<void>("/moves", {
      method: "POST",
      body: JSON.stringify(toRequest(v)),
    });
    setSaving(false);
    if (res.success) { setShowAdd(false); refresh(); }
    else setSaveError(res.error ?? "Error al guardar");
  }

  async function handleEdit(v: MoveData) {
    if (!editing) return;
    setSaving(true); setSaveError(null);
    const res = await request<void>(`/moves/${encodeURIComponent(editing.id)}`, {
      method: "PUT",
      body: JSON.stringify(toRequest(v)),
    });
    setSaving(false);
    if (res.success) { setEditing(null); refresh(); }
    else setSaveError(res.error ?? "Error al actualizar");
  }

  async function handleDelete(move: MoveData) {
    if (!window.confirm(`¿Eliminar el movimiento "${move.name}"?`)) return;
    const res = await request<void>(`/moves/${encodeURIComponent(move.id)}`, { method: "DELETE" });
    if (res.success) refresh();
    else alert(res.error ?? "Error al eliminar");
  }

  const subtitle = loading ? "Cargando…" : `${moves.length} movimiento${moves.length !== 1 ? "s" : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-left">
          <div>
            <p className="page-title">Movimientos</p>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>
        <button onClick={() => { setSaveError(null); setShowAdd(true); }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Movimiento
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {loading ? (
          <div className="empty-state"><p className="muted">Cargando movimientos…</p></div>
        ) : moves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚔️</div>
            <p className="empty-title">Sin movimientos</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Agrega el primer movimiento.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {moves.map((mv) => {
              const pt        = PokemonType.parseFrom(mv.type);
              const catStyle  = MOVE_CATEGORY_STYLE[mv.category] ?? { bg: "#333", color: "#aaa", border: "#555" };
              const hitLine   = formatHitRoll(mv);
              const dmgLine   = formatDamageRoll(mv);
              const effLine   = formatMoveEffectCondition(mv);
              return (
                <div key={mv.id} style={s.card} onClick={() => { setSaveError(null); setEditing(mv); }}>

                  {/* Header */}
                  <div style={s.cardHeader}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                      <p style={s.moveName}>{mv.name}</p>
                      <p style={s.moveId}>#{mv.id}</p>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                      {pt && (
                        <img src={pt.symbolUrl} alt={pt.displayName} title={pt.displayName}
                          style={{ height: 22, objectFit: "contain" }} />
                      )}
                      <span style={{ ...s.catBadge, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}>
                        {mv.category === MoveCategory.PHYSICAL ? "Físico" : mv.category === MoveCategory.SPECIAL ? "Especial" : "Estado"}
                      </span>
                    </div>
                  </div>

                  {/* Rolls */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {hitLine && <p style={s.rollLine}>{hitLine}</p>}
                    {dmgLine && <p style={{ ...s.rollLine, color: "#f0a060" }}>{dmgLine}</p>}
                    {effLine && (
                      <span style={s.effCondBadge}>{effLine}</span>
                    )}
                  </div>

                  {/* Side effects */}
                  {mv.effects.length > 0 && (
                    <div style={s.chipRow}>
                      {mv.effects.map((ef, i) => {
                        const st = EFFECT_CATEGORY_STYLE[ef.category?.toUpperCase()] ?? { bg: "#333", color: "#aaa", border: "#555" };
                        return (
                          <span key={i} style={{ ...s.effectChip, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            {formatMoveEffect(ef)}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Entry */}
                  {mv.entry && <p style={s.entry}>{mv.entry}</p>}

                  {/* Delete */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: 4 }}>
                    <button className="ghost" style={{ fontSize: 12, color: "var(--danger)", padding: "4px 10px" }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(mv); }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <span>Nuevo Movimiento</span>
              <button className="ghost" style={{ padding: "4px 10px" }} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <MoveForm isEdit={false} saving={saving} error={saveError}
                onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <span>Editar Movimiento</span>
              <button className="ghost" style={{ padding: "4px 10px" }} onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <MoveForm initial={editing} isEdit={true} saving={saving} error={saveError}
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    gap: 10,
    transition: "border-color 0.15s, background 0.15s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  moveName:    { fontSize: 15, fontWeight: 700 },
  moveId:      { fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" },
  catBadge:    { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 },
  rollLine:    { fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" },
  effCondBadge: {
    fontSize: 11, fontWeight: 700, color: "#e8c96a",
    background: "#2e2510", border: "1px solid #6b520e",
    borderRadius: 4, padding: "3px 8px", alignSelf: "flex-start" as const,
  },
  chipRow:    { display: "flex", flexWrap: "wrap" as const, gap: 4 },
  effectChip: { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 },
  entry:      { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
};
