import { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  C,
  fmt,
  todayISO,
  monthOf,
  CURRENCIES,
  FIXED_SUGGESTIONS,
  VARIABLE_SUGGESTIONS,
  INCOME_SUGGESTIONS,
  TYPE_LABEL,
  TYPE_COLOR,
} from "../lib/theme.js";
import { Eyebrow, TextField, SelectField, IconBtn } from "./ui.jsx";

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));
const OTHER = "__other__";

export default function Diario({ transactions, addTransaction, updateTransaction, deleteTransaction, month, setMonth }) {
  const [form, setForm] = useState({ date: todayISO(), description: "", category: "", customCategory: "", type: "variable", amount: "", currency: "CHF" });
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ category: "", customCategory: "", amount: "", currency: "CHF" });

  const rows = useMemo(() => {
    const filtered = showAll ? transactions : transactions.filter((t) => monthOf(t.date) === month);
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, month, showAll]);

  const categoryOptionsByType = useMemo(() => {
    const sets = { income: new Set(INCOME_SUGGESTIONS), fixed: new Set(FIXED_SUGGESTIONS), variable: new Set(VARIABLE_SUGGESTIONS) };
    transactions.forEach((t) => {
      if (t.category && sets[t.type]) sets[t.type].add(t.category);
    });
    return {
      income: [...sets.income].sort(),
      fixed: [...sets.fixed].sort(),
      variable: [...sets.variable].sort(),
    };
  }, [transactions]);

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    const resolvedCategory =
      form.category === OTHER
        ? form.customCategory.trim() || null
        : form.category || (form.type === "income" ? "Ingreso" : "Otros");
    setSaving(true);
    await addTransaction({
      date: form.date,
      description: form.description.trim(),
      category: resolvedCategory,
      type: form.type,
      amount: Number(form.amount),
      currency: form.currency,
    });
    setSaving(false);
    setForm({ date: form.date, description: "", category: "", customCategory: "", type: form.type, amount: "", currency: form.currency });
  }

  function startEdit(t) {
    setEditing(t.id);
    const known = categoryOptionsByType[t.type]?.includes(t.category);
    setEditValues({
      category: t.category ? (known ? t.category : OTHER) : "",
      customCategory: t.category && !known ? t.category : "",
      amount: String(t.amount),
      currency: t.currency || "CHF",
    });
  }

  async function saveEdit(id) {
    const resolvedCategory = editValues.category === OTHER ? editValues.customCategory.trim() || null : editValues.category || null;
    await updateTransaction(id, {
      category: resolvedCategory,
      amount: Number(editValues.amount) || 0,
      currency: editValues.currency,
    });
    setEditing(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow>Diario</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
            Movimientos
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
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
          onChange={(e) => setForm({ ...form, type: e.target.value, category: "", customCategory: "" })}
          options={[
            { value: "income", label: "Ingreso" },
            { value: "fixed", label: "Gasto fijo" },
            { value: "variable", label: "Gasto variable" },
          ]}
        />
        <SelectField
          label="Categoría"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={[
            { value: "", label: "Sin categoría" },
            ...categoryOptionsByType[form.type].map((c) => ({ value: c, label: c })),
            { value: OTHER, label: "Otro…" },
          ]}
        />
        {form.category === OTHER && (
          <TextField
            label="Nueva categoría"
            type="text"
            placeholder="p. ej. Regalos"
            value={form.customCategory}
            onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
          />
        )}
        <TextField
          label="Importe"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <SelectField
          label="Moneda"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          options={CURRENCY_OPTIONS}
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 ? (
          <p
            style={{
              background: C.card,
              border: `1px solid ${C.rule}`,
              borderRadius: 4,
              padding: 20,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13,
              color: C.inkSoft,
            }}
          >
            Nada apuntado todavía. Añade el primer movimiento arriba.
          </p>
        ) : (
          rows.map((t) => (
            <div
              key={t.id}
              style={{
                background: C.card,
                border: `1px solid ${C.rule}`,
                borderRadius: 4,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: C.inkSoft }}>{t.date}</span>
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
                {editing !== t.id && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontVariantNumeric: "tabular-nums",
                      color: t.type === "income" ? C.income : C.expense,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {fmt(t.amount)} {t.currency || "CHF"}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 12.5, color: C.ink }}>{t.description}</div>

              {editing === t.id ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "end", marginTop: 4 }}>
                  <SelectField
                    label="Categoría"
                    value={editValues.category}
                    onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                    options={[
                      { value: "", label: "Sin categoría" },
                      ...categoryOptionsByType[t.type].map((c) => ({ value: c, label: c })),
                      { value: OTHER, label: "Otro…" },
                    ]}
                  />
                  {editValues.category === OTHER && (
                    <TextField
                      label="Nueva categoría"
                      type="text"
                      placeholder="p. ej. Regalos"
                      value={editValues.customCategory}
                      onChange={(e) => setEditValues({ ...editValues, customCategory: e.target.value })}
                    />
                  )}
                  <TextField
                    label="Importe"
                    type="number"
                    step="0.01"
                    value={editValues.amount}
                    onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                  />
                  <SelectField
                    label="Moneda"
                    value={editValues.currency}
                    onChange={(e) => setEditValues({ ...editValues, currency: e.target.value })}
                    options={CURRENCY_OPTIONS}
                  />
                  <IconBtn title="Guardar" onClick={() => saveEdit(t.id)}>
                    <Check size={13} />
                  </IconBtn>
                  <IconBtn title="Cancelar" onClick={() => setEditing(null)}>
                    <X size={13} />
                  </IconBtn>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: C.inkSoft }}>{t.category || "Sin categoría"}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <IconBtn title="Editar" onClick={() => startEdit(t)}>
                      <Pencil size={13} />
                    </IconBtn>
                    <IconBtn danger title="Eliminar" onClick={() => deleteTransaction(t.id)}>
                      <Trash2 size={13} />
                    </IconBtn>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
