import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { C, fmt, todayISO, monthOf, FIXED_SUGGESTIONS, VARIABLE_SUGGESTIONS, TYPE_LABEL, TYPE_COLOR } from "../lib/theme.js";
import { Eyebrow, TextField, SelectField, IconBtn } from "./ui.jsx";

export default function Diario({ transactions, addTransaction, deleteTransaction, month, setMonth }) {
  const [form, setForm] = useState({ date: todayISO(), description: "", category: "", type: "variable", amount: "" });
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const filtered = showAll ? transactions : transactions.filter((t) => monthOf(t.date) === month);
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, month, showAll]);

  const suggestions = form.type === "fixed" ? FIXED_SUGGESTIONS : form.type === "variable" ? VARIABLE_SUGGESTIONS : [];

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    setSaving(true);
    await addTransaction({
      date: form.date,
      description: form.description.trim(),
      category: form.category.trim() || (form.type === "income" ? "Ingreso" : "Otros"),
      type: form.type,
      amount: Number(form.amount),
    });
    setSaving(false);
    setForm({ date: form.date, description: "", category: "", type: form.type, amount: "" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow>Diario</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
            Movimientos
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={showAll}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              padding: "7px 10px",
              borderRadius: 3,
              border: `1px solid ${C.rule}`,
              background: showAll ? C.paperDeep : C.card,
              color: C.ink,
              opacity: showAll ? 0.5 : 1,
            }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif", color: C.inkSoft }}>
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Ver todo el historial
          </label>
        </div>
      </div>

      <form
        onSubmit={submit}
        style={{
          background: C.card,
          border: `1px solid ${C.rule}`,
          borderRadius: 4,
          padding: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
          alignItems: "end",
        }}
      >
        <TextField label="Fecha" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <TextField
          label="Descripción"
          type="text"
          placeholder="p. ej. Migros"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <SelectField
          label="Tipo"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value, category: "" })}
          options={[
            { value: "income", label: "Ingreso" },
            { value: "fixed", label: "Gasto fijo" },
            { value: "variable", label: "Gasto variable" },
          ]}
        />
        <div style={{ position: "relative" }}>
          <TextField
            label="Categoría"
            type="text"
            list="cat-suggestions"
            placeholder="opcional"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <datalist id="cat-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <TextField
          label="Importe (CHF)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <button
          type="submit"
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: C.ink,
            color: C.paper,
            border: "none",
            borderRadius: 3,
            padding: "9px 14px",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            height: 37,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Plus size={15} /> Apuntar
        </button>
      </form>

      <div style={{ background: C.card, border: `1px solid ${C.rule}`, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 640 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 130px 100px 110px 34px",
            padding: "9px 16px",
            borderBottom: `1px solid ${C.ruleStrong}`,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 10.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.inkSoft,
            fontWeight: 600,
          }}
        >
          <div>Fecha</div>
          <div>Descripción</div>
          <div>Categoría</div>
          <div>Tipo</div>
          <div style={{ textAlign: "right" }}>Importe</div>
          <div />
        </div>
        {rows.length === 0 ? (
          <p style={{ padding: 20, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.inkSoft }}>
            Nada apuntado todavía. Añade el primer movimiento arriba.
          </p>
        ) : (
          rows.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 130px 100px 110px 34px",
                padding: "10px 16px",
                borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.rule}`,
                alignItems: "center",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 12.5,
                color: C.ink,
              }}
            >
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: C.inkSoft }}>{t.date}</div>
              <div>{t.description}</div>
              <div style={{ color: C.inkSoft }}>{t.category}</div>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: TYPE_COLOR[t.type],
                    border: `1px solid ${TYPE_COLOR[t.type]}55`,
                    borderRadius: 20,
                    padding: "2px 8px",
                  }}
                >
                  {TYPE_LABEL[t.type]}
                </span>
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontVariantNumeric: "tabular-nums",
                  color: t.type === "income" ? C.income : C.expense,
                  fontWeight: 600,
                }}
              >
                {t.type === "income" ? "+" : "−"}
                {fmt(t.amount)}
              </div>
              <div style={{ textAlign: "right" }}>
                <IconBtn danger title="Eliminar" onClick={() => deleteTransaction(t.id)}>
                  <Trash2 size={13} />
                </IconBtn>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
      </div>
    </div>
  );
}
