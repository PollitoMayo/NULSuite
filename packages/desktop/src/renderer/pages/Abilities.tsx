import { useEffect, useState } from "react";
import { useApi, request } from "../hooks/useApi.js";
import AbilityForm from "../components/AbilityForm.js";
import {
  type AbilityData,
  EFFECT_VALUE_LABELS, EFFECT_CATEGORY_STYLE,
  formatTrigger, formatEffectCondition,
} from "@nul/shared";
import type { ApiResponse, AbilityRequest } from "@nul/shared";

export default function Abilities() {
  const { data, loading, error, call } = useApi<AbilityData[]>();
  const [showAdd, setShowAdd]   = useState(false);
  const [editing, setEditing]   = useState<AbilityData | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { refresh(); }, []);

  const abilities = data ?? [];

  function refresh() { call("/abilities"); }

  function toRequest(v: AbilityData): AbilityRequest {
    return {
      id: v.id, name: v.name, entry: v.entry,
      triggers: v.triggers,
      effectDice: v.effectDice, effectCondition: v.effectCondition,
      effects: v.effects,
    };
  }

  async function handleAdd(v: AbilityData) {
    setSaving(true); setSaveError(null);
    const res = await request<void>("/abilities", {
      method: "POST",
      body: JSON.stringify(toRequest(v)),
    });
    setSaving(false);
    if (res.success) { setShowAdd(false); refresh(); }
    else setSaveError(res.error ?? "Error al guardar");
  }

  async function handleEdit(v: AbilityData) {
    if (!editing) return;
    setSaving(true); setSaveError(null);
    const res = await request<void>(`/abilities/${encodeURIComponent(editing.id)}`, {
      method: "PUT",
      body: JSON.stringify(toRequest(v)),
    });
    setSaving(false);
    if (res.success) { setEditing(null); refresh(); }
    else setSaveError(res.error ?? "Error al actualizar");
  }

  async function handleDelete(ability: AbilityData) {
    if (!window.confirm(`¿Eliminar "${ability.name}"? También se eliminarán sus efectos.`)) return;
    const res = await request<void>(`/abilities/${encodeURIComponent(ability.id)}`, { method: "DELETE" });
    if (res.success) refresh();
  }

  const subtitle = loading ? "Cargando…" : `${abilities.length} habilidad${abilities.length !== 1 ? "es" : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <p className="page-title">Habilidades</p>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <button onClick={() => { setSaveError(null); setShowAdd(true); }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Habilidad
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {loading ? (
          <div className="empty-state"><p className="muted">Cargando habilidades…</p></div>
        ) : abilities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <p className="empty-title">Sin habilidades</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Agrega la primera habilidad.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {abilities.map((ab) => {
              const rollLabel = formatEffectCondition(ab);
              return (
                <div key={ab.id} style={s.card} onClick={() => { setSaveError(null); setEditing(ab); }}>
                  <div style={s.cardHeader}>
                    <div>
                      <p style={s.abilityName}>{ab.name}</p>
                      <p style={s.abilityId}>#{ab.id}</p>
                    </div>
                    <button className="ghost icon-btn" style={{ color: "var(--danger)", flexShrink: 0 }}
                      title="Eliminar"
                      onClick={(e) => { e.stopPropagation(); handleDelete(ab); }}>
                      🗑
                    </button>
                  </div>

                  {(ab.triggers ?? []).length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {(ab.triggers ?? []).map((tr, i) => (
                        <p key={i} style={s.triggerText}>⚡ {formatTrigger(tr)}</p>
                      ))}
                    </div>
                  )}

                  {rollLabel && (
                    <p style={s.rollText}>{rollLabel}</p>
                  )}

                  {ab.effects.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {ab.effects.map((ef, i) => {
                        const st = EFFECT_CATEGORY_STYLE[ef.category?.toUpperCase()] ?? { bg: "#333", color: "#aaa", border: "#555" };
                        return (
                          <span key={i} style={{ ...s.effectChip, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            {EFFECT_VALUE_LABELS[ef.value?.toUpperCase()] ?? ef.value}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {ab.entry && <p style={s.entry}>{ab.entry}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header"><h2>Nueva Habilidad</h2>
              <button className="ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <AbilityForm isEdit={false} saving={saving} error={saveError}
                onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <div className="modal-header"><h2>Editar — {editing.name}</h2>
              <button className="ghost" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <AbilityForm initial={editing} isEdit={true} saving={saving} error={saveError}
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
    gap: 14,
  },
  card: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 10, padding: 16, cursor: "pointer",
    display: "flex", flexDirection: "column", gap: 10,
    transition: "background 0.15s",
  },
  cardHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  abilityName: { fontSize: 15, fontWeight: 700 },
  abilityId:   { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  triggerText: { fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" },
  rollText:    { fontSize: 11, fontWeight: 600, color: "#e8c96a", background: "#2e2510", border: "1px solid #6b520e", borderRadius: 4, padding: "3px 8px", alignSelf: "flex-start" },
  effectChip:  { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 },
  entry:       { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
};
