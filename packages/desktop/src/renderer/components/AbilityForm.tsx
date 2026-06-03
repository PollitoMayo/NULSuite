import { FormEvent, useState } from "react";
import {
  TriggerEvent, Subject, EffectCategory,
  TRIGGER_EVENT_LABELS, SUBJECT_LABELS, EFFECT_VALUE_LABELS, EFFECTS_BY_CATEGORY,
  TRIGGERS_WITH_SUBJECT,
  type AbilityData, type AbilityEffectData,
} from "@nul/shared";

const EFFECT_CATEGORY_LABELS: Record<string, string> = {
  [EffectCategory.STATUS]:       "Estado",
  [EffectCategory.BUFF_DEBUFF]:  "Buff / Debuff",
  [EffectCategory.CONDITION]:    "Condición",
  [EffectCategory.FIELD_STATUS]: "Estado de campo",
};

interface Props {
  initial?: AbilityData;
  isEdit:   boolean;
  saving:   boolean;
  error:    string | null;
  onSubmit: (v: AbilityData) => Promise<void>;
  onClose:  () => void;
}

const EMPTY_ABILITY: AbilityData = {
  id: "", name: "", entry: "", triggerEvent: "", triggerSubject: "",
  triggerParam: "", effectDice: "", effectCondition: "", effects: [],
};

export default function AbilityForm({ initial, isEdit, saving, error, onSubmit, onClose }: Props) {
  const [form, setForm]       = useState<AbilityData>(initial ?? EMPTY_ABILITY);
  const [effects, setEffects] = useState<AbilityEffectData[]>(initial?.effects ?? []);

  function set(key: keyof AbilityData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addEffect() {
    setEffects((e) => [...e, { subject: Subject.TARGET, category: EffectCategory.STATUS, value: "" }]);
  }

  function removeEffect(i: number) {
    setEffects((e) => e.filter((_, idx) => idx !== i));
  }

  function setEffect(i: number, key: keyof AbilityEffectData, value: string) {
    setEffects((e) => e.map((row, idx) => {
      if (idx !== i) return row;
      const updated = { ...row, [key]: value };
      if (key === "category") updated.value = "";
      return updated;
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({ ...form, effects });
  }

  const needsSubject = TRIGGERS_WITH_SUBJECT.has(form.triggerEvent);
  const needsParam   = form.triggerEvent === TriggerEvent.USE_MOVE;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Basic info */}
      <div style={s.row}>
        <div style={{ flex: "0 0 140px" }}>
          <label>ID *</label>
          <input value={form.id} onChange={(e) => set("id", e.target.value)}
            required readOnly={isEdit}
            style={isEdit ? { opacity: 0.6, cursor: "not-allowed" } : undefined} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Nombre *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
      </div>

      <div>
        <label>Descripción</label>
        <textarea value={form.entry} onChange={(e) => set("entry", e.target.value)}
          rows={3} style={{ resize: "vertical" }} />
      </div>

      {/* Trigger */}
      <fieldset style={s.fieldset}>
        <legend style={s.legend}>Activación</legend>
        <div style={s.row}>
          <div style={{ flex: 1 }}>
            <label>Evento *</label>
            <select value={form.triggerEvent} onChange={(e) => set("triggerEvent", e.target.value)} required>
              <option value="">— Seleccionar —</option>
              {Object.values(TriggerEvent).map((v) => (
                <option key={v} value={v}>{TRIGGER_EVENT_LABELS[v] ?? v}</option>
              ))}
            </select>
          </div>
          {needsSubject && (
            <div style={{ flex: "0 0 130px" }}>
              <label>Sujeto</label>
              <select value={form.triggerSubject} onChange={(e) => set("triggerSubject", e.target.value)}>
                <option value="">—</option>
                {Object.values(Subject).map((v) => (
                  <option key={v} value={v}>{SUBJECT_LABELS[v] ?? v}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {needsParam && (
          <div style={{ marginTop: 10 }}>
            <label>Movimiento</label>
            <input placeholder="ej: flamethrower" value={form.triggerParam}
              onChange={(e) => set("triggerParam", e.target.value)} />
          </div>
        )}
      </fieldset>

      {/* Effect roll */}
      <fieldset style={s.fieldset}>
        <legend style={s.legend}>Tirada de efecto</legend>
        <div style={s.row}>
          <div style={{ flex: "0 0 100px" }}>
            <label>Dado</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={s.prefix}>1d</span>
              <input type="number" min={1} max={100} value={form.effectDice}
                onChange={(e) => set("effectDice", e.target.value)}
                style={{ borderRadius: "0 6px 6px 0", borderLeft: "none" }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label>Condición</label>
            <input placeholder="ej: =10 o >=7" value={form.effectCondition}
              onChange={(e) => set("effectCondition", e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Effects list */}
      <fieldset style={s.fieldset}>
        <legend style={s.legend}>Efectos al activar</legend>
        {effects.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px" }}>
            Sin efectos — agregar al menos uno.
          </p>
        )}
        {effects.map((ef, i) => {
          const options    = EFFECTS_BY_CATEGORY[ef.category] ?? [];
          const isField    = ef.category === EffectCategory.FIELD_STATUS;
          return (
            <div key={i} style={{ ...s.row, marginBottom: 8 }}>
              {!isField && (
                <div style={{ flex: "0 0 110px" }}>
                  <label style={s.smLabel}>Sujeto</label>
                  <select value={ef.subject} onChange={(e) => setEffect(i, "subject", e.target.value)}>
                    {Object.values(Subject).map((v) => (
                      <option key={v} value={v}>{SUBJECT_LABELS[v] ?? v}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ flex: "0 0 130px" }}>
                <label style={s.smLabel}>Categoría</label>
                <select value={ef.category} onChange={(e) => setEffect(i, "category", e.target.value)}>
                  {Object.values(EffectCategory).map((v) => (
                    <option key={v} value={v}>{EFFECT_CATEGORY_LABELS[v] ?? v}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.smLabel}>Valor</label>
                <select value={ef.value} onChange={(e) => setEffect(i, "value", e.target.value)} required>
                  <option value="">— Seleccionar —</option>
                  {options.map((v) => (
                    <option key={v} value={v}>{EFFECT_VALUE_LABELS[v] ?? v}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={s.smLabel}>&nbsp;</label>
                <button type="button" className="ghost" style={{ padding: "6px 10px", color: "var(--danger)" }}
                  onClick={() => removeEffect(i)}>✕</button>
              </div>
            </div>
          );
        })}
        <button type="button" className="ghost" style={{ fontSize: 12, marginTop: 4 }} onClick={addEffect}>
          + Agregar efecto
        </button>
      </fieldset>

      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar Cambios" : "Crear Habilidad"}
        </button>
      </div>
    </form>
  );
}

const s: Record<string, React.CSSProperties> = {
  row:      { display: "flex", gap: 10, alignItems: "flex-end" },
  fieldset: { border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" },
  legend:   { fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 6px" },
  smLabel:  { fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 },
  prefix:   { background: "var(--border)", color: "var(--text-muted)", padding: "9px 8px", borderRadius: "6px 0 0 6px", border: "1px solid var(--border)", borderRight: "none", fontSize: 13, fontWeight: 600 },
};
