export const C = {
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
};

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

export const FIXED_SUGGESTIONS = ["Alquiler", "Seguro", "Suscripciones", "Gimnasio", "Teléfono", "Internet"];
export const VARIABLE_SUGGESTIONS = ["Comida", "Transporte", "Ocio", "Compras", "Salud", "Viajes"];
export const INCOME_SUGGESTIONS = ["Salario", "Freelance", "Regalo", "Otros ingresos"];

export const TYPE_LABEL = { income: "Ingreso", fixed: "Fijo", variable: "Variable" };
export const TYPE_COLOR = { income: C.income, fixed: C.expense, variable: "#8A5A2A" };
