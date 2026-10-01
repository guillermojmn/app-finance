const PALETTES = {
  light: {
    paper: "#F4F5F7",
    paperDeep: "#E7E9ED",
    card: "#FFFFFF",
    ink: "#10151A",
    inkSoft: "#6B7280",
    rule: "#E4E6EA",
    ruleStrong: "#D4D7DC",
    income: "#1BAA5C",
    incomeSoft: "#E3F7EC",
    expense: "#E0333F",
    expenseSoft: "#FBE7E8",
    gold: "#E08A1E",
    goldSoft: "#FDEEDB",
    variable: "#3A6CF0",
  },
  dark: {
    paper: "#0B0D0E",
    paperDeep: "#060708",
    card: "#16191B",
    ink: "#F2F4F2",
    inkSoft: "#8A9290",
    rule: "#23272A",
    ruleStrong: "#2F3437",
    income: "#2ED47A",
    incomeSoft: "#13301F",
    expense: "#FF5C5C",
    expenseSoft: "#341414",
    gold: "#FFB648",
    goldSoft: "#3A2A0E",
    variable: "#5B8CFF",
  },
};

// Radios de las tarjetas/campos planos del nuevo estilo "fintech".
export const RADIUS = { card: 16, field: 12, pill: 20 };

export const C = { ...PALETTES.light };
export const TYPE_LABEL = { income: "Ingreso", fixed: "Fijo", variable: "Variable" };
export const TYPE_COLOR = { income: C.income, fixed: C.expense, variable: C.variable };

const THEME_KEY = "ledger-theme";

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

export function getSystemTheme() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function storeTheme(mode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore
  }
}

// Muta C y TYPE_COLOR in-place (mismas referencias que ya tienen importadas los componentes)
// para que el siguiente render recoja los colores del tema sin tener que pasar C por props.
export function applyTheme(mode) {
  Object.assign(C, mode === "dark" ? PALETTES.dark : PALETTES.light);
  TYPE_COLOR.income = C.income;
  TYPE_COLOR.fixed = C.expense;
  TYPE_COLOR.variable = C.variable;
}

// Aplica el tema ya antes del primer render para que no haya parpadeo de claro -> oscuro.
applyTheme(getStoredTheme() || getSystemTheme());

export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');";

export const HEADING_FONT = "'Space Grotesk', sans-serif";

export const CURRENCY = "CHF";
export const CURRENCIES = ["CHF", "EUR", "USD"];

export function fmt(n) {
  const v = Number(n) || 0;
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthOf(dateStr) {
  return (dateStr || "").slice(0, 7);
}

// Para que "," y "." valgan igual como separador decimal al escribir un importe.
export function normalizeDecimal(str) {
  return str.replace(",", ".");
}

export function monthShift(monthStr, delta) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function daysInMonth(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export const FIXED_SUGGESTIONS = ["Alquiler", "Seguro", "Suscripciones", "Gimnasio", "Teléfono", "Internet"];
export const VARIABLE_SUGGESTIONS = ["Comida", "Transporte", "Ocio", "Compras", "Ropa", "Salud", "Viajes", "Cuenta conjunta"];
export const INCOME_SUGGESTIONS = ["Salario", "Freelance", "Regalo", "Otros ingresos"];
