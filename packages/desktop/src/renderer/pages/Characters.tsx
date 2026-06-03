import { useEffect, useState } from "react";
import { useApi, request } from "../hooks/useApi.js";
import CharacterForm, { CharacterValues } from "../components/CharacterForm.js";
import type { SheetData, AppendRowRequest, UpdateRowRequest } from "@nul/shared";

const SHEET = "CHARACTERS";

interface Character extends CharacterValues { rowIndex: number; }

// Covers both English and lowercase Spanish type names from the sheet
const TYPE_COLORS: Record<string, string> = {
  normal:"#A8A878",
  fire:"#F08030",    fuego:"#F08030",
  water:"#6890F0",   agua:"#6890F0",
  electric:"#F8D030", "eléctrico":"#F8D030",
  grass:"#78C850",   planta:"#78C850",
  ice:"#98D8D8",     hielo:"#98D8D8",
  fighting:"#C03028", lucha:"#C03028",
  poison:"#A040A0",  veneno:"#A040A0",
  ground:"#E0C068",  tierra:"#E0C068",
  flying:"#A890F0",  volador:"#A890F0",
  psychic:"#F85888", "psíquico":"#F85888",
  bug:"#A8B820",     bicho:"#A8B820",
  rock:"#B8A038",    roca:"#B8A038",
  ghost:"#705898",   fantasma:"#705898",
  dragon:"#7038F8",  "dragón":"#7038F8",
  dark:"#705848",    siniestro:"#705848",
  steel:"#B8B8D0",   acero:"#B8B8D0",
  fairy:"#EE99AC",   hada:"#EE99AC",
};
const LIGHT_TYPES = new Set(["electric","eléctrico","ice","hielo","ground","tierra","steel","acero","fairy","hada","normal"]);

const SUPER_COLORS: Record<string, string> = {
  "Héroe":"#5865f2", "Villano":"#ed4245", "Ciudadano":"#8e9297",
};
const ARCH_COLORS: Record<string, string> = {
  Defense:"#3ba55c", Offense:"#ed4245", Support:"#faa61a",
};

function TypeBadge({ type }: { type: string }) {
  if (!type) return null;
  const key = type.toLowerCase();
  const bg  = TYPE_COLORS[key] ?? "#555";
  const color = LIGHT_TYPES.has(key) ? "#222" : "#fff";
  return (
    <span className="type-badge" style={{ background: bg, color }}>
      {type}
    </span>
  );
}

function col(row: SheetData["rows"][number], key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  return String(found ? (row[found] ?? "") : "");
}

function parseChars(data: SheetData): Character[] {
  return data.rows.map((row, i) => {
    const moves = col(row, "moveset").split(",").map((m) => m.trim());
    return {
      rowIndex: i,
      user:      col(row, "discord"),
      name:      col(row, "name"),
      super:     col(row, "super"),
      age:       col(row, "age"),
      birthday:  col(row, "birthday"),
      gender:    col(row, "gender"),
      height:    col(row, "height"),
      pokemon:   col(row, "pokemon"),
      type1:     col(row, "type1"),
      type2:     col(row, "type2"),
      ability:   col(row, "ability"),
      move1:     moves[0] ?? "",
      move2:     moves[1] ?? "",
      move3:     moves[2] ?? "",
      move4:     moves[3] ?? "",
      archetype: col(row, "archetype"),
    };
  });
}

function toValues(v: CharacterValues): (string | number)[] {
  const moveset = [v.move1, v.move2, v.move3, v.move4].filter(Boolean).join(", ");
  return [v.user, v.name, v.super, v.age, v.birthday, v.gender, v.height,
          v.pokemon, v.type1, v.type2, v.ability, moveset, v.archetype];
}

interface Props {
  userFilter?: string;
  userLabel?:  string;
  onBack?:     () => void;
}

