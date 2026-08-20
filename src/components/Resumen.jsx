import { useMemo } from "react";
import { C, fmt, monthOf } from "../lib/theme.js";
import { Eyebrow, Stamp } from "./ui.jsx";

export default function Resumen({ transactions, accounts, month, setMonth }) {
  const monthTx = useMemo(() => transactions.filter((t) => monthOf(t.date) === month), [transactions, month]);

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const fixed = monthTx.filter((t) => t.type === "fixed").reduce((s, t) => s + Number(t.amount), 0);
  const variable = monthTx.filter((t) => t.type === "variable").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - fixed - variable;
  const patrimonio = accounts.reduce((s, a) => s + Number(a.balance), 0);

  const byCategory = useMemo(() => {
    const map = {};
    monthTx
      .filter((t) => t.type === "variable")
      .forEach((t) => {
        map[t.category || "Sin categoría"] = (map[t.category || "Sin categoría"] || 0) + Number(t.amount);
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTx]);
  const maxCat = Math.max(1, ...byCategory.map((c) => c[1]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow>Cuenta de explotación</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
            Resumen del mes
          </h1>
        </div>
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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <Stamp label="Ingresos" value={income} tone="income" />
        <Stamp label="Gastos fijos" value={fixed} tone="expense" />
        <Stamp label="Gastos variables" value={variable} tone="expense" />
        <Stamp label="Balance del mes" value={balance} tone={balance >= 0 ? "income" : "expense"} big />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <Stamp label="Patrimonio total (todas las cuentas)" value={patrimonio} tone="gold" big />
        <div style={{ background: C.card, border: `1px solid ${C.rule}`, borderRadius: 4, padding: "16px 18px" }}>
          <Eyebrow>Cuentas registradas</Eyebrow>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: C.ink, marginTop: 6 }}>
            {accounts.length}
          </div>
        </div>
      </div>

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
                <div style={{ width: 90, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: C.ink }}>
                  {fmt(amt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
