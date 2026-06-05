import { useState, useEffect } from "react";

export default function UpdateBanner() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updateReady, setUpdateReady]     = useState(false);

  useEffect(() => {
    window.api.onUpdateAvailable((v) => setUpdateVersion(v));
    window.api.onUpdateDownloaded(() => setUpdateReady(true));
  }, []);

  if (updateReady) {
    return (
      <div style={{ ...s.banner, background: "#1a3a1a", borderColor: "var(--success)" }}>
        <span>Actualización lista para instalar</span>
        <button style={{ ...s.actionBtn, background: "var(--success)" }}
          onClick={() => window.api.installUpdate()}>
          Reiniciar e instalar
        </button>
      </div>
    );
  }

  if (updateVersion) {
    return (
      <div style={s.banner}>
        <span>Nueva versión disponible: <strong>v{updateVersion}</strong></span>
        <button style={s.actionBtn} onClick={() => window.api.downloadUpdate()}>
          Descargar
        </button>
        <button style={s.dismissBtn} onClick={() => setUpdateVersion(null)}>✕</button>
      </div>
    );
  }

  return null;
}

const s: Record<string, React.CSSProperties> = {
  banner: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "8px 20px", fontSize: 13,
    background: "#1a1a3a", borderBottom: "1px solid var(--accent)",
    flexShrink: 0,
  },
  actionBtn: {
    marginLeft: "auto", fontSize: 12, padding: "4px 14px",
    background: "var(--accent)",
  },
  dismissBtn: {
    background: "transparent", border: "none", color: "var(--text-muted)",
    padding: "4px 6px", fontSize: 13,
  },
};
