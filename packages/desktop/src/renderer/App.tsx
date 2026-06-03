import { useState } from "react";
import Login from "./pages/Login.js";
import SheetViewer from "./pages/SheetViewer.js";
import { getToken, clearToken } from "./hooks/useApi.js";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());

  function handleLogout() {
    clearToken();
    setAuthed(false);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={styles.header}>
        <span style={styles.brand}>NUL Admin</span>
        <button className="ghost" style={{ fontSize: 13, padding: "6px 12px" }} onClick={handleLogout}>
          Sign out
        </button>
      </header>
      <SheetViewer />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: 52,
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  brand: { fontWeight: 700, fontSize: 16, color: "var(--accent)" },
};
