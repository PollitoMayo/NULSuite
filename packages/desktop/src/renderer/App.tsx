import { useState, useEffect } from "react";
import Login from "./pages/Login.js";
import Users, { User } from "./pages/Users.js";
import Characters from "./pages/Characters.js";
import Abilities from "./pages/Abilities.js";
import Moves from "./pages/Moves.js";
import Archetypes from "./pages/Archetypes.js";
import { getToken, clearToken } from "./hooks/useApi.js";

type View =
  | { page: "users" }
  | { page: "characters" }
  | { page: "abilities" }
  | { page: "moves" }
  | { page: "archetypes" }
  | { page: "user-characters"; user: User };

const NAV = [
  { id: "users",      label: "Usuarios",    icon: "👥" },
  { id: "characters", label: "Personajes",  icon: "⚔️" },
  { id: "abilities",  label: "Habilidades", icon: "⚡" },
  { id: "moves",      label: "Movimientos", icon: "🥊" },
  { id: "archetypes", label: "Arquetipos",  icon: "🛡️" },
] as const;

export default function App() {
  const [authed, setAuthed]           = useState(!!getToken());
  const [view, setView]               = useState<View>({ page: "users" });
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updateReady, setUpdateReady]     = useState(false);
  const [appVersion, setAppVersion]       = useState("");

  useEffect(() => {
    window.api.onUpdateAvailable((v) => setUpdateVersion(v));
    window.api.onUpdateDownloaded(() => setUpdateReady(true));
    window.api.getVersion().then(setAppVersion);
  }, []);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const activeNav = view.page === "user-characters" ? "users" : view.page;

  function renderContent() {
    if (view.page === "characters") return <Characters />;
    if (view.page === "abilities")  return <Abilities />;
    if (view.page === "moves")      return <Moves />;
    if (view.page === "archetypes") return <Archetypes />;
    if (view.page === "user-characters") {
      return (
        <Characters
          userFilter={view.user.discord}
          userLabel={`${view.user.username} (@${view.user.discord})`}
          onBack={() => setView({ page: "users" })}
        />
      );
    }
    return <Users onUserClick={(user) => setView({ page: "user-characters", user })} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {updateVersion && !updateReady && (
        <div style={s.updateBanner}>
          <span>Nueva versión disponible: <strong>v{updateVersion}</strong></span>
          <button style={s.updateBtn} onClick={() => window.api.downloadUpdate()}>
            Descargar
          </button>
          <button style={s.dismissBtn} onClick={() => setUpdateVersion(null)}>✕</button>
        </div>
      )}
      {updateReady && (
        <div style={{ ...s.updateBanner, background: "#1a3a1a", borderColor: "var(--success)" }}>
          <span>Actualización lista para instalar</span>
          <button style={{ ...s.updateBtn, background: "var(--success)" }}
            onClick={() => window.api.installUpdate()}>
            Reiniciar e instalar
          </button>
        </div>
      )}
    <div className="app-shell">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-brand">NUL Admin</div>
        <div className="sidebar-section">
          <span className="sidebar-label">Menú</span>
          {NAV.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setView({ page: item.id as View["page"] })}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          {appVersion && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "0 12px 8px", textAlign: "center" }}>
              v{appVersion}
            </div>
          )}
          <div className="nav-item" style={{ color: "var(--danger)" }}
            onClick={() => { clearToken(); setAuthed(false); }}>
            <span className="nav-icon">🚪</span>
            Salir
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  updateBanner: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "8px 20px", fontSize: 13,
    background: "#1a1a3a", borderBottom: "1px solid var(--accent)",
    flexShrink: 0,
  },
  updateBtn: {
    marginLeft: "auto", fontSize: 12, padding: "4px 14px",
    background: "var(--accent)",
  },
  dismissBtn: {
    background: "transparent", border: "none", color: "var(--text-muted)",
    padding: "4px 6px", fontSize: 13,
  },
};
