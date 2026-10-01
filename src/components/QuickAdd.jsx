import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet, X, Check } from "lucide-react";
import { C, FONT_IMPORT, HEADING_FONT, RADIUS, todayISO, normalizeDecimal } from "../lib/theme.js";

// Busca la última vez que apuntaste algo igual (mismo tipo + misma descripción) para rellenar la categoría solo.
function findPreviousMatch(transactions, description, type) {
  const needle = description.trim().toLowerCase();
  if (!needle) return null;
  const matches = transactions.filter((t) => t.type === type && (t.description || "").trim().toLowerCase() === needle);
  if (!matches.length) return null;
  return matches.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.created_at || "").localeCompare(a.created_at || "");
  })[0];
}

const TYPES = [
  { value: "variable", label: "Gasto", icon: ArrowDownCircle, tone: C.expense },
  { value: "fixed", label: "Gasto fijo", icon: ArrowDownCircle, tone: C.expense },
  { value: "income", label: "Ingreso", icon: ArrowUpCircle, tone: C.income },
];

export default function QuickAdd({ accounts, transactions, addTransaction, onExit }) {
  const [form, setForm] = useState({ type: "variable", amount: "", accountId: "", description: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!form.amount || !form.description.trim()) return;
    setSaving(true);
    const ok = await addTransaction({
      date: todayISO(),
      description: form.description.trim(),
      category: form.category || (form.type === "income" ? "Ingreso" : "Otros"),
      type: form.type,
      amount: Number(form.amount),
      currency: "CHF",
      account_id: form.accountId || null,
    });
    setSaving(false);
    if (!ok) return;
    setFlash(`${form.description.trim()} · ${form.amount} CHF`);
    setForm((f) => ({ ...f, amount: "", description: "", category: "" }));
    setTimeout(() => setFlash(null), 1800);
  }

  function onDescriptionBlur() {
    const match = findPreviousMatch(transactions, form.description, form.type);
    if (!match) return;
    setForm((f) => ({ ...f, category: match.category || f.category, accountId: f.accountId || match.account_id || "" }));
  }

  const inputStyle = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 16,
    padding: "13px 14px",
    borderRadius: RADIUS.field,
    border: "none",
    background: C.card,
    color: C.ink,
    outline: "none",
    width: "100%",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: "calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom))",
      }}
    >
      <style>{`${FONT_IMPORT} * { box-sizing: border-box; } html { color-scheme: light dark; } body { margin: 0; background: ${C.paper}; }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontFamily: HEADING_FONT, fontWeight: 600, fontSize: 20, color: C.ink }}>Añadir movimiento</div>
        <button
          onClick={onExit}
          title="Abrir app completa"
          style={{
            border: "none",
            background: C.card,
            color: C.inkSoft,
            borderRadius: RADIUS.field,
            padding: 8,
            cursor: "pointer",
            display: "inline-flex",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {flash && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.incomeSoft,
            border: "none",
            color: C.income,
            borderRadius: RADIUS.field,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          <Check size={16} /> Guardado: {flash}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600, marginBottom: 8 }}>¿Qué es?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = form.type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t.value, category: "" }))}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "14px 6px",
                    borderRadius: RADIUS.field,
                    border: "none",
                    background: active ? `${t.tone}22` : C.card,
                    color: active ? t.tone : C.inkSoft,
                    fontWeight: 600,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={22} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Importe (CHF)</span>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: normalizeDecimal(e.target.value) }))}
            style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 600, textAlign: "center" }}
          />
        </label>

        {accounts.length > 0 && (
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Cuenta</span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Wallet size={16} style={{ position: "absolute", left: 12, color: C.inkSoft }} />
              <select
                value={form.accountId}
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                style={{ ...inputStyle, paddingLeft: 38, appearance: "none" }}
              >
                <option value="">Sin cuenta asignada</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency || "CHF"})
                  </option>
                ))}
              </select>
            </div>
          </label>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Descripción</span>
          <input
            type="text"
            placeholder="p. ej. Migros"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            onBlur={onDescriptionBlur}
            style={inputStyle}
          />
        </label>

        <button
          type="submit"
          disabled={saving || !form.amount || !form.description.trim()}
          style={{
            background: C.ink,
            color: C.paper,
            border: "none",
            borderRadius: RADIUS.field,
            padding: "15px 14px",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            opacity: saving || !form.amount || !form.description.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
