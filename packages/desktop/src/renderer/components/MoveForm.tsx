import { FormEvent, useState } from "react";
import {
  EffectCategory, Subject, MoveCategory, DamageStat, Stat,
  StatusEffect, ConditionEffect, Barrier, EffectParamType,
  EFFECT_VALUE_LABELS, EFFECTS_BY_CATEGORY, SUBJECT_LABELS, MOVE_CATEGORY_LABELS, DAMAGE_STAT_LABELS, STAT_LABELS,
  MECHANIC_PARAM_TYPE,
  type MoveData, type MoveEffectData,
} from "@nul/shared";
import { PokemonType } from "@nul/shared";

const EFFECT_CATEGORY_LABELS_MAP: Record<string, string> = {
  [EffectCategory.STATUS]:        "Estado",
  [EffectCategory.BUFF_DEBUFF]:   "Buff / Debuff",
  [EffectCategory.CONDITION]:     "Condición",
  [EffectCategory.FIELD_STATUS]:  "Estado de campo",
  [EffectCategory.FIELD_WEATHER]: "Clima",
  [EffectCategory.CURE]:          "Curación",
  [EffectCategory.MECHANIC]:      "Mecánica",
};

type CureAmountType = "dice" | "fraction" | "percent";

function parseCureAmount(v: string): { type: CureAmountType; n: string } {
  if (!v) return { type: "dice", n: "" };
  if (v.startsWith("d")) return { type: "dice", n: v.slice(1) };
  const num = parseFloat(v);
  return { type: num > 0 && num <= 1 ? "fraction" : "percent", n: v };
}

function CureAmountSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const initial = parseCureAmount(value);
  const [type, setType] = useState<CureAmountType>(initial.type);
  const [n, setN]       = useState(initial.n);

  function emit(t: CureAmountType, num: string) {
    if (!num) return;
    onChange(t === "dice" ? `d${num}` : num);
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={type} onChange={(e) => { const t = e.target.value as CureAmountType; setType(t); emit(t, n); }}
        style={{ flex: "0 0 120px" }}>
        <option value="dice">Dado</option>
        <option value="fraction">Fracción</option>
        <option value="percent">Porcentaje</option>
      </select>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        {type === "dice" && (
          <span style={{ background: "var(--border)", color: "var(--text-muted)", padding: "9px 8px", borderRadius: "6px 0 0 6px", border: "1px solid var(--border)", borderRight: "none", fontSize: 13, fontWeight: 600 }}>1d</span>
        )}
        <input
          type="number"
          min={type === "dice" ? 1 : 0}
          max={type === "percent" ? 100 : type === "fraction" ? 1 : undefined}
          step={type === "fraction" ? 0.01 : 1}
          value={n}
          onChange={(e) => { setN(e.target.value); emit(type, e.target.value); }}
          placeholder={type === "dice" ? "6" : type === "fraction" ? "0.5" : "25"}
          style={type === "dice" ? { borderRadius: "0 6px 6px 0", borderLeft: "none" } : undefined}
        />
        {type === "percent" && <span style={{ color: "var(--text-muted)", padding: "0 8px", fontSize: 14 }}>%</span>}
      </div>
    </div>
  );
}

function ParamSelect({ paramType, value, onChange }: {
  paramType: EffectParamType;
  value: string;
  onChange: (v: string) => void;
}) {
  if (paramType === EffectParamType.POKEMON_TYPE) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">— Tipo —</option>
        {PokemonType.all().map((t) => (
          <option key={t.codeName} value={t.codeName}>{t.displayName}</option>
        ))}
      </select>
    );
  }
  if (paramType === EffectParamType.BARRIER) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">— Barrera —</option>
        {Object.values(Barrier).map((v) => (
          <option key={v} value={v}>{EFFECT_VALUE_LABELS[v] ?? v}</option>
        ))}
      </select>
    );
  }
  if (paramType === EffectParamType.STATUS) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">— Estado —</option>
        {Object.values(StatusEffect).map((v) => (
          <option key={v} value={v}>{EFFECT_VALUE_LABELS[v] ?? v}</option>
        ))}
      </select>
    );
  }
  if (paramType === EffectParamType.CONDITION) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">— Condición —</option>
        {Object.values(ConditionEffect).map((v) => (
          <option key={v} value={v}>{EFFECT_VALUE_LABELS[v] ?? v}</option>
        ))}
      </select>
    );
  }
  if (paramType === EffectParamType.CURE_AMOUNT) {
    return <CureAmountSelect value={value} onChange={onChange} />;
  }
  return null;
}

interface Props {
  initial?: MoveData;
  isEdit:  boolean;
  saving:  boolean;
  error:   string | null;
  onSubmit: (v: MoveData) => Promise<void>;
  onClose:  () => void;
}

