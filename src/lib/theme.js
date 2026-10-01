const PALETTES = {
  light: {
    paper: "#EEF1EA",
    paperDeep: "#E4E8DF",
    card: "#FBFAF7",
    ink: "#202B22",
    inkSoft: "#5B6A5C",
    rule: "#C7CEC1",
    ruleStrong: "#9AA694",
    income: "#2F6F5E",
    incomeSoft: "#E4EFEA",
    expense: "#A6432F",
    expenseSoft: "#F3E5E0",
    gold: "#B8912B",
    goldSoft: "#F1E8D2",
    variable: "#8A5A2A",
  },
  dark: {
    paper: "#1B211C",
    paperDeep: "#141813",
    card: "#242B24",
    ink: "#E8ECE4",
    inkSoft: "#9BAA98",
    rule: "#343F35",
    ruleStrong: "#4A564B",
    income: "#56B695",
    incomeSoft: "#1D3A30",
    expense: "#E0876D",
    expenseSoft: "#3A241D",
    gold: "#D9B354",
    goldSoft: "#3A2F17",
    variable: "#C98A4B",
  },
};

// Paleta para los gráficos por categoría (orden estable, se recicla si hay más categorías que colores).
const CHART_PALETTES = {
  light: ["#A6432F", "#B8912B", "#2F6F5E", "#5B6E95", "#8A5A2A", "#6B4C7A", "#3F7A6B", "#9A5B6F"],
  dark: ["#E0876D", "#D9B354", "#56B695", "#8FA6D9", "#C98A4B", "#AA8AC9", "#5FBFA9", "#CB8AA6"],
};

export const C = { ...PALETTES.light };
export const TYPE_LABEL = { income: "Ingreso", fixed: "Fijo", variable: "Variable" };
export const TYPE_COLOR = { income: C.income, fixed: C.expense, variable: C.variable };
export const CHART_COLORS = [...CHART_PALETTES.light];

export function chartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

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
  const chartPalette = mode === "dark" ? CHART_PALETTES.dark : CHART_PALETTES.light;
  chartPalette.forEach((color, i) => {
    CHART_COLORS[i] = color;
  });
}

// Aplica el tema ya antes del primer render para que no haya parpadeo de claro -> oscuro.
applyTheme(getStoredTheme() || getSystemTheme());

export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');";

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
