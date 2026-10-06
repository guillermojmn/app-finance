# Cuentas — gestor de gastos personal

App para llevar el control de tus gastos fijos y variables, ingresos y
cuentas bancarias, con tus datos sincronizados entre el móvil y el
ordenador. Oscura por defecto, pensada para apuntar un gasto en segundos.

**Úsala aquí:** https://guillermojmn.github.io/app-finance/

## Primeros pasos

1. Entra en la URL de arriba y pulsa **Crear cuenta** con tu correo y una
   contraseña.
2. (Opcional) Ve a la pestaña **Cuentas** y añade tus cuentas bancarias con
   su saldo actual — sirve para ver tu patrimonio total y que cada
   movimiento ajuste el saldo solo. No hace falta: puedes apuntar gastos e
   ingresos sin asignarles ninguna cuenta.
3. Ve a **Diario** y apunta tu primer movimiento: fecha, descripción,
   tipo (ingreso / fijo / variable), categoría e importe.
4. La pestaña **Resumen** se actualiza sola con lo que llevas ese mes:
   ingresos, gastos, balance y patrimonio total.

## Cómo está pensada

- **Resumen** — foto del mes: ingresos, gastos fijos y variables, balance,
  patrimonio total en todas tus cuentas, y el desglose de gastos variables
  por categoría (toca una categoría para ver qué movimientos concretos la
  componen).
- **Diario** — todos tus movimientos. Puedes filtrar por tipo, ver solo el
  mes actual o todo el histórico, y editar o borrar cualquier apunte. Si
  escribes una descripción que ya usaste antes, autocompleta la categoría
  sola. Y si ya apuntaste los gastos fijos de un mes, un botón te deja
  copiarlos al mes siguiente con un toque.
- **Cuentas** — tus cuentas bancarias, su saldo y el patrimonio total
  convertido a la moneda que elijas (CHF, EUR, USD).

## Trucos

- **Modo oscuro/claro**: botón en el menú (PC) o arriba a la derecha
  (móvil).
- **Acceso directo para apuntar rápido**: entra en
  `https://guillermojmn.github.io/app-finance/?quick=1` desde Safari o
  Chrome en el móvil y usa "Añadir a pantalla de inicio" — te deja un icono
  que abre directamente un formulario mínimo (tipo, importe, cuenta,
  descripción), sin pasar por el resto de la app.
- **Instalarla como app**: desde el navegador del móvil, "Añadir a
  pantalla de inicio" (iOS/Safari) o "Instalar app" (Android/Chrome). Abre
  a pantalla completa y usa los mismos datos que en el ordenador, porque
  todo vive en la base de datos, no en el dispositivo.
- Los importes aceptan coma o punto como separador decimal, da igual
  cuál uses.

## Desarrollo

Para quien quiera tocar el código o desplegar su propia copia:

```
src/
  supabaseClient.js   cliente de Supabase + reintento ante sesión caducada
  lib/theme.js         colores, tipografías y utilidades compartidas
  components/          Login, Resumen, Diario, Cuentas, QuickAdd, ui.jsx
  App.jsx               autenticación + navegación + llamadas a Supabase
supabase-schema.sql     tablas y políticas de seguridad (RLS) para Supabase
```

Necesita un proyecto de [Supabase](https://supabase.com) propio (tablas
`accounts` y `transactions`, ver `supabase-schema.sql`) y las variables
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en un `.env` local y como
secretos del repositorio para que el despliegue a GitHub Pages
(`.github/workflows/deploy.yml`) funcione en cada `push` a `master`.
