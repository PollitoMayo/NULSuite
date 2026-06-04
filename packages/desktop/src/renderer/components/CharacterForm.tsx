import { FormEvent, useState } from "react";
import { PokemonType } from "@nul/shared";

export interface CharacterValues {
  user: string; name: string; superName: string; super: string; age: string;
  birthday: string; gender: string; height: string; pokemon: string; pokemonId: string;
  type1: string; type2: string; ability: string;
  move1: string; move2: string; move3: string; move4: string;
  archetype: string; isPublic: string;
}

export interface UserOption {
  discord: string;
  username: string;
}

export interface PokemonEntry {
  name:  string;
  form:  string;
  type1: string;
  type2: string;
}

export interface AbilityOption {
  id:   string;
  name: string;
}

export interface MoveOption {
  id:   string;
  name: string;
}

interface Props {
  initial?: Partial<CharacterValues>;
  lockUser?: boolean;
  users?: UserOption[];
  pokedex?: PokemonEntry[];
  abilities?: AbilityOption[];
  moves?: MoveOption[];
  isEdit: boolean;
  saving: boolean;
  error: string | null;
  onSubmit: (v: CharacterValues) => Promise<void>;
  onClose: () => void;
}

const SUPER_TYPES = ["Héroe", "Villano", "Ciudadano"];
const GENDERS     = ["Femenino", "Masculino", "No Binario"];
const ARCHETYPES  = ["Defense", "Offense", "Support"];
const ALL_TYPES   = PokemonType.all();

const EMPTY: CharacterValues = {
  user: "", name: "", superName: "", super: SUPER_TYPES[0], age: "", birthday: "",
  gender: GENDERS[0], height: "", pokemon: "", pokemonId: "", type1: "normal", type2: "",
  ability: "", move1: "", move2: "", move3: "", move4: "", archetype: ARCHETYPES[0],
  isPublic: "TRUE",
};

