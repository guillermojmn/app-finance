import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, BookText, Landmark, LogOut } from "lucide-react";
import { supabase, runQuery, friendlyError } from "./supabaseClient.js";
import { C, FONT_IMPORT, todayISO, CURRENCY } from "./lib/theme.js";
import { useExchangeRates } from "./lib/exchangeRates.js";
import { TabButton } from "./components/ui.jsx";
import Login from "./components/Login.jsx";
import Resumen from "./components/Resumen.jsx";
import Diario from "./components/Diario.jsx";
import Cuentas from "./components/Cuentas.jsx";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [view, setView] = useState("resumen");
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(() => localStorage.getItem("display-currency") || CURRENCY);
  const { convert, loading: ratesLoading } = useExchangeRates();

  useEffect(() => {
    localStorage.setItem("display-currency", displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Al volver a la app (móvil que estaba en segundo plano, pestaña reabierta),
  // renueva la sesión para que el token no salga caducado en la primera petición.
  useEffect(() => {
    function refresh() {
      if (document.visibilityState !== "visible") return;
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setSession(data.session);
      });
    }
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const loadData = useCallback(async (userId) => {
    setLoadingData(true);
    const [{ data: accs, error: accErr }, { data: txs, error: txErr }] = await Promise.all([
      runQuery(() => supabase.from("accounts").select("*").eq("user_id", userId).order("created_at")),
      runQuery(() => supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false })),
    ]);
    if (accErr || txErr) setError(friendlyError(accErr || txErr));
    else setError(null);
    setAccounts(accs || []);
    setTransactions(txs || []);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadData(session.user.id);
  }, [session, loadData]);

  // Positivo = ingreso a la cuenta, negativo = gasto de la cuenta.
  function txEffect(tx, accountCurrency) {
    const sign = tx.type === "income" ? 1 : -1;
    return convert(tx.amount, tx.currency || "CHF", accountCurrency || "CHF") * sign;
  }

  async function applyBalanceAdjustments(adjustments) {
    for (const [accountId, delta] of Object.entries(adjustments)) {
      if (!delta) continue;
      const account = accounts.find((a) => a.id === accountId);
      if (!account) continue;
      await updateAccount(accountId, { balance: Number(account.balance) + delta });
    }
  }

  async function addTransaction(tx) {
    const { data, error: err } = await runQuery(() =>
      supabase.from("transactions").insert({ ...tx, user_id: session.user.id }).select().single()
    );
    if (err) {
      setError(friendlyError(err));
      return false;
    }
    setError(null);
    setTransactions((prev) => [data, ...prev]);
    if (data.account_id) {
      const account = accounts.find((a) => a.id === data.account_id);
      if (account) await applyBalanceAdjustments({ [data.account_id]: txEffect(data, account.currency) });
    }
    return true;
  }

  async function updateTransaction(id, patch) {
    const old = transactions.find((t) => t.id === id);
    const { data, error: err } = await runQuery(() =>
      supabase.from("transactions").update(patch).eq("id", id).select().single()
    );
    if (err) {
      setError(friendlyError(err));
      return;
    }
    setError(null);
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));

    const adjustments = {};
    if (old?.account_id) {
      const account = accounts.find((a) => a.id === old.account_id);
      if (account) adjustments[old.account_id] = (adjustments[old.account_id] || 0) - txEffect(old, account.currency);
    }
    if (data.account_id) {
      const account = accounts.find((a) => a.id === data.account_id);
      if (account) adjustments[data.account_id] = (adjustments[data.account_id] || 0) + txEffect(data, account.currency);
    }
    await applyBalanceAdjustments(adjustments);
  }

  async function deleteTransaction(id) {
    const old = transactions.find((t) => t.id === id);
    const { error: err } = await runQuery(() => supabase.from("transactions").delete().eq("id", id));
    if (err) {
      setError(friendlyError(err));
      return;
    }
    setError(null);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (old?.account_id) {
      const account = accounts.find((a) => a.id === old.account_id);
      if (account) await applyBalanceAdjustments({ [old.account_id]: -txEffect(old, account.currency) });
    }
  }

  async function addAccount(acc) {
    const { data, error: err } = await runQuery(() =>
      supabase.from("accounts").insert({ ...acc, user_id: session.user.id }).select().single()
    );
    if (err) {
      setError(friendlyError(err));
      return;
    }
    setError(null);
    setAccounts((prev) => [...prev, data]);
  }

  async function updateAccount(id, patch) {
    const { data, error: err } = await runQuery(() =>
      supabase.from("accounts").update(patch).eq("id", id).select().single()
    );
    if (err) {
      setError(friendlyError(err));
      return;
    }
    setError(null);
    setAccounts((prev) => prev.map((a) => (a.id === id ? data : a)));
  }

  async function deleteAccount(id) {
    const { error: err } = await runQuery(() => supabase.from("accounts").delete().eq("id", id));
    if (err) {
      setError(friendlyError(err));
      return;
    }
    setError(null);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONT_IMPORT}</style>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: C.inkSoft, fontSize: 13 }}>Abriendo el libro…</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="ledger-shell" style={{ minHeight: "100vh", background: C.paper, display: "flex", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; }
        input:focus, select:focus, button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 1px; }
        .ledger-mobile-topbar, .ledger-mobile-bottomnav { display: none; }
        @media (max-width: 720px) {
          .ledger-nav { display: none !important; }
          .ledger-mobile-topbar { display: flex !important; }
          .ledger-mobile-bottomnav { display: flex !important; }
          .ledger-main { padding: 16px 14px calc(84px + env(safe-area-inset-bottom)) !important; }
        }
      `}</style>

      <nav
        className="ledger-nav"
        style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${C.rule}`, paddingTop: 18, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: C.ink }}>Cuentas</div>
          <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>{session.user.email}</div>
        </div>
        <TabButton active={view === "resumen"} onClick={() => setView("resumen")} icon={LayoutDashboard} label="Resumen" hint="Cuenta de explotación" />
        <TabButton active={view === "diario"} onClick={() => setView("diario")} icon={BookText} label="Diario" hint="Todos los movimientos" />
        <TabButton active={view === "cuentas"} onClick={() => setView("cuentas")} icon={Landmark} label="Cuentas" hint="Saldos bancarios" />
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            border: "none",
            background: "transparent",
            color: C.inkSoft,
            cursor: "pointer",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12.5,
          }}
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          className="ledger-mobile-topbar"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            paddingTop: "calc(12px + env(safe-area-inset-top))",
            borderBottom: `1px solid ${C.rule}`,
            background: C.card,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: C.ink }}>Cuentas</div>
            <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>{session.user.email}</div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            title="Cerrar sesión"
            style={{
              border: `1px solid ${C.rule}`,
              background: C.paperDeep,
              color: C.inkSoft,
              borderRadius: 5,
              padding: 9,
              cursor: "pointer",
              display: "inline-flex",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>

        <main className="ledger-main" style={{ flex: 1, padding: "26px 30px 40px", minWidth: 0 }}>
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 4,
              border: `1px solid ${C.expense}`,
              background: C.expenseSoft,
              color: C.expense,
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}
        {loadingData ? (
          <p style={{ color: C.inkSoft, fontSize: 13 }}>Abriendo el libro…</p>
        ) : view === "resumen" ? (
          <Resumen
            transactions={transactions}
            accounts={accounts}
            month={month}
            setMonth={setMonth}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
            convert={convert}
            ratesLoading={ratesLoading}
          />
        ) : view === "diario" ? (
          <Diario
            transactions={transactions}
            accounts={accounts}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction}
            month={month}
            setMonth={setMonth}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
            convert={convert}
            ratesLoading={ratesLoading}
          />
        ) : (
          <Cuentas
            accounts={accounts}
            addAccount={addAccount}
            updateAccount={updateAccount}
            deleteAccount={deleteAccount}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
            convert={convert}
            ratesLoading={ratesLoading}
          />
        )}
        </main>

        <nav
          className="ledger-mobile-bottomnav"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: `1px solid ${C.rule}`,
            background: C.card,
            paddingBottom: "env(safe-area-inset-bottom)",
            zIndex: 10,
          }}
        >
          {[
            { key: "resumen", icon: LayoutDashboard, label: "Resumen" },
            { key: "diario", icon: BookText, label: "Diario" },
            { key: "cuentas", icon: Landmark, label: "Cuentas" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "10px 4px 8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <Icon size={20} color={view === key ? C.gold : C.inkSoft} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: view === key ? C.ink : C.inkSoft }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
