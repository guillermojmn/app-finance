# Libro Mayor — gestor de gastos personal

App independiente (React + Vite) para gastos fijos y variables, ingresos, ahorro
y cuentas bancarias, con tu propia base de datos en Supabase para que se
sincronice entre el móvil y el ordenador. Instalable en el móvil como app
(PWA) desde el navegador.

## 1. Crear el proyecto en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta / proyecto nuevo.
2. En el proyecto, ve a **SQL Editor > New query**, pega el contenido de
   `supabase-schema.sql` y pulsa **Run**. Esto crea las tablas `accounts` y
   `transactions`, con seguridad a nivel de fila (RLS) para que cada usuario
   solo vea sus propios datos.
3. Ve a **Project Settings > API**. Copia el **Project URL** y la
   **anon public key** — los necesitas en el paso 3.
4. Ve a **Authentication > URL Configuration** y añade en "Redirect URLs" la
   URL donde vayas a usar la app (por ejemplo `http://localhost:5173` para
   probar en local, y luego la URL definitiva una vez la despliegues).

La app usa acceso por enlace mágico (escribes tu correo, te llega un enlace,
entras) — no hay contraseñas que gestionar.

## 2. Configurar el proyecto

```bash
npm install
cp .env.example .env
```

Edita `.env` y rellena:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Prueba en local:

```bash
npm run dev
```

## 3. Desplegarla en GitHub Pages

Ya incluye el workflow (`.github/workflows/deploy.yml`) que construye la app
e inyecta tus claves de Supabase en cada `push`, usando GitHub Actions —
no hace falta rama `gh-pages` manual ni build local.

1. Crea un repositorio nuevo en GitHub (por ejemplo `libro-mayor`) y sube
   esta carpeta:

   ```bash
   git init
   git add .
   git commit -m "Libro Mayor"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

2. En el repositorio: **Settings > Secrets and variables > Actions > New
   repository secret**. Añade dos:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   (los mismos valores que pusiste en tu `.env` local).

3. En **Settings > Pages > Build and deployment > Source**, elige
   **GitHub Actions**.

4. Con eso ya está. El primer `push` a `main` dispara el workflow (pestaña
   **Actions** del repo para ver el progreso) y en un par de minutos la app
   queda publicada en:

   ```
   https://TU-USUARIO.github.io/TU-REPO/
   ```

5. Añade esa URL a **Authentication > URL Configuration > Redirect URLs**
   en Supabase (paso 1.4) — si no, el enlace mágico de acceso no te
   redirigirá de vuelta a la app.

A partir de aquí, cualquier cambio que hagas en el código y subas a `main`
se despliega solo. `vite.config.js` ya usa rutas relativas (`base: './'`),
así que funciona tanto si el repo se sirve en la raíz de tu dominio como en
una subruta tipo `/libro-mayor/` — no hay que tocar nada ahí.

## 4. Instalarla en el móvil

Abre la URL desplegada en Chrome (Android) o Safari (iOS) y usa
"Añadir a pantalla de inicio" / "Instalar app". Queda con su propio icono,
abre a pantalla completa, y funciona con los mismos datos que en el
ordenador porque todo vive en Supabase, no en el dispositivo.

## Estructura

```
src/
  supabaseClient.js   cliente de Supabase (usa las variables de entorno)
  lib/theme.js         colores, tipografías y utilidades compartidas
  components/          Login, Resumen, Diario, Cuentas, ui.jsx (piezas base)
  App.jsx               autenticación + navegación + llamadas a Supabase
supabase-schema.sql     tablas y políticas de seguridad para pegar en Supabase
```
