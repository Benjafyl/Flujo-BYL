# FLUJO BYL

> Blueprint de producto y arquitectura para una app personal de finanzas con captura por voz, clasificación automática y sincronización entre celular, computador y web.

**Fecha:** 09 de abril de 2026  
**Objetivo del documento:** dejar una base clara, ejecutable y didáctica para construir una alternativa personal a apps tipo MoneyIA, pero controlada por ti, con tus reglas, tus categorías y tus datos.

## 1. Resumen Ejecutivo

La mejor decisión para este proyecto es **no construir tres apps distintas desde el día uno**. Para una app personal, lo más eficiente es partir con **una sola aplicación Next.js App Router**, desplegada en Vercel, conectada a **Supabase** para base de datos, autenticación, almacenamiento y sincronización.

Con esa base puedes cubrir:

- **Web**: acceso completo desde notebook o escritorio.
- **Teléfono**: uso como app instalable mediante **PWA**.
- **Computador**: uso inmediato en navegador; si luego quieres sensación de app nativa, se puede envolver con **Tauri** sin rehacer el frontend.

La funcionalidad diferenciadora debe ser esta:

- registrar ingresos y egresos en menos de 5 segundos
- permitir ingreso por voz y por texto
- clasificar automáticamente el gasto según comercio, contexto y reglas aprendidas
- mostrar un dashboard simple y muy visual del mes actual
- aprender de tus correcciones para que cada semana requiera menos intervención manual

La app no debe sentirse como un software contable. Debe sentirse como un **asistente financiero personal**: rápida para capturar, clara para revisar y obsesionada con reducir fricción.

## 2. Decisión Recomendada

### Stack principal

- **Frontend + backend app**: `Next.js 16` con `TypeScript`, `App Router`, `Server Components`, `Route Handlers` y `Server Actions`.
- **Deploy**: `Vercel`.
- **Base de datos**: `Supabase Postgres`.
- **Autenticación**: `Supabase Auth` con magic link o passkey.
- **Sincronización entre dispositivos**: `Supabase Realtime`.
- **Storage**: `Supabase Storage` para audios temporales, exportaciones o adjuntos si los necesitas.
- **UI**: `Tailwind CSS`, `shadcn/ui`, iconografía simple, gráficos con `Recharts`.
- **IA para audio + clasificación**: pipeline de transcripción y normalización en servidor, seguido de reglas y clasificación estructurada.
- **Desktop**: navegador primero; `Tauri 2` solo si después quieres app instalable real en Windows/macOS.

### Por qué esta decisión es la correcta

- reduce tiempo de construcción
- reduce costo mensual
- evita mantener tres codebases
- te permite validar primero la utilidad real del sistema
- deja abierta la puerta para una capa nativa después

### Decisión de producto más importante

La app debe priorizar:

1. **captura rápida**
2. **clasificación inteligente**
3. **corrección fácil**
4. **visualización del mes**

No debe priorizar al inicio:

- inversiones complejas
- conciliación bancaria automática con bancos chilenos
- sistema multiusuario
- contabilidad formal
- facturación o tributación

## 3. Problema Que Debe Resolver

Hoy el problema no es que falten apps para presupuestar. El problema es que registrar movimientos manualmente da lata, interrumpe el día y obliga a tomar demasiadas decisiones pequeñas:

- cuánto fue
- si fue ingreso o gasto
- en qué categoría cae
- si corresponde a cuenta corriente, efectivo o tarjeta
- si fue un gasto puntual o recurrente

La app debe eliminar ese costo mental.

Ejemplo ideal:

- dices: `Gasté 2.000 en iMark`
- el sistema entiende: egreso
- detecta comercio: iMark
- propone categoría: supermercado
- sugiere fecha actual y método de pago más probable
- registra
- actualiza dashboard y presupuesto en segundos

Otro ejemplo:

- dices: `Compré un café en la U`
- el sistema entiende contexto informal
- propone categoría `café/snacks` o `gasto universitario`
- si tú corriges una vez, la próxima lo aprende

## 4. Principios de UX

