import { useState } from "react";
import Login from "./pages/Login.js";
import Users, { User } from "./pages/Users.js";
import Characters from "./pages/Characters.js";
import { getToken, clearToken } from "./hooks/useApi.js";

type View =
  | { page: "users" }
  | { page: "characters" }
  | { page: "user-characters"; user: User };

const NAV = [
  { id: "users",      label: "Usuarios",   icon: "👥" },
  { id: "characters", label: "Personajes", icon: "⚔️" },
] as const;

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [view, setView]     = useState<View>({ page: "users" });

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const activeNav = view.page === "user-characters" ? "users" : view.page;

  function renderContent() {
    if (view.page === "characters") return <Characters />;
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
      {/* Top bar */}
      <header style={s.topbar}>
        <span style={s.brand}>NUL Admin</span>
        <button className="ghost" style={{ fontSize: 13, padding: "6px 12px" }}
          onClick={() => { clearToken(); setAuthed(false); }}>
          Cerrar sesión
        </button>
      </header>

      <div className="app-shell">
        {/* Sidebar */}
        <nav className="sidebar">
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
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 52,
    background: "var(--surface)", borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  brand: { fontWeight: 800, fontSize: 16, color: "var(--accent)", letterSpacing: "-0.02em" },
};
