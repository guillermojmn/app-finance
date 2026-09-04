import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y rellénalo.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Errores de sesión: el token JWT ha caducado o ya no vale.
function isAuthError(error) {
  if (!error) return false
  const status = error.status ?? error.code
  if (status === 401 || status === 403 || error.code === 'PGRST301') return true
  return /jwt|token|expired|refresh/i.test(error.message || '')
}

// Errores de red: fetch se ha caído (el "TypeError: Load failed" de Safari), timeout, etc.
function isNetworkError(error) {
  if (!error) return false
  if (error instanceof TypeError) return true
  return /load failed|network|fetch|timeout|connection/i.test(error.message || '')
}

/**
 * Ejecuta una consulta a Supabase y, si falla por sesión caducada o por un corte
 * de red, refresca el token y lo reintenta una vez de forma transparente.
 *
 *   const { data, error } = await runQuery(() =>
 *     supabase.from("transactions").insert(row).select().single()
 *   )
 */
export async function runQuery(queryFn, { retries = 1 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await queryFn()
      if (res?.error && attempt < retries && (isAuthError(res.error) || isNetworkError(res.error))) {
        if (isAuthError(res.error)) await supabase.auth.refreshSession().catch(() => {})
        await sleep(400)
        continue
      }
      return res
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      if (attempt < retries && (isAuthError(error) || isNetworkError(error))) {
        if (isAuthError(error)) await supabase.auth.refreshSession().catch(() => {})
        await sleep(400)
        continue
      }
      return { data: null, error }
    }
  }
}

// Mensaje legible para enseñar al usuario en vez del error técnico.
export function friendlyError(error) {
  if (!error) return null
  if (isAuthError(error)) return 'Tu sesión había caducado. Inténtalo otra vez.'
  if (isNetworkError(error)) return 'Fallo de conexión. Revisa tu internet e inténtalo otra vez.'
  return error.message || 'Algo ha ido mal. Inténtalo otra vez.'
}
