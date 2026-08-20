import { useMemo } from "react";
import { C, fmt, monthOf, CURRENCIES } from "../lib/theme.js";
import { Eyebrow, Stamp } from "./ui.jsx";

export default function Resumen({ transactions, accounts, month, setMonth, displayCurrency, setDisplayCurrency, convert, ratesLoading }) {
  const monthTx = useMemo(() => transactions.filter((t) => monthOf(t.date) === month), [transactions, month]);

  const inDisplay = (t) => convert(t.amount, t.currency || "CHF", displayCurrency);

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + inDisplay(t), 0);
  const fixed = monthTx.filter((t) => t.type === "fixed").reduce((s, t) => s + inDisplay(t), 0);
  const variable = monthTx.filter((t) => t.type === "variable").reduce((s, t) => s + inDisplay(t), 0);
  const balance = income - fixed - variable;
  const patrimonio = accounts.reduce((s, a) => s + convert(a.balance, a.currency || "CHF", displayCurrency), 0);

  const byCategory = useMemo(() => {
    const map = {};
    monthTx
      .filter((t) => t.type === "variable")
      .forEach((t) => {
        const key = t.category || "Sin categoría";
        map[key] = (map[key] || 0) + convert(t.amount, t.currency || "CHF", displayCurrency);
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthTx, displayCurrency]);
  const maxCat = Math.max(1, ...byCategory.map((c) => c[1]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow>Cuenta de explotación</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
            Resumen del mes
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              padding: "7px 10px",
              borderRadius: 3,
              border: `1px solid ${C.rule}`,
              background: C.card,
              color: C.ink,
            }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.inkSoft, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Ver todo en
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                padding: "6px 8px",
                borderRadius: 3,
                border: `1px solid ${C.rule}`,
                background: C.card,
                color: C.ink,
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {ratesLoading && <span style={{ fontSize: 10.5 }}>actualizando tipos…</span>}
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <Stamp label="Ingresos" value={income} tone="income" currency={displayCurrency} />
        <Stamp label="Gastos fijos" value={fixed} tone="expense" currency={displayCurrency} />
        <Stamp label="Gastos variables" value={variable} tone="expense" currency={displayCurrency} />
        <Stamp label="Balance del mes" value={balance} tone={balance >= 0 ? "income" : "expense"} big currency={displayCurrency} />
      </div>

      <Stamp label="Patrimonio total (todas las cuentas)" value={patrimonio} tone="gold" big currency={displayCurrency} />

      <div style={{ background: C.card, border: `1px solid ${C.rule}`, borderRadius: 4, padding: "18px 20px" }}>
        <Eyebrow>Gastos variables por categoría</Eyebrow>
        {byCategory.length === 0 ? (
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.inkSoft, marginTop: 10 }}>
            Aún no hay gastos variables este mes.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
            {byCategory.map(([cat, amt]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 110, fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif", color: C.ink, flexShrink: 0 }}>
                  {cat}
                </div>
                <div style={{ flex: 1, background: C.paperDeep, borderRadius: 2, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${(amt / maxCat) * 100}%`, background: C.expense, height: "100%" }} />
                </div>
                <div style={{ width: 100, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: C.ink }}>
                  {fmt(amt)} {displayCurrency}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
