import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { C, FONT_IMPORT } from "../lib/theme.js";

export default function Login() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("loading");
    setErrorMsg("");
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("idle");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: 20,
      }}
    >
      <style>{`${FONT_IMPORT} * { box-sizing: border-box; }`}</style>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.rule}`,
          borderRadius: 6,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 360,
        }}
      >
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: C.ink }}>Cuentas</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4, marginBottom: 22 }}>
          Tu cuenta personal de gastos, ingresos y ahorro.
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: `1px solid ${C.rule}` }}>
          {[
            { key: "signin", label: "Entrar" },
            { key: "signup", label: "Crear cuenta" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setMode(t.key);
                setStatus("idle");
                setErrorMsg("");
              }}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: mode === t.key ? `2px solid ${C.gold}` : "2px solid transparent",
                color: mode === t.key ? C.ink : C.inkSoft,
                fontWeight: 600,
                fontSize: 12.5,
                padding: "8px 4px",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                fontSize: 13.5,
                padding: "9px 10px",
                borderRadius: 3,
                border: `1px solid ${C.rule}`,
                outline: "none",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Contraseña</span>
            <div style={{ position: "relative", display: "flex" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  fontSize: 13.5,
                  padding: "9px 34px 9px 10px",
                  borderRadius: 3,
                  border: `1px solid ${C.rule}`,
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  color: C.inkSoft,
                  display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              background: C.ink,
              color: C.paper,
              border: "none",
              borderRadius: 3,
              padding: "10px 14px",
              fontWeight: 600,
              fontSize: 13.5,
              cursor: "pointer",
              opacity: status === "loading" ? 0.6 : 1,
            }}
          >
            {status === "loading" ? "Un momento…" : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>
          {status === "error" && <p style={{ fontSize: 12, color: C.expense }}>{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}
