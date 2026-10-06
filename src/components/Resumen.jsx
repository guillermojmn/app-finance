import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { C, fmt, monthOf, CURRENCIES, HEADING_FONT, RADIUS } from "../lib/theme.js";
import { Eyebrow, Stamp } from "./ui.jsx";

export default function Resumen({ transactions, accounts, month, setMonth, displayCurrency, setDisplayCurrency, convert, ratesLoading }) {
  const [expanded, setExpanded] = useState(null);
  const monthTx = useMemo(() => transactions.filter((t) => monthOf(t.date) === month), [transactions, month]);

  const inDisplay = (t) => convert(t.amount, t.currency || "CHF", displayCurrency);

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + inDisplay(t), 0);
  const fixed = monthTx.filter((t) => t.type === "fixed").reduce((s, t) => s + inDisplay(t), 0);
  const variable = monthTx.filter((t) => t.type === "variable").reduce((s, t) => s + inDisplay(t), 0);
  const totalExpenses = fixed + variable;
  const balance = income - totalExpenses;
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

  const byCategoryDetail = useMemo(() => {
    const map = {};
    monthTx
      .filter((t) => t.type === "variable")
      .forEach((t) => {
        const key = t.category || "Sin categoría";
        (map[key] = map[key] || []).push(t);
      });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return (b.created_at || "").localeCompare(a.created_at || "");
      })
    );
    return map;
  }, [monthTx]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow>Cuenta de explotación</Eyebrow>
          <h1 style={{ fontFamily: HEADING_FONT, fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
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
              padding: "8px 12px",
              borderRadius: RADIUS.field,
              border: "none",
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
                padding: "7px 10px",
                borderRadius: RADIUS.field,
                border: "none",
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
        <Stamp label="Gastos totales (fijos + variables)" value={totalExpenses} tone="expense" currency={displayCurrency} />
        <Stamp label="Balance del mes" value={balance} tone={balance >= 0 ? "income" : "expense"} big currency={displayCurrency} />
      </div>

      <Stamp label="Patrimonio total (todas las cuentas)" value={patrimonio} tone="gold" big currency={displayCurrency} />

      <div style={{ background: C.card, borderRadius: RADIUS.card, padding: "20px 22px" }}>
        <Eyebrow>Gastos variables por categoría</Eyebrow>
        {byCategory.length === 0 ? (
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.inkSoft, marginTop: 10 }}>
            Aún no hay gastos variables este mes.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {byCategory.map(([cat, amt]) => {
              const isOpen = expanded === cat;
              const items = byCategoryDetail[cat] || [];
              return (
                <div key={cat} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : cat)}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12.5,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        color: C.ink,
                        fontWeight: 600,
                      }}
                    >
                      {isOpen ? <ChevronDown size={14} color={C.inkSoft} /> : <ChevronRight size={14} color={C.inkSoft} />}
                      {cat}
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: C.ink }}>
                      {fmt(amt)} {displayCurrency}
                    </span>
                  </button>
                  <div style={{ background: C.paperDeep, borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${(amt / maxCat) * 100}%`, background: C.expense, height: "100%", borderRadius: 6 }} />
                  </div>
                  {isOpen && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        marginTop: 4,
                        paddingLeft: 19,
                        borderLeft: `2px solid ${C.paperDeep}`,
                      }}
                    >
                      {items.map((t) => {
                        const converted = convert(t.amount, t.currency || "CHF", displayCurrency);
                        const showConverted = (t.currency || "CHF") !== displayCurrency;
                        return (
                          <div key={t.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                            <span style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{t.date}</span> · {t.description}
                            </span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: C.inkSoft, whiteSpace: "nowrap" }}>
                              {fmt(t.amount)} {t.currency || "CHF"}
                              {showConverted && ` (≈${fmt(converted)} ${displayCurrency})`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
