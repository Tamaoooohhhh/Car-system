# CarSystem: referencia de productos, simulador de WhatsApp con bot y CRM demo

Demo funcional para presentar. Léelo junto con [PRODUCT.md](PRODUCT.md) (contexto del producto) y [PROMPT_MAESTRO.md](PROMPT_MAESTRO.md) (especificación).

## Arranque

```bash
npm install
npm run dev        # convierte los CSV, levanta la web (5173) y el servidor del bot (8787)
```

Abre http://localhost:5173. El acceso de asesores está en `/asesores`; `/demo` redirige al login cuando no hay una sesión válida.

Para desarrollo local, configura `.dev.vars` en la raíz con `GROQ_API_KEY`, `ASSESSOR_USERNAME`, `ASSESSOR_PASSWORD` y `ASSESSOR_SESSION_SECRET` (mínimo 32 caracteres). No se versiona. Para el servidor local de Express también puedes usar `server/.env`. La clave de Groq y las credenciales de asesores solo las lee el servidor; el navegador nunca las recibe.

## Estructura

| Ruta | Qué hay |
|---|---|
| `data/*.csv` | Los 9 CSV originales (fuente de verdad) |
| `scripts/build-data.mjs` | CSV a JSON tipado en `src/data/` (`catalog.json` público sin precios; `crm.json` interno) |
| `scripts/verify-data.mjs` | Recalcula las cifras clave leyendo los CSV a mano y las compara con la app |
| `scripts/test-bot.mjs` | Pruebas del bot (precio, entrega, descuento, garantía, consentimiento, horario) |
| `server/index.mjs` | API local del bot: prompt, herramientas y filtro de precios |
| `functions/[[path]].js` | API de Pages, sesiones de asesor y entrega autenticada de los archivos privados |
| `scripts/build-pages.mjs` | Empaqueta el CRM privado dentro de la Function y limita las rutas ejecutadas por Functions |
| `src/config/empresa.js` | **Aquí se editan** WhatsApp, teléfono, correo y responsable de datos (hoy en `null`) |
| `src/pages/` | Web pública |
| `src/demo/` | Simulador de WhatsApp y CRM |
| `src/lib/metrics.js` | Cálculos del CRM (todo sale de los CSV) |

## Comandos útiles

```bash
npm run verify                  # compara las cifras de la app con un recálculo independiente
node scripts/test-bot.mjs       # requiere el servidor corriendo, GROQ_API_KEY y credenciales configuradas
npm run build                   # build público
npm run build:all               # builds público y privado
npm run build:pages             # build para Cloudflare Pages
npm run pages:dev               # prueba local con Pages Functions
npm run deploy                  # publica sitio y backend en Cloudflare Pages
npm run deploy:firebase         # publica el sitio público en Firebase Hosting
```

Firebase Hosting sirve la web pública estática en `car-system-solution`; el asistente y el acceso de asesores se conectan al backend seguro de Cloudflare Pages (`carsystem-demo.pages.dev`). El login usa un envío de formulario de navegación completa para establecer una cookie `HttpOnly` de primera parte en Cloudflare; después del login, el CRM y sus recursos privados se sirven allí y no se copian al hosting público de Firebase. El backend usa `/api/**` y `/demo/**`, y los archivos internos se entregan solo después de validar la cookie.

El asistente virtual aparece en las páginas públicas y orienta al visitante sin guardar sus mensajes ni afirmar que creó un caso. La demo de CRM conserva su simulador interno.

El acceso se valida en el servidor con los secretos `ASSESSOR_USERNAME`, `ASSESSOR_PASSWORD` y `ASSESSOR_SESSION_SECRET` (mínimo 32 caracteres). La Function firma una cookie `HttpOnly`, `Secure` en producción y con expiración; no usa base de datos. La página de acceso está en `/asesores`; no aparece en los menús públicos.

### Backend de Cloudflare (sin habilitar facturación de Google)

```bash
npx wrangler login
npx wrangler pages project create carsystem-demo
npx wrangler pages secret put GROQ_API_KEY --project-name=carsystem-demo
npx wrangler pages secret put ASSESSOR_USERNAME --project-name=carsystem-demo
npx wrangler pages secret put ASSESSOR_PASSWORD --project-name=carsystem-demo
npx wrangler pages secret put ASSESSOR_SESSION_SECRET --project-name=carsystem-demo
npm run deploy
```

`wrangler pages secret put` solicita cada valor de forma interactiva y lo guarda como secreto del servidor. No uses `VITE_*`, variables del bundle ni archivos versionados para estas claves. Si pruebas localmente con `npm run pages:dev`, crea `.dev.vars` con esos mismos nombres; no lo compartas ni lo subas a Git.

### Web pública de Firebase Hosting

```bash
firebase login
npm run deploy:firebase
```

El despliegue usa Hosting estático únicamente y no requiere Functions, Cloud Run ni activar facturación de Google. `firebase.json` y `.firebaserc` apuntan explícitamente al proyecto `car-system-solution`. El build configura el asistente para usar el backend de Cloudflare; no publiques la salida de `npm run build` genérica como si tuviera ese endpoint.

Pages Functions usa el plan Workers Free; las solicitudes al backend están sujetas a sus límites. Los recursos estáticos de Firebase Hosting no ejecutan el backend. El proveedor de IA (Groq) tiene condiciones y límites independientes, que pueden incluir costos.

Documentación oficial: [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/), [secrets](https://developers.cloudflare.com/workers/configuration/secrets/) y [direct upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Reglas que cumple la demo

- La web pública no muestra precios, existencias ni promesas de entrega. Las columnas de precio, costo y stock no entran en el catálogo público.
- El bot no da precios, no promete fechas ni stock y no concede descuentos. Si el modelo responde con una cifra de dinero, el servidor la reemplaza por un mensaje seguro.
- El bot no registra un caso sin consentimiento explícito de tratamiento de datos.
- Los casos nuevos creados en la demo se marcan «Creado en esta demo» y viven solo en el navegador (`localStorage`).
- En el CRM, los asesores aparecen por código (E02 a E05) porque los datos no dicen sus nombres. Las celdas vacías se muestran como «sin dato».

## Límites conocidos

- Los festivos no se calculan: solo se trata el domingo como cerrado.
- El bot responde en una sola llamada (con indicador de escritura), no por streaming.
- La «Vista de» por rol es un filtro de presentación, no un sistema de permisos.
- El simulador no usa la API real de WhatsApp.
- Pendientes de la empresa: número de WhatsApp y teléfono, responsable del tratamiento de datos, fotos reales de producto.
