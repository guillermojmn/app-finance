import { C, fmt, CURRENCY, RADIUS } from "../lib/theme.js";

export function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.inkSoft,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

export function Stamp({ label, value, tone = "ink", big, currency = CURRENCY }) {
  const color = tone === "income" ? C.income : tone === "expense" ? C.expense : tone === "gold" ? C.gold : C.ink;
  return (
    <div style={{ background: C.card, borderRadius: RADIUS.card, padding: "18px 20px" }}>
      <Eyebrow>{label}</Eyebrow>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontVariantNumeric: "tabular-nums",
          fontSize: big ? 32 : 24,
          fontWeight: 700,
          color,
          marginTop: 8,
          letterSpacing: "-0.01em",
        }}
      >
        {fmt(value)} <span style={{ fontSize: big ? 15 : 12.5, fontWeight: 500, color: C.inkSoft }}>{currency}</span>
      </div>
    </div>
  );
}

export function TabButton({ active, onClick, icon: Icon, label, hint }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "11px 14px",
        margin: "0 10px",
        border: "none",
        borderRadius: RADIUS.field,
        background: active ? C.paperDeep : "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <Icon size={17} color={active ? C.gold : C.inkSoft} />
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? C.ink : C.inkSoft }}>{label}</div>
        {hint && <div style={{ fontSize: 10.5, color: C.inkSoft }}>{hint}</div>}
      </div>
    </button>
  );
}

export function TextField({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
      <input
        {...props}
        style={{
          fontFamily: props.type === "number" ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
          fontSize: 13.5,
          padding: "9px 12px",
          borderRadius: RADIUS.field,
          border: "none",
          background: C.paperDeep,
          color: C.ink,
          outline: "none",
        }}
      />
    </label>
  );
}

export function SelectField({ label, options, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
      <select
        {...props}
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13.5,
          padding: "9px 12px",
          borderRadius: RADIUS.field,
          border: "none",
          background: C.paperDeep,
          color: C.ink,
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        border: "none",
        background: danger ? C.expenseSoft : C.paperDeep,
        color: danger ? C.expense : C.ink,
        borderRadius: RADIUS.field,
        padding: "8px 10px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}