export default function CharacterForm({ initial, lockUser, users, pokedex, abilities, moves, isEdit, saving, error, onSubmit, onClose }: Props) {
  const [v, setV] = useState<CharacterValues>({ ...EMPTY, ...initial });
  const set = (key: keyof CharacterValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((prev) => ({ ...prev, [key]: e.target.value }));

  function handleBirthday(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setV((prev) => ({ ...prev, birthday: formatted }));
  }

  function moveDisplay(id: string) {
    return moves?.find((m) => m.id === id)?.name ?? id;
  }

  function handleMove(key: keyof CharacterValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const text  = e.target.value;
      const entry = moves?.find((m) => m.name === text);
      setV((prev) => ({ ...prev, [key]: entry ? entry.id : text }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(v);
  }

  const reqTag = <span style={{ color: "var(--danger)", marginLeft: 2, fontWeight: 700 }}>*</span>;
  const optTag = (
    <span style={{ textTransform: "none", fontWeight: 400, marginLeft: 5, fontSize: 9, opacity: 0.55, letterSpacing: 0 }}>
      opcional
    </span>
  );

  const field = (label: string, key: keyof CharacterValues, opts?: { type?: string; placeholder?: string; disabled?: boolean; optional?: boolean }) => (
    <div>
      <label>{label}{opts?.optional ? optTag : reqTag}</label>
      <input
        type={opts?.type ?? "text"}
        placeholder={opts?.placeholder ?? ""}
        value={v[key] as string}
        onChange={set(key)}
        disabled={opts?.disabled}
        required={!opts?.optional}
      />
    </div>
  );

  const select = (label: string, key: keyof CharacterValues, options: string[], allowEmpty = false) => (
    <div>
      <label>{label}{reqTag}</label>
      <select value={v[key] as string} onChange={set(key)}>
        {allowEmpty && <option value="">—</option>}
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <p className="modal-header">{isEdit ? `Editar — ${initial?.name ?? ""}` : "Agregar Personaje"}</p>
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <div className="modal-body">

          <p className="form-section-title">Identidad</p>
          <div className="form-grid">
            {field("Nombre", "name", { placeholder: "ej: Kira Yagami" })}
            {field("Nombre Super", "superName", { placeholder: "ej: Light", optional: true })}
            {select("Super", "super", SUPER_TYPES)}
            {select("Arquetipo", "archetype", ARCHETYPES)}
            <div>
              <label>Público</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 5 }}>
                <div
                  role="switch"
                  aria-checked={v.isPublic === "TRUE"}
                  onClick={() => setV((prev) => ({ ...prev, isPublic: prev.isPublic === "TRUE" ? "FALSE" : "TRUE" }))}
                  style={{
                    width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                    background: v.isPublic === "TRUE" ? "var(--accent)" : "var(--border)",
                    cursor: "pointer", position: "relative", transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3,
                    left: v.isPublic === "TRUE" ? 21 : 3,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                  }} />
                </div>
                <span style={{ fontSize: 13, color: v.isPublic === "TRUE" ? "var(--text)" : "var(--text-muted)" }}>
                  {v.isPublic === "TRUE" ? "Sí" : "No"}
                </span>
              </div>
            </div>
            <div>
              <label>Usuario{reqTag}</label>
              {users && users.length > 0 ? (
                <select value={v.user} onChange={set("user")} disabled={lockUser} required>
                  <option value="">— Seleccionar —</option>
                  {users.map((u) => (
                    <option key={u.discord} value={u.discord}>
                      {u.username ? `${u.username} (@${u.discord})` : `@${u.discord}`}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={v.user} onChange={set("user")} disabled={lockUser} required placeholder="discord handle" />
              )}
            </div>
          </div>

          <p className="form-section-title">Info Personal</p>
          <div className="form-grid">
            {field("Edad", "age", { type: "number", placeholder: "ej: 22" })}
            <div>
              <label>Cumpleaños{optTag}</label>
              <input value={v.birthday} onChange={handleBirthday}
                placeholder="dd/MM" maxLength={5} />
            </div>
            {select("Género", "gender", GENDERS)}
            {field("Altura (cm)", "height", { type: "number", placeholder: "ej: 170", optional: true })}
          </div>

          <p className="form-section-title">Pokémon</p>
          <div className="form-grid">
            <div>
              <label>Pokémon{reqTag}</label>
              <input
                value={v.pokemonId ? `${v.pokemon} (${v.pokemonId})` : v.pokemon}
                onChange={(e) => {
                  const text  = e.target.value;
                  const entry = pokedex?.find((p) =>
                    (p.form ? `${p.name} (${p.form})` : p.name) === text
                  );
                  if (entry) {
                    const t1 = PokemonType.parseFrom(entry.type1)?.codeName;
                    const t2 = PokemonType.parseFrom(entry.type2)?.codeName;
                    setV((prev) => ({ ...prev, pokemon: entry.name, pokemonId: entry.form, type1: t1 ?? prev.type1, type2: t2 ?? "" }));
                  } else {
                    setV((prev) => ({ ...prev, pokemon: text, pokemonId: "" }));
                  }
                }}
                list="pokedex-list"
                placeholder="ej: Lucario"
                autoComplete="off"
                required
              />
              {pokedex && pokedex.length > 0 && (
                <datalist id="pokedex-list">
                  {pokedex.map((p, i) => (
                    <option key={i} value={p.form ? `${p.name} (${p.form})` : p.name} />
                  ))}
                </datalist>
              )}
            </div>
            <div>
              <label>Habilidad{reqTag}</label>
              {abilities && abilities.length > 0 && (
                <datalist id="abilities-list">
                  {abilities.map((a) => <option key={a.id} value={a.name} />)}
                </datalist>
              )}
              <input
                value={abilities?.find((a) => a.id === v.ability)?.name ?? v.ability}
                onChange={(e) => {
                  const text  = e.target.value;
                  const entry = abilities?.find((a) => a.name === text);
                  setV((prev) => ({ ...prev, ability: entry ? entry.id : text }));
                }}
                list={abilities && abilities.length > 0 ? "abilities-list" : undefined}
                placeholder="— Seleccionar —"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label>Tipo 1{reqTag}</label>
              <select value={v.type1} onChange={set("type1")} required>
                {ALL_TYPES.map((t) => (
                  <option key={t.codeName} value={t.codeName}>{t.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Tipo 2{optTag}</label>
              <select value={v.type2} onChange={set("type2")}>
                <option value="">—</option>
                {ALL_TYPES.map((t) => (
                  <option key={t.codeName} value={t.codeName}>{t.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="form-section-title">Moveset</p>
          {moves && moves.length > 0 && (
            <datalist id="moves-list">
              {moves.map((m) => <option key={m.id} value={m.name} />)}
            </datalist>
          )}
          <div className="form-grid">
            {(["move1", "move2", "move3", "move4"] as const).map((key, i) => (
              <div key={key}>
                <label>Movimiento {i + 1}</label>
                <input
                  value={moveDisplay(v[key])}
                  onChange={handleMove(key)}
                  list={moves && moves.length > 0 ? "moves-list" : undefined}
                  placeholder="— Opcional —"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" className="ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar Cambios" : "Agregar"}
          </button>
        </div>
      </form>
    </>
  );
}
