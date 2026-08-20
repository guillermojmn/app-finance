import { C, fmt, CURRENCY } from "../lib/theme.js";

export function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 11,
        letterSpacing: "0.14em",
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
    <div style={{ background: C.card, border: `1px solid ${C.rule}`, borderRadius: 4, padding: "16px 18px" }}>
      <Eyebrow>{label}</Eyebrow>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontVariantNumeric: "tabular-nums",
          fontSize: big ? 28 : 22,
          fontWeight: 600,
          color,
          marginTop: 6,
          paddingBottom: big ? 8 : 0,
          borderBottom: big ? `3px double ${C.ruleStrong}` : "none",
        }}
      >
        {fmt(value)} <span style={{ fontSize: big ? 14 : 12, fontWeight: 500, color: C.inkSoft }}>{currency}</span>
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
        padding: "12px 16px",
        border: "none",
        background: active ? C.card : "transparent",
        borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <Icon size={17} color={active ? C.ink : C.inkSoft} />
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
          padding: "8px 10px",
          borderRadius: 3,
          border: `1px solid ${C.rule}`,
          background: "#fff",
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
          padding: "8px 10px",
          borderRadius: 3,
          border: `1px solid ${C.rule}`,
          background: "#fff",
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
        border: `1px solid ${danger ? C.expense : C.rule}`,
        background: "transparent",
        color: danger ? C.expense : C.inkSoft,
        borderRadius: 3,
        padding: "5px 7px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </button>
  );
}