export default function Characters({ userFilter, userLabel, onBack }: Props) {
  const { data, loading, error, call } = useApi<SheetData>();
  const [showAdd, setShowAdd]     = useState(false);
  const [editing, setEditing]     = useState<Character | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { refresh(); }, [userFilter]);

  const chars = data ? parseChars(data) : [];

  function refresh() {
    if (userFilter) call(`/user/${encodeURIComponent(userFilter)}/characters`);
    else call(`/sheets/${SHEET}`);
  }

  async function handleAdd(v: CharacterValues) {
    setSaving(true); setSaveError(null);
    const res = await request<void>("/sheets/rows", {
      method: "POST",
      body: JSON.stringify({ sheetName: SHEET, values: toValues(v) } satisfies AppendRowRequest),
    });
    setSaving(false);
    if (res.success) { setShowAdd(false); refresh(); }
    else setSaveError(res.error ?? "Error al guardar");
  }

  async function handleEdit(v: CharacterValues) {
    if (!editing) return;
    setSaving(true); setSaveError(null);
    const res = await request<void>("/sheets/rows", {
      method: "PUT",
      body: JSON.stringify({ sheetName: SHEET, rowIndex: editing.rowIndex, values: toValues(v) } satisfies UpdateRowRequest),
    });
    setSaving(false);
    if (res.success) { setEditing(null); refresh(); }
    else setSaveError(res.error ?? "Error al actualizar");
  }

  const title    = userFilter ? `Personajes de ${userLabel ?? userFilter}` : "Personajes";
  const subtitle = loading ? "Cargando…" : `${chars.length} personaje${chars.length !== 1 ? "s" : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-left">
          {onBack && <button className="back-btn" onClick={onBack}>← Usuarios</button>}
          <div>
            <p className="page-title">{title}</p>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>
        <button onClick={() => { setSaveError(null); setShowAdd(true); }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Personaje
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {loading ? (
          <div className="empty-state"><p className="muted">Cargando personajes…</p></div>
        ) : chars.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚔️</div>
            <p className="empty-title">Sin personajes</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {userFilter ? "Este usuario no tiene personajes aún." : "Agrega el primer personaje."}
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {chars.map((c) => {
              const superColor = SUPER_COLORS[c.super] ?? "#555";
              const moves = [c.move1, c.move2, c.move3, c.move4].filter(Boolean);
              return (
                <div key={c.rowIndex} style={{ ...s.card, borderLeftColor: superColor }}
                  onClick={() => { setSaveError(null); setEditing(c); }}>

                  {/* Header */}
                  <div style={s.cardHeader}>
                    <p style={s.charName}>{c.name}</p>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span className="badge" style={{ background: superColor, color: "#fff" }}>{c.super}</span>
                      <span className="badge" style={{ background: ARCH_COLORS[c.archetype] ?? "#555", color: "#fff" }}>{c.archetype}</span>
                    </div>
                  </div>

                  {/* Discord handle — global view only */}
                  {!userFilter && (
                    <p style={s.discord}>@{c.user}</p>
                  )}

                  {/* Pokémon */}
                  <div style={s.pokemonRow}>
                    <div>
                      <p style={s.pokemonName}>{c.pokemon}</p>
                      <p style={s.ability}>{c.ability}</p>
                    </div>
                    <div className="types-wrap" style={{ justifyContent: "flex-end" }}>
                      <TypeBadge type={c.type1} />
                      <TypeBadge type={c.type2} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={s.statsGrid}>
                    {[
                      { label: "Edad",      value: c.age ? `${c.age} años` : "—" },
                      { label: "Cumpleaños",value: c.birthday || "—" },
                      { label: "Género",    value: c.gender || "—" },
                      { label: "Altura",    value: c.height ? `${c.height} cm` : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} style={s.statChip}>
                        <p style={s.statLabel}>{label}</p>
                        <p style={s.statValue}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Moveset */}
                  {moves.length > 0 && (
                    <div>
                      <p style={s.sectionLabel}>Moveset</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                        {moves.map((m, i) => (
                          <span key={i} style={s.moveChip}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <CharacterForm
              initial={userFilter ? { user: userFilter } : undefined}
              lockUser={!!userFilter}
              isEdit={false} saving={saving} error={saveError}
              onSubmit={handleAdd} onClose={() => setShowAdd(false)}
            />
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <CharacterForm
              initial={editing}
              lockUser={!!userFilter}
              isEdit={true} saving={saving} error={saveError}
              onSubmit={handleEdit} onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 14,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderLeft: "3px solid",
    borderRadius: 10,
    padding: 16,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "background 0.15s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  charName:    { fontSize: 16, fontWeight: 700, lineHeight: 1.2 },
  discord:     { fontSize: 12, color: "var(--text-muted)", marginTop: -6 },
  pokemonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    background: "var(--bg)",
    borderRadius: 8,
    padding: "10px 12px",
    gap: 8,
  },
  pokemonName: { fontSize: 14, fontWeight: 600, textTransform: "capitalize" },
  ability:     { fontSize: 12, color: "var(--text-muted)", marginTop: 2 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
  },
  statChip: {
    background: "var(--bg)",
    borderRadius: 6,
    padding: "6px 10px",
  },
  statLabel: { fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" },
  statValue: { fontSize: 13, fontWeight: 500, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" },
  moveChip: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "3px 8px",
    fontSize: 11,
    color: "var(--text-muted)",
  },
};