- **Todo debe estar a 1 toque o 1 frase de distancia.**
- **El dashboard principal debe contestar tres preguntas apenas abras la app.**
- `¿Cuánto entró este mes?`
- `¿Cuánto salió este mes?`
- `¿En qué se me fue la plata?`
- **El input por voz no debe sentirse experimental**. Debe tener feedback claro: grabando, transcribiendo, interpretando, registrado.
- **La categoría no se pregunta si la confianza del sistema es alta.**
- **La corrección debe ser mínima**: cambiar categoría, monto, cuenta o fecha en una sola vista.
- **El lenguaje debe ser humano**, no contable.
- **El diseño debe ser calmado y útil**, no recargado.

## 5. Flujos Principales

### Flujo A: registrar gasto por voz

1. Abres la app en el celular.
2. Mantienes presionado el botón de micrófono o tocas `Registrar por voz`.
3. Dices algo como: `Pagué 4.500 por un café y un sándwich en la universidad`.
4. El sistema transcribe.
5. El sistema extrae:
   - tipo: egreso
   - monto: 4500
   - comercio/contexto: universidad
   - categorías candidatas: snacks, comida rápida, vida universitaria
6. Si la confianza es alta, registra directo y muestra una confirmación editable.
7. Si la confianza es media, muestra una tarjeta de confirmación con 1 o 2 taps.
8. El dashboard se actualiza de inmediato.

### Flujo B: registrar ingreso rápido

1. Tocando `Nuevo ingreso`.
2. O diciendo: `Me llegaron 350 mil de pago freelance`.
3. El sistema propone:
   - tipo: ingreso
   - categoría: freelance
   - fecha: hoy
   - cuenta destino: principal

### Flujo C: corregir una mala clasificación

1. Ves un movimiento mal categorizado.
2. Lo editas.
3. El sistema guarda:
   - corrección de categoría
   - alias del comercio
   - contexto del texto original
4. La próxima vez usa esa preferencia antes de preguntarte.

### Flujo D: revisar el mes

1. Entras al dashboard.
2. Ves el balance del mes.
3. Ves ingresos vs egresos.
4. Ves ranking de categorías.
5. Ves top comercios.
6. Detectas si el problema fue supermercado, delivery, cafés, transporte o compras impulsivas.

## 6. Dashboard Principal

La pantalla inicial debe ser extremadamente clara. Mi recomendación es que contenga estas piezas, en este orden:

### Bloque 1: resumen del mes

- ingresos totales del mes
- egresos totales del mes
- balance neto
- comparación contra el mes anterior

### Bloque 2: visual principal

Usar un gráfico combinado:

- barras para ingresos y egresos por semana
- anillo o torta para distribución por categoría

Si hay que elegir solo uno para MVP:

- elegir **barras por semana** en la parte superior
- y abajo una **lista de categorías con barra horizontal**

Eso es más útil que una torta sola, porque mezcla tendencia y composición.

### Bloque 3: categorías más pesadas

- top 5 categorías del mes
- monto
- porcentaje del gasto total
- variación vs mes anterior

### Bloque 4: actividad reciente

- últimos 10 movimientos
- color por tipo
- ícono por categoría
- posibilidad de editar en un toque

### Bloque 5: alertas simples

- `gastaste más en delivery que el mes pasado`
- `tu categoría supermercado ya va en 78% del presupuesto`
- `este mes tus ingresos bajaron 15%`

## 7. Pantallas del MVP

- **Dashboard**
- **Nuevo movimiento**
- **Registro por voz**
- **Historial / timeline**
- **Categorías**
- **Presupuestos mensuales**
- **Reglas y comercios conocidos**
- **Configuración**

### Pantallas de segunda etapa

- reportes avanzados
- movimientos recurrentes
- exportación CSV/PDF
- comparación mes a mes
- objetivos de ahorro

## 8. Modelo de Datos Recomendado

### Entidades principales

- `profiles`
- `accounts`
- `categories`
- `transactions`
- `merchant_aliases`
- `classification_feedback`
- `monthly_budgets`
- `recurring_transactions`
- `voice_captures`

### Definición funcional de cada tabla

- `profiles`: preferencias del usuario, moneda, zona horaria, configuración general.
- `accounts`: billeteras o fuentes de dinero como efectivo, cuenta corriente, débito, crédito.
- `categories`: jerarquía simple de categorías como supermercado, transporte, snacks, estudio, ocio, freelance, sueldo.
- `transactions`: tabla núcleo. Guarda monto, tipo, fecha, categoría, cuenta, comercio, origen de captura y estado de confianza.
- `merchant_aliases`: mapea nombres como `iMark`, `Lider`, `Starbucks U`, `casino U`, `Uber`, etc. hacia categoría sugerida y comercio normalizado.
- `classification_feedback`: registra correcciones del usuario y sirve para aprender reglas nuevas.
- `monthly_budgets`: monto objetivo por categoría por mes.
- `recurring_transactions`: gastos o ingresos esperables, como suscripciones o pagos fijos.
- `voice_captures`: conserva texto transcrito, audio original opcional, resultado del parser y nivel de confianza.

