import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, BookText, Landmark, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient.js";
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

  const loadData = useCallback(async (userId) => {
    setLoadingData(true);
    const [{ data: accs, error: accErr }, { data: txs, error: txErr }] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
    ]);
    if (accErr || txErr) setError((accErr || txErr).message);
    else setError(null);
    setAccounts(accs || []);
    setTransactions(txs || []);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadData(session.user.id);
  }, [session, loadData]);

  async function addTransaction(tx) {
    const { data, error: err } = await supabase
      .from("transactions")
      .insert({ ...tx, user_id: session.user.id })
      .select()
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    setTransactions((prev) => [data, ...prev]);
  }

  async function deleteTransaction(id) {
    const { error: err } = await supabase.from("transactions").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function addAccount(acc) {
    const { data, error: err } = await supabase
      .from("accounts")
      .insert({ ...acc, user_id: session.user.id })
      .select()
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    setAccounts((prev) => [...prev, data]);
  }

  async function updateAccount(id, patch) {
    const { data, error: err } = await supabase.from("accounts").update(patch).eq("id", id).select().single();
    if (err) {
      setError(err.message);
      return;
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? data : a)));
  }

  async function deleteAccount(id) {
    const { error: err } = await supabase.from("accounts").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
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
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; }
        input:focus, select:focus, button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 1px; }
        @media (max-width: 720px) {
          .ledger-nav { flex-direction: row !important; width: 100% !important; border-right: none !important; border-bottom: 1px solid ${C.rule}; overflow-x: auto; }
        }
      `}</style>

      <nav
        className="ledger-nav"
        style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${C.rule}`, paddingTop: 18, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: C.ink }}>Libro Mayor</div>
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

      <main style={{ flex: 1, padding: "26px 30px 40px", minWidth: 0 }}>
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
          <Diario transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} month={month} setMonth={setMonth} />
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
    </div>
  );
}