const EMPTY_MOVE: MoveData = {
  id: "", name: "", entry: "", type: "", category: "",
  hitDice: "", hitStat: Stat.SPD, hitCondition: "",
  damageDice: "", damageStat: "",
  effectDice: "", effectCondition: "",
  effects: [],
};

export default function MoveForm({ initial, isEdit, saving, error, onSubmit, onClose }: Props) {
  const [form, setForm]       = useState<MoveData>(
    initial ? { ...initial, hitStat: initial.hitStat || Stat.SPD } : EMPTY_MOVE
  );
  const [effects, setEffects] = useState<MoveEffectData[]>(initial?.effects ?? []);

  function set(key: keyof MoveData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addEffect() {
    setEffects((e) => [...e, { subject: Subject.TARGET, category: EffectCategory.STATUS, value: "" }]);
  }

  function removeEffect(i: number) {
    setEffects((e) => e.filter((_, idx) => idx !== i));
  }

  function setEffect(i: number, key: keyof MoveEffectData, value: string) {
    setEffects((e) => e.map((row, idx) => {
      if (idx !== i) return row;
      const updated = { ...row, [key]: value };
      if (key === "category") { updated.value = ""; updated.param = undefined; }
      if (key === "value")    { updated.param = undefined; }
      return updated;
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({ ...form, effects });
  }

  const isDamageMove = form.category !== MoveCategory.STATUS;
  const allTypes     = PokemonType.all();

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

      {/* Type + Category */}
      <div style={s.row}>
        <div style={{ flex: 1 }}>
          <label>Tipo *</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} required>
            <option value="">— Seleccionar —</option>
            {allTypes.map((t) => (
              <option key={t.codeName} value={t.codeName}>{t.displayName}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Categoría *</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} required>
            <option value="">— Seleccionar —</option>
            {Object.values(MoveCategory).map((v) => (
              <option key={v} value={v}>{MOVE_CATEGORY_LABELS[v] ?? v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hit roll */}
      <fieldset style={s.fieldset}>
        <legend style={s.legend}>Hit Rate</legend>
        <div style={s.row}>
          <div style={{ flex: "0 0 100px" }}>
            <label>Dado</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={s.prefix}>1d</span>
              <input type="number" min={1} max={100} value={form.hitDice}
                onChange={(e) => set("hitDice", e.target.value)}
                style={{ borderRadius: "0 6px 6px 0", borderLeft: "none" }} />
            </div>
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <label>+ Stat</label>
            <select value={form.hitStat} onChange={(e) => set("hitStat", e.target.value)}>
              {Object.values(Stat).map((v) => (
                <option key={v} value={v}>{STAT_LABELS[v] ?? v}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Condición para impactar</label>
            <input placeholder="ej: >=10 o =10" value={form.hitCondition}
              onChange={(e) => set("hitCondition", e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Damage roll — only for PHYSICAL / SPECIAL */}
      {isDamageMove && (
        <fieldset style={s.fieldset}>
          <legend style={s.legend}>Daño</legend>
          <div style={s.row}>
            <div style={{ flex: "0 0 100px" }}>
              <label>Dado</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={s.prefix}>1d</span>
                <input type="number" min={1} max={100} value={form.damageDice}
                  onChange={(e) => set("damageDice", e.target.value)}
                  style={{ borderRadius: "0 6px 6px 0", borderLeft: "none" }} />
              </div>
            </div>
            <div style={{ flex: "0 0 110px" }}>
              <label>Stat base</label>
              <select value={form.damageStat} onChange={(e) => set("damageStat", e.target.value)}>
                <option value="">—</option>
                {Object.values(DamageStat).map((v) => (
                  <option key={v} value={v}>{DAMAGE_STAT_LABELS[v] ?? v}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      {/* Effect roll — optional */}
      <fieldset style={s.fieldset}>
        <legend style={s.legend}>Tirada de efecto (opcional)</legend>
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
            Sin efectos secundarios.
          </p>
        )}
        {effects.map((ef, i) => {
          const options   = EFFECTS_BY_CATEGORY[ef.category] ?? [];
          const isField   = ef.category === EffectCategory.FIELD_STATUS || ef.category === EffectCategory.FIELD_WEATHER;
          const paramType = MECHANIC_PARAM_TYPE[ef.value?.toUpperCase()] as EffectParamType | undefined;
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={s.row}>
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
                      <option key={v} value={v}>{EFFECT_CATEGORY_LABELS_MAP[v] ?? v}</option>
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
              {paramType && (
                <div style={{ marginTop: 8 }}>
                  <label style={s.smLabel}>Parámetro específico</label>
                  <ParamSelect
                    paramType={paramType}
                    value={ef.param ?? ""}
                    onChange={(v) => setEffect(i, "param", v)}
                  />
                </div>
              )}
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
          {saving ? "Guardando…" : isEdit ? "Guardar Cambios" : "Crear Movimiento"}
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
