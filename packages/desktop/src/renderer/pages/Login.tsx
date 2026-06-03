import { useState, FormEvent } from "react";
import { request, setToken } from "../hooks/useApi.js";
import type { LoginResponse } from "@nul/shared";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (res.success && res.data) {
        setToken(res.data.token);
        onLogin();
      } else {
        setError(res.error ?? "Login failed");
      }
    } catch {
      setError("Could not reach the server. Is it running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>NUL Admin</h1>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={{ width: "100%", marginBottom: 12 }}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={{ width: "100%", marginBottom: 20 }}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 32,
    width: 360,
    display: "flex",
    flexDirection: "column",
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: "center" },
  error: { color: "var(--danger)", marginBottom: 12, fontSize: 13 },
};