### Campos clave para `transactions`

- `id`
- `user_id`
- `type` (`income`, `expense`, `transfer`)
- `amount`
- `currency`
- `occurred_at`
- `description_raw`
- `merchant_raw`
- `merchant_normalized`
- `category_id`
- `account_id`
- `created_via` (`manual`, `voice`, `import`, `rule`)
- `confidence_score`
- `needs_review`
- `notes`
- `created_at`
- `updated_at`

### Decisiones de modelado

- usar montos positivos y un campo `type` explícito
- separar `merchant_raw` de `merchant_normalized`
- guardar siempre el texto original ingresado
- registrar una `confidence_score` entre 0 y 1
- permitir `needs_review = true` cuando el sistema no esté suficientemente seguro

## 9. Motor de Clasificación Automática

La clasificación no debe depender solo de IA. Debe ser un pipeline por capas:

### Capa 1: normalización

- limpiar texto
- detectar moneda
- extraer monto
- detectar fecha implícita si dijiste `ayer`, `hoy`, `anoche`
- detectar si fue ingreso, egreso o transferencia

### Capa 2: reglas determinísticas

Antes de llamar a un modelo, revisar:

- alias de comercio ya conocidos
- coincidencias exactas o parciales
- reglas personales aprendidas
- categorías usadas recientemente para ese comercio

Ejemplos:

- `iMark` -> supermercado
- `Uber` -> transporte
- `Café U`, `Nescafé campus`, `casino` -> snacks o comida
- `Pago Notion` -> suscripciones

### Capa 3: clasificación IA estructurada

Si no hay regla suficiente, usar un modelo para devolver un JSON con:

- tipo
- monto
- merchant_normalized
- categoría sugerida
- subcategoría opcional
- explicación corta
- nivel de confianza

### Capa 4: umbral de confirmación

- si confianza >= 0.90, registrar directo
- si confianza entre 0.70 y 0.89, mostrar confirmación rápida
- si confianza < 0.70, mandar a revisión

### Capa 5: aprendizaje

Cada corrección manual alimenta:

- nueva regla de comercio
- ajuste de prioridad entre categorías
- memoria contextual para entradas futuras

## 10. Arquitectura Técnica

### Arquitectura recomendada para fase 1

- `Next.js` como app principal y backend liviano.
- `Supabase Postgres` como fuente única de verdad.
- `Supabase Auth` para acceso seguro aunque seas solo tú.
- `Supabase Realtime` para reflejar cambios si tienes abierta la app en celular y notebook al mismo tiempo.
- `Vercel` para despliegue simple y rápido.

### Distribución por capas

- **Cliente**: dashboard, formularios, captura de voz, historial, settings.
- **Servidor app**: parsing inicial, validación, escritura segura, integración IA.
- **Base de datos**: transacciones, categorías, reglas, presupuestos, historial.
- **Servicios auxiliares**: transcripción de audio, clasificación estructurada, jobs de resumen y recordatorios.

### Recomendación crítica

No construir un backend separado en NestJS, Express o FastAPI al inicio. Para este producto no te da ventaja real en fase temprana. `Next.js` con route handlers y server actions es suficiente y te deja moverte más rápido.

## 11. Web, Móvil y Escritorio

### Recomendación de superficie

- **Móvil**: PWA instalable.
- **Web de escritorio**: navegador.
- **Desktop app real**: opcional con Tauri cuando el producto ya esté validado.

### Por qué no haría React Native o Flutter desde el inicio

- agregan otra capa de complejidad
- requieren mantener UI separada o comprometer experiencia web
- no son necesarias para validar tu caso de uso personal
- retrasan la parte realmente importante: captura, clasificación y dashboard

### Cuándo sí sumaría Tauri

- si quieres abrir la app como programa independiente
- si quieres accesos directos de teclado globales
- si quieres sensación nativa en escritorio
- si más adelante necesitas integraciones locales más profundas

