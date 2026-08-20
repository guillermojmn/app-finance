import { useState } from "react";
import { supabase } from "../supabaseClient.js";
import { C, FONT_IMPORT } from "../lib/theme.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
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
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: C.ink }}>Libro Mayor</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4, marginBottom: 22 }}>
          Tu cuenta personal de gastos, ingresos y ahorro.
        </div>

        {status === "sent" ? (
          <p style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>
            Te hemos enviado un enlace de acceso a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para
            entrar.
          </p>
        ) : (
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
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: C.ink,
                color: C.paper,
                border: "none",
                borderRadius: 3,
                padding: "10px 14px",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                opacity: status === "sending" ? 0.6 : 1,
              }}
            >
              {status === "sending" ? "Enviando…" : "Enviar enlace de acceso"}
            </button>
            {status === "error" && (
              <p style={{ fontSize: 12, color: C.expense }}>No se pudo enviar el enlace: {errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
