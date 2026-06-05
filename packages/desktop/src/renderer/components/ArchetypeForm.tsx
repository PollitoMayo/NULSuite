import { FormEvent, useState } from "react";
import type { ArchetypeData } from "@nul/shared";

interface Props {
  initial?: ArchetypeData;
  isEdit:   boolean;
  saving:   boolean;
  error:    string | null;
  onSubmit: (v: ArchetypeData) => Promise<void>;
  onClose:  () => void;
}

const EMPTY: ArchetypeData = {
  id: "", isPublic: false, name: "", emoji: "❓", hp: "", atk: "", def: "", spAtk: "", spDef: "", spd: "", acc: "",
};

export default function ArchetypeForm({ initial, isEdit, saving, error, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ArchetypeData>(initial ?? EMPTY);

  function set(key: keyof ArchetypeData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggle(key: keyof ArchetypeData) {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Visibility */}
      <label style={s.toggleRow} onClick={() => toggle("isPublic")}>
        <div style={{ ...s.toggleTrack, background: form.isPublic ? "var(--accent)" : "var(--border)" }}>
          <div style={{ ...s.toggleThumb, transform: form.isPublic ? "translateX(18px)" : "translateX(2px)" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {form.isPublic ? "Público — visible para todos los jugadores" : "Privado — solo visible para admins"}
        </span>
      </label>

      {/* Identity */}
      <div style={s.row}>
        <div style={{ flex: "0 0 110px" }}>
          <label>ID</label>
          <input value={form.id} readOnly
            style={{ opacity: 0.6, cursor: "not-allowed" }} />
        </div>
        <div style={{ flex: "0 0 80px" }}>
          <label>Emoji</label>
          <input value={form.emoji} onChange={(e) => set("emoji", e.target.value)}
            placeholder="❓" style={{ textAlign: "center", fontSize: 20 }} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Nombre *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
      </div>

      {/* Stats */}
      <fieldset style={s.fieldset}>
        <legend style={s.legend}>Stats base</legend>
        <div style={s.statsGrid}>
          {([
            { key: "hp",    label: "HP" },
            { key: "atk",   label: "ATK" },
            { key: "def",   label: "DEF" },
            { key: "spAtk", label: "SP.ATK" },
            { key: "spDef", label: "SP.DEF" },
            { key: "spd",   label: "SPD" },
            { key: "acc",   label: "ACC" },
          ] as { key: keyof ArchetypeData; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label>{label}</label>
              <input type="number" min={0} value={form[key]}
                onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
        </div>
      </fieldset>

      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar Cambios" : "Crear Arquetipo"}
        </button>
      </div>
    </form>
  );
}

const s: Record<string, React.CSSProperties> = {
  row:         { display: "flex", gap: 10, alignItems: "flex-end" },
  fieldset:    { border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" },
  legend:      { fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 6px" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px" },
  toggleRow:   { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" },
  toggleTrack: { width: 38, height: 22, borderRadius: 11, position: "relative", flexShrink: 0, transition: "background 0.2s" },
  toggleThumb: { position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "transform 0.2s" },
};
