# FLUJO BYL

Base de trabajo para una app personal de finanzas enfocada en:

- ingresos y egresos por categoria
- dashboard mensual claro
- captura rapida por texto y voz
- clasificacion automatica por reglas + IA
- sincronizacion entre dispositivos con Supabase

## Estructura

- `src`: aplicacion principal en Next.js.
- `supabase/migrations`: esquema SQL inicial del proyecto.
- `docs`: blueprint funcional y tecnico.
- `scripts`: utilidades de soporte.

## Primer arranque

1. Copia `.env.example` a `.env.local`.
2. Completa las credenciales de Supabase.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev`.

## Estado actual

- UI inicial del dashboard implementada.
- Parser MVP para transacciones por texto en `POST /api/parse-transaction`.
- Esquema inicial de Supabase con RLS y categorias base.
