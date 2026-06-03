import { FormEvent, useState } from "react";

export interface CharacterValues {
  user: string; name: string; super: string; age: string;
  birthday: string; gender: string; height: string; pokemon: string;
  type1: string; type2: string; ability: string;
  move1: string; move2: string; move3: string; move4: string;
  archetype: string;
}

interface Props {
  initial?: Partial<CharacterValues>;
  lockUser?: boolean;
  isEdit: boolean;
  saving: boolean;
  error: string | null;
  onSubmit: (v: CharacterValues) => Promise<void>;
  onClose: () => void;
}

const SUPER_TYPES   = ["Héroe", "Villano", "Ciudadano"];
const GENDERS       = ["Femenino", "Masculino", "No Binario"];
const ARCHETYPES    = ["Defense", "Offense", "Support"];
const POKEMON_TYPES = [
  "", "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
];

const EMPTY: CharacterValues = {
  user: "", name: "", super: SUPER_TYPES[0], age: "", birthday: "",
  gender: GENDERS[0], height: "", pokemon: "", type1: "Normal", type2: "",
  ability: "", move1: "", move2: "", move3: "", move4: "", archetype: ARCHETYPES[0],
};

export default function CharacterForm({ initial, lockUser, isEdit, saving, error, onSubmit, onClose }: Props) {
  const [v, setV] = useState<CharacterValues>({ ...EMPTY, ...initial });
  const set = (key: keyof CharacterValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(v);
  }

  const field = (label: string, key: keyof CharacterValues, opts?: { type?: string; placeholder?: string; disabled?: boolean }) => (
    <div>
      <label>{label}</label>
      <input
        type={opts?.type ?? "text"}
        placeholder={opts?.placeholder ?? ""}
        value={v[key] as string}
        onChange={set(key)}
        disabled={opts?.disabled}
        required={key !== "type2"}
      />
    </div>
  );

  const select = (label: string, key: keyof CharacterValues, options: string[], allowEmpty = false) => (
    <div>
      <label>{label}</label>
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
            {select("Super", "super", SUPER_TYPES)}
            {select("Arquetipo", "archetype", ARCHETYPES)}
            <div>
              <label>Usuario</label>
              <input value={v.user} onChange={set("user")} disabled={lockUser} required placeholder="discord handle" />
            </div>
          </div>

          <p className="form-section-title">Info Personal</p>
          <div className="form-grid">
            {field("Edad", "age", { type: "number", placeholder: "ej: 22" })}
            {field("Cumpleaños", "birthday", { placeholder: "ej: 24 Ago" })}
            {select("Género", "gender", GENDERS)}
            {field("Altura (cm)", "height", { type: "number", placeholder: "ej: 170" })}
          </div>

          <p className="form-section-title">Pokémon</p>
          <div className="form-grid">
            {field("Pokémon", "pokemon", { placeholder: "ej: Lucario" })}
            {field("Habilidad", "ability", { placeholder: "ej: Aura Sincronizada" })}
            {select("Tipo 1", "type1", POKEMON_TYPES.filter(Boolean))}
            {select("Tipo 2", "type2", POKEMON_TYPES, true)}
          </div>

          <p className="form-section-title">Moveset</p>
          <div className="form-grid">
            {field("Movimiento 1", "move1", { placeholder: "ej: Esfera Aural" })}
            {field("Movimiento 2", "move2", { placeholder: "ej: A Bocajarro" })}
            {field("Movimiento 3", "move3", { placeholder: "ej: Onda Certera" })}
            {field("Movimiento 4", "move4", { placeholder: "ej: Velocidad Extrema" })}
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
