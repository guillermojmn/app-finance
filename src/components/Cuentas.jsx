import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { C, fmt, CURRENCIES, normalizeDecimal } from "../lib/theme.js";
import { Eyebrow, Stamp, TextField, SelectField, IconBtn } from "./ui.jsx";

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));

export default function Cuentas({
  accounts,
  addAccount,
  updateAccount,
  deleteAccount,
  displayCurrency,
  setDisplayCurrency,
  convert,
  ratesLoading,
}) {
  const [form, setForm] = useState({ name: "", balance: "", currency: displayCurrency });
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editCurrency, setEditCurrency] = useState(displayCurrency);
  const [saving, setSaving] = useState(false);

  const inDisplay = (a) => convert(a.balance, a.currency || "CHF", displayCurrency);

  const total = accounts.reduce((s, a) => s + inDisplay(a), 0);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await addAccount({
      name: form.name.trim(),
      type: "corriente",
      balance: Number(form.balance) || 0,
      currency: form.currency,
    });
    setSaving(false);
    setForm({ name: "", balance: "", currency: displayCurrency });
  }

  async function saveEdit(id) {
    await updateAccount(id, { balance: Number(editValue) || 0, currency: editCurrency });
    setEditing(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow>Cuentas</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
            Cuentas bancarias
          </h1>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.inkSoft, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Ver totales en
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

      <Stamp label="Patrimonio total" value={total} tone="income" big currency={displayCurrency} />

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
        <TextField
          label="Nombre de la cuenta"
          type="text"
          placeholder="p. ej. UBS Privatkonto"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="Saldo actual"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: normalizeDecimal(e.target.value) })}
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
          <Plus size={15} /> Añadir cuenta
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {accounts.length === 0 ? (
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.inkSoft }}>
            Aún no has añadido ninguna cuenta.
          </p>
        ) : (
          accounts.map((a) => {
            const currency = a.currency || "CHF";
            const converted = inDisplay(a);
            const showConverted = currency !== displayCurrency;
            return (
              <div
                key={a.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.rule}`,
                  borderRadius: 4,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: C.ink }}>
                    {a.name}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {editing === a.id ? (
                    <>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(normalizeDecimal(e.target.value))}
                        style={{
                          width: 100,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 13,
                          padding: "6px 8px",
                          borderRadius: 3,
                          border: `1px solid ${C.rule}`,
                          background: C.card,
                          color: C.ink,
                        }}
                      />
                      <select
                        value={editCurrency}
                        onChange={(e) => setEditCurrency(e.target.value)}
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 12.5,
                          padding: "6px 6px",
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
                      <IconBtn title="Guardar" onClick={() => saveEdit(a.id)}>
                        <Check size={15} />
                      </IconBtn>
                      <IconBtn title="Cancelar" onClick={() => setEditing(null)}>
                        <X size={15} />
                      </IconBtn>
                    </>
                  ) : (
                    <>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontVariantNumeric: "tabular-nums",
                            fontSize: 16,
                            fontWeight: 600,
                            color: C.ink,
                          }}
                        >
                          {fmt(a.balance)} {currency}
                        </div>
                        {showConverted && (
                          <div style={{ fontSize: 10.5, color: C.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>
                            ≈ {fmt(converted)} {displayCurrency}
                          </div>
                        )}
                      </div>
                      <IconBtn
                        title="Editar saldo"
                        onClick={() => {
                          setEditing(a.id);
                          setEditValue(String(a.balance));
                          setEditCurrency(currency);
                        }}
                      >
                        <Pencil size={15} />
                      </IconBtn>
                      <IconBtn danger title="Eliminar cuenta" onClick={() => deleteAccount(a.id)}>
                        <Trash2 size={15} />
                      </IconBtn>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
