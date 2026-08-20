import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { C, fmt } from "../lib/theme.js";
import { Eyebrow, Stamp, TextField, SelectField, IconBtn } from "./ui.jsx";

export default function Cuentas({ accounts, addAccount, updateAccount, deleteAccount }) {
  const [form, setForm] = useState({ name: "", type: "corriente", balance: "" });
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const total = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const corriente = accounts.filter((a) => a.type === "corriente").reduce((s, a) => s + Number(a.balance), 0);
  const ahorro = accounts.filter((a) => a.type === "ahorro").reduce((s, a) => s + Number(a.balance), 0);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await addAccount({ name: form.name.trim(), type: form.type, balance: Number(form.balance) || 0 });
    setSaving(false);
    setForm({ name: "", type: "corriente", balance: "" });
  }

  async function saveEdit(id) {
    await updateAccount(id, { balance: Number(editValue) || 0 });
    setEditing(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Eyebrow>Cuentas</Eyebrow>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0" }}>
          Cuentas bancarias
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <Stamp label="Cuentas corrientes" value={corriente} tone="ink" />
        <Stamp label="Cuentas de ahorro" value={ahorro} tone="gold" />
        <Stamp label="Patrimonio total" value={total} tone="income" big />
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
        <TextField
          label="Nombre de la cuenta"
          type="text"
          placeholder="p. ej. UBS Privatkonto"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <SelectField
          label="Tipo"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          options={[
            { value: "corriente", label: "Corriente" },
            { value: "ahorro", label: "Ahorro" },
          ]}
        />
        <TextField
          label="Saldo actual (CHF)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: e.target.value })}
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
          accounts.map((a) => (
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
                <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "capitalize" }}>{a.type}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {editing === a.id ? (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        width: 110,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 13,
                        padding: "6px 8px",
                        borderRadius: 3,
                        border: `1px solid ${C.rule}`,
                      }}
                    />
                    <IconBtn title="Guardar" onClick={() => saveEdit(a.id)}>
                      <Check size={13} />
                    </IconBtn>
                    <IconBtn title="Cancelar" onClick={() => setEditing(null)}>
                      <X size={13} />
                    </IconBtn>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 16,
                        fontWeight: 600,
                        color: C.ink,
                      }}
                    >
                      {fmt(a.balance)} CHF
                    </div>
                    <IconBtn
                      title="Editar saldo"
                      onClick={() => {
                        setEditing(a.id);
                        setEditValue(String(a.balance));
                      }}
                    >
                      <Pencil size={13} />
                    </IconBtn>
                    <IconBtn danger title="Eliminar cuenta" onClick={() => deleteAccount(a.id)}>
                      <Trash2 size={13} />
                    </IconBtn>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
