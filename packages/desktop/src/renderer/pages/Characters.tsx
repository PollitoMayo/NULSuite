import { useEffect, useState } from "react";
import { useApi, request } from "../hooks/useApi.js";
import CharacterForm, { CharacterValues } from "../components/CharacterForm.js";
import type { CharacterSheetData, SheetRow, AppendRowRequest, UpdateRowRequest } from "@nul/shared";
import { PokemonType, parseCondition } from "@nul/shared";

const SHEET = "CHARACTERS";

interface Character extends CharacterValues {
  rowIndex:    number;
  abilityData: SheetRow | null;
}

const SUPER_COLORS: Record<string, string> = {
  "Héroe":"#5865f2", "Villano":"#ed4245", "Ciudadano":"#8e9297",
};
const ARCH_COLORS: Record<string, string> = {
  Defense:"#3ba55c", Offense:"#ed4245", Support:"#faa61a",
};

function TypeBadge({ type }: { type: string }) {
  if (!type) return null;
  const pt = PokemonType.parseFrom(type);
  if (!pt) return <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{type}</span>;
  return (
    <img src={pt.symbolUrl} alt={pt.displayName} title={pt.displayName}
      style={{ height: 24, objectFit: "contain" }} />
  );
}

function col(row: CharacterSheetData["rows"][number], key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  const val = found ? row[found] : null;
  if (val === null || val === undefined || typeof val === "object") return "";
  return String(val);
}

function abilityObj(row: CharacterSheetData["rows"][number]): SheetRow | null {
  const found = Object.keys(row).find((k) => k.toLowerCase() === "ability");
  const val = found ? row[found] : null;
  return val && typeof val === "object" ? (val as SheetRow) : null;
}

function aCol(row: SheetRow, key: string): string {
  const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
  return String(found ? (row[found] ?? "") : "");
}

function parseChars(data: CharacterSheetData): Character[] {
  return data.rows.map((row, i) => {
    const moves = col(row, "moveset").split(",").map((m) => m.trim());
    const ability = abilityObj(row);
    return {
      rowIndex:    i,
      user:        col(row, "discord"),
      name:        col(row, "name"),
      super:       col(row, "super"),
      age:         col(row, "age"),
      birthday:    col(row, "birthday"),
      gender:      col(row, "gender"),
      height:      col(row, "height"),
      pokemon:     col(row, "pokemon"),
      type1:       col(row, "type1"),
      type2:       col(row, "type2"),
      ability:     ability ? String(ability["Id"] ?? ability["id"] ?? "") : col(row, "ability"),
      abilityData: ability,
      move1:       moves[0] ?? "",
      move2:       moves[1] ?? "",
      move3:       moves[2] ?? "",
      move4:       moves[3] ?? "",
      archetype:   col(row, "archetype"),
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
  const { data, loading, error, call } = useApi<CharacterSheetData>();
  const [showAdd, setShowAdd]     = useState(false);
  const [editing, setEditing]     = useState<Character | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { refresh(); }, [userFilter]);

  const chars = data ? parseChars(data) : [];

  function refresh() {
    if (userFilter) call(`/user/${encodeURIComponent(userFilter)}/characters`);
    else call(`/characters`);
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                        alt="" style={{ width: 24, height: 24, imageRendering: "pixelated" }} />
                      <p style={s.pokemonName}>{c.pokemon}</p>
                    </div>
                    <div className="types-wrap" style={{ justifyContent: "flex-end" }}>
                      <TypeBadge type={c.type1} />
                      <TypeBadge type={c.type2} />
                    </div>
                  </div>

                  {/* Ability */}
                  {c.abilityData ? (() => {
                    const ab = c.abilityData;
                    const name      = aCol(ab, "name");
                    const entry     = aCol(ab, "entry");
                    const dice      = aCol(ab, "dice");
                    const condition = parseCondition(aCol(ab, "condition"));
                    return (
                      <div style={s.abilityBlock}>
                        <div style={s.abilityHeader}>
                          <p style={s.abilityName}>{name}</p>
                          {dice && <span style={s.diceBadge}>🎲 1d{dice}</span>}
                        </div>
                        {condition && <p style={s.abilityCondition}>✓ {condition}</p>}
                        {entry && <p style={s.abilityEntry}>{entry}</p>}
                      </div>
                    );
                  })() : (
                    c.ability && <p style={s.ability}>{c.ability}</p>
                  )}

                  {/* Stats */}
                  <div style={s.statsGrid}>
                    {[
                      { icon: "🎂", label: "Edad",       value: c.age ? `${c.age} años` : "—" },
                      { icon: "📅", label: "Cumpleaños", value: c.birthday || "—" },
                      { icon: "⚧",  label: "Género",     value: c.gender || "—" },
                      { icon: "📏", label: "Altura",     value: c.height ? `${c.height} cm` : "—" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={s.statChip}>
                        <p style={s.statLabel}>{icon} {label}</p>
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
  abilityBlock: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  abilityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  abilityName:      { fontSize: 13, fontWeight: 700 },
  diceBadge: {
    fontSize: 11,
    fontWeight: 600,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "2px 7px",
    whiteSpace: "nowrap" as const,
  },
  abilityCondition: { fontSize: 11, color: "var(--text)", fontWeight: 500 },
  abilityEntry:     { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 },
};
