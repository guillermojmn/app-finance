import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { C, fmt, fmtDate, monthOf, monthShift, monthName, CURRENCIES, HEADING_FONT, RADIUS, TYPE_LABEL } from "../lib/theme.js";
import { Eyebrow } from "./ui.jsx";

const MONO = "'IBM Plex Mono', monospace";
const SANS = "'IBM Plex Sans', sans-serif";

const cardStyle = () => ({ background: C.card, borderRadius: RADIUS.card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 });

function totals(txs, inDisplay) {
  const sum = (type) => txs.filter((t) => t.type === type).reduce((s, t) => s + inDisplay(t), 0);
  const income = sum("income");
  const fixed = sum("fixed");
  const variable = sum("variable");
  return { income, fixed, variable, expenses: fixed + variable, balance: income - fixed - variable };
}

function pct(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function Dot({ color }) {
  return <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: color, flex: "none" }} />;
}

// Chip "▲ 34.45 vs oct". higherIsGood decide si subir es verde (ingresos, balance) o rojo (gastos).
function Delta({ current, previous, higherIsGood, prevLabel }) {
  if (previous == null) return null;
  const diff = current - previous;
  const flat = Math.abs(diff) < 0.005;
  const good = flat ? null : diff > 0 === higherIsGood;
  const color = flat ? C.inkSoft : good ? C.income : C.expense;
  const background = flat ? C.rule : good ? C.incomeSoft : C.expenseSoft;
  return (
    <span
      style={{
        alignSelf: "flex-start",
        fontFamily: SANS,
        fontSize: 11.5,
        fontWeight: 600,
        color,
        background,
        borderRadius: RADIUS.pill,
        padding: "2px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {flat ? `= igual que ${prevLabel}` : `${diff > 0 ? "▲" : "▼"} ${fmt(Math.abs(diff))} vs ${prevLabel}`}
    </span>
  );
}

function Money({ value, color = C.ink, size = 20, currency, weight = 600 }) {
  return (
    <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: size, fontWeight: weight, color, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
      {fmt(value)}
      {currency && <span style={{ fontSize: Math.max(11, size * 0.42), fontWeight: 500, color: C.inkSoft, marginLeft: 6 }}>{currency}</span>}
    </span>
  );
}

function BalanceHero({ t, monthLabel, prev, prevLabel, currency }) {
  const positive = t.balance >= 0;
  const base = Math.max(t.income, t.expenses);
  const saved = Math.max(0, t.balance);
  let message;
  if (t.income <= 0 && t.expenses <= 0) message = "Aún no hay movimientos este mes.";
  else if (t.income <= 0) message = "Aún no hay ingresos este mes.";
  else if (positive) message = (<>Ahorras el <b style={{ color: C.ink }}>{pct(t.balance, t.income)}%</b> de tus ingresos</>);
  else message = (<>Has gastado <b style={{ color: C.ink }}>{fmt(-t.balance)} {currency}</b> más de lo que has ingresado</>);

  return (
    <div style={{ ...cardStyle(), flex: "1.6 1 320px", gap: 12 }}>
      <Eyebrow>Balance de {monthLabel}</Eyebrow>
      <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: "clamp(34px, 7vw, 46px)", fontWeight: 700, color: positive ? C.income : C.expense, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
        {positive ? "+" : "−"}
        {fmt(Math.abs(t.balance))}
        <span style={{ fontSize: 18, fontWeight: 500, color: C.inkSoft, marginLeft: 8 }}>{currency}</span>
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: SANS, fontSize: 13, color: C.inkSoft }}>
        <span>{message}</span>
        <Delta current={t.balance} previous={prev?.balance} higherIsGood prevLabel={prevLabel} />
      </div>
      {base > 0 && (
        <div
          aria-label="Reparto de los ingresos entre gastos fijos, variables y lo que queda"
          style={{ display: "flex", gap: 2, height: 12, borderRadius: 7, overflow: "hidden", background: C.paperDeep, marginTop: 2 }}
        >
          <div style={{ width: `${(t.fixed / base) * 100}%`, background: C.expense }} />
          <div style={{ width: `${(t.variable / base) * 100}%`, background: C.variable }} />
          <div style={{ width: `${(saved / base) * 100}%`, background: C.income }} />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, dotColor, value, color, prevValue, higherIsGood, prevLabel }) {
  return (
    <div style={cardStyle()}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {dotColor && <Dot color={dotColor} />}
        <Eyebrow>{label}</Eyebrow>
      </div>
      <Money value={value} color={color} />
      <Delta current={value} previous={prevValue} higherIsGood={higherIsGood} prevLabel={prevLabel} />
    </div>
  );
}

function WhereMoneyWent({ monthTx, totalExpenses, displayCurrency, convert }) {
  const [expanded, setExpanded] = useState(null);

  // Fijos y variables en una sola lista. Se agrupan por tipo + categoría, así "Comida" fija y "Comida" variable no se mezclan.
  const groups = useMemo(() => {
    const map = {};
    monthTx
      .filter((t) => t.type === "fixed" || t.type === "variable")
      .forEach((t) => {
        const category = t.category || "Sin categoría";
        const key = `${t.type}|${category}`;
        const g = (map[key] = map[key] || { key, type: t.type, category, amount: 0, items: [] });
        g.amount += convert(t.amount, t.currency || "CHF", displayCurrency);
        g.items.push(t);
      });
    const list = Object.values(map).sort((a, b) => b.amount - a.amount);
    list.forEach((g) =>
      g.items.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return (b.created_at || "").localeCompare(a.created_at || "");
      })
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthTx, displayCurrency]);

  return (
    <div style={{ ...cardStyle(), padding: "20px 22px", gap: 0 }}>
      <Eyebrow>
        Adónde se fue el dinero{totalExpenses > 0 && ` · ${fmt(totalExpenses)} ${displayCurrency}`}
      </Eyebrow>
      {groups.length === 0 ? (
        <p style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, margin: "10px 0 0" }}>Aún no hay gastos este mes.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          {groups.map((g, i) => {
            const isOpen = expanded === g.key;
            const share = totalExpenses > 0 ? (g.amount / totalExpenses) * 100 : 0;
            const color = g.type === "fixed" ? C.expense : C.variable;
            return (
              <div key={g.key} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${C.rule}` }}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : g.key)}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", padding: 0, cursor: "pointer", width: "100%", textAlign: "left" }}
                >
                  {isOpen ? <ChevronDown size={14} color={C.inkSoft} /> : <ChevronRight size={14} color={C.inkSoft} />}
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.category}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color, background: `${color}1f`, borderRadius: RADIUS.pill, padding: "2px 8px", flex: "none" }}>
                      {TYPE_LABEL[g.type]}
                    </span>
                  </span>
                  <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>{fmt(g.amount)}</span>
                  <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 12, color: C.inkSoft, width: 40, textAlign: "right" }}>
                    {Math.round(share)}%
                  </span>
                </button>
                <div style={{ marginLeft: 24, background: C.paperDeep, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${share}%`, background: color, height: "100%", borderRadius: 4 }} />
                </div>
                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, marginLeft: 24, padding: "8px 12px", background: C.paperDeep, borderRadius: 10 }}>
                    {g.items.map((t) => {
                      const converted = convert(t.amount, t.currency || "CHF", displayCurrency);
                      const showConverted = (t.currency || "CHF") !== displayCurrency;
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                          <span style={{ fontSize: 12, color: C.inkSoft, fontFamily: SANS, minWidth: 0 }}>
                            <span style={{ fontWeight: 500, color: C.ink }}>{fmtDate(t.date, { year: false })}</span> · {t.description}
                          </span>
                          <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkSoft, whiteSpace: "nowrap" }}>
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
  );
}

export default function Resumen({ transactions, accounts, month, setMonth, displayCurrency, setDisplayCurrency, convert, ratesLoading }) {
  const inDisplay = (t) => convert(t.amount, t.currency || "CHF", displayCurrency);
  const prevMonth = monthShift(month, -1);

  const monthTx = useMemo(() => transactions.filter((t) => monthOf(t.date) === month), [transactions, month]);
  const prevTx = useMemo(() => transactions.filter((t) => monthOf(t.date) === prevMonth), [transactions, prevMonth]);

  const t = totals(monthTx, inDisplay);
  // Sin movimientos el mes anterior no hay con qué comparar: se ocultan las comparaciones.
  const prev = prevTx.length > 0 ? totals(prevTx, inDisplay) : null;
  const prevLabel = monthName(prevMonth, { short: true });
  const patrimonio = accounts.reduce((s, a) => s + convert(a.balance, a.currency || "CHF", displayCurrency), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
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
              fontFamily: MONO,
              fontSize: 13,
              padding: "8px 12px",
              borderRadius: RADIUS.field,
              border: "none",
              background: C.card,
              color: C.ink,
            }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>
            Ver todo en
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              style={{
                fontFamily: MONO,
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

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <BalanceHero t={t} monthLabel={monthName(month)} prev={prev} prevLabel={prevLabel} currency={displayCurrency} />
        <div style={{ ...cardStyle(), flex: "1 1 220px" }}>
          <Eyebrow>Patrimonio total</Eyebrow>
          <Money value={patrimonio} color={C.gold} size={26} weight={700} currency={displayCurrency} />
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft }}>
            {accounts.length === 0
              ? "Añade tus cuentas en la pestaña Cuentas"
              : `En ${accounts.length === 1 ? "tu cuenta" : `tus ${accounts.length} cuentas`}`}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <MiniStat label="Ingresos" value={t.income} color={C.income} prevValue={prev?.income} higherIsGood prevLabel={prevLabel} />
        <MiniStat
          label={t.income > 0 ? `Fijos · ${pct(t.fixed, t.income)}%` : "Fijos"}
          dotColor={C.expense}
          value={t.fixed}
          prevValue={prev?.fixed}
          higherIsGood={false}
          prevLabel={prevLabel}
        />
        <MiniStat
          label={t.income > 0 ? `Variables · ${pct(t.variable, t.income)}%` : "Variables"}
          dotColor={C.variable}
          value={t.variable}
          prevValue={prev?.variable}
          higherIsGood={false}
          prevLabel={prevLabel}
        />
      </div>

      <WhereMoneyWent monthTx={monthTx} totalExpenses={t.expenses} displayCurrency={displayCurrency} convert={convert} />
    </div>
  );
}