## 12. Seguridad y Privacidad

Aunque sea una app personal, la data financiera sigue siendo sensible.

El mínimo serio debería ser:

- autenticación real
- políticas `RLS` por usuario en cada tabla sensible
- secretos solo del lado servidor
- audio opcionalmente borrado luego de transcribir
- backup periódico de la base
- exportación simple de tus movimientos

### Política recomendada

- guardar el texto transcrito
- borrar el audio bruto después de procesarlo, salvo que explícitamente quieras conservarlo

Eso baja costo y reduce exposición innecesaria.

## 13. Roadmap de Construcción

### Fase 0: base del proyecto

- crear app Next.js
- conectar Supabase
- diseñar esquema SQL inicial
- definir categorías base
- levantar autenticación
- dejar UI shell y navegación

### Fase 1: MVP usable

- crear transacciones manuales
- ingresos y egresos
- categorías
- historial
- dashboard mensual
- edición rápida de movimientos

### Fase 2: inteligencia práctica

- captura por voz
- transcripción
- parser de monto/tipo/merchant
- reglas por comercio
- confirmación según confianza
- aprendizaje con correcciones

### Fase 3: control real del dinero

- presupuestos por categoría
- alertas mensuales
- gastos recurrentes
- comparativas con meses anteriores

### Fase 4: refinamiento

- importación CSV
- exportes
- PWA más pulida
- Tauri opcional
- resúmenes automáticos semanales o mensuales

## 14. MVP Exacto Recomendado

Si hubiera que reducir esto al mínimo valioso, el MVP debería incluir solo:

- login
- dashboard mensual
- crear ingreso
- crear egreso
- categorías editables
- historial
- captura por voz
- clasificación automática básica
- corrección manual rápida

No metería todavía:

- cuentas compartidas
- OCR de boletas
- integración bancaria
- metas de inversión
- múltiples monedas

## 15. Categorías Iniciales Sugeridas

### Egresos

- supermercado
- snacks / café
- delivery / comida
- transporte
- universidad / estudio
- hogar
- salud
- suscripciones
- ocio
- compras personales
- regalos
- otros

### Ingresos

- sueldo
- freelance
- reembolso
- venta
- transferencia recibida
- otros ingresos

## 16. Métricas Que Sí Importan

- total ingresado del mes
- total gastado del mes
- balance del mes
- gasto promedio diario
- categoría con mayor fuga
- top 5 comercios
- porcentaje del presupuesto usado por categoría
- número de transacciones pendientes de revisar
- precisión de clasificación automática

## 17. Riesgos y Cómo Reducirlos

### Riesgo 1: depender demasiado de IA

Mitigación:

- usar reglas primero
- IA solo como capa de fallback
- registrar correcciones

### Riesgo 2: que capturar por voz sea lento

Mitigación:

- botón único
- procesamiento corto
- confirmación mínima
- no pedir categoría si la confianza es alta

### Riesgo 3: hacer demasiadas funciones antes de tiempo

Mitigación:

- construir primero el hábito diario
- priorizar fricción baja y claridad del dashboard
- dejar importaciones, metas y extras para después

## 18. Recomendación Final

Si este proyecto fuera mío, partiría así:

1. `Next.js + Supabase + Vercel`
2. una sola app responsive y **PWA-first**
3. dashboard mensual simple pero fuerte
4. ingreso manual impecable
5. voz y clasificación automática como segunda capa
6. reglas aprendidas por comercio como núcleo del “efecto wow”

La clave del producto no es solo “usar IA”. La clave es que **cada corrección te ahorre tiempo en la siguiente transacción**.

Ese es el mecanismo que puede volver esta app realmente útil en tu día a día.

## 19. Siguiente Paso Recomendado

Después de aprobar este blueprint, el siguiente paso técnico correcto es:

- crear la estructura inicial del proyecto
- definir el esquema SQL de Supabase
- diseñar las categorías base
- levantar el dashboard y el flujo manual
- recién después meter la captura por voz

## 20. Fuentes Base Revisadas

- [Next.js Docs](https://nextjs.org/docs)
- [Next.js route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js manifest metadata file](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)
- [Supabase server-side auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Realtime Postgres changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Tauri 2 docs](https://v2.tauri.app/start/)
- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI realtime transcription / voice](https://platform.openai.com/docs/guides/realtime/voice-design)
