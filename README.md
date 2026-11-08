# CarSystem: referencia de productos, simulador de WhatsApp con bot y CRM demo

Demo funcional para presentar. Léelo junto con [PRODUCT.md](PRODUCT.md) (contexto del producto) y [PROMPT_MAESTRO.md](PROMPT_MAESTRO.md) (especificación).

## Arranque

```bash
npm install
npm run dev        # convierte los CSV, levanta la web (5173) y el servidor del bot (8787)
```

Abre http://localhost:5173. La demo del sistema interno está en `/demo`.

Requisito: `server/.env` con `GROQ_API_KEY=...` (y opcionalmente `GROQ_MODEL`, por defecto `openai/gpt-oss-120b`). La clave solo la lee el servidor; el navegador nunca la ve. Revócala cuando termine la demo.

## Estructura

| Ruta | Qué hay |
|---|---|
| `data/*.csv` | Los 9 CSV originales (fuente de verdad) |
| `scripts/build-data.mjs` | CSV a JSON tipado en `src/data/` (`catalog.json` público sin precios; `crm.json` interno) |
| `scripts/verify-data.mjs` | Recalcula las cifras clave leyendo los CSV a mano y las compara con la app |
| `scripts/test-bot.mjs` | Pruebas del bot (precio, entrega, descuento, garantía, consentimiento, horario) |
| `server/index.mjs` | API del bot: prompt, herramientas `registrar_caso` y `derivar_a_asesor`, filtro de precios |
| `src/config/empresa.js` | **Aquí se editan** WhatsApp, teléfono, correo y responsable de datos (hoy en `null`) |
| `src/pages/` | Web pública |
| `src/demo/` | Simulador de WhatsApp y CRM |
| `src/lib/metrics.js` | Cálculos del CRM (todo sale de los CSV) |

## Comandos útiles

```bash
npm run verify                  # compara las cifras de la app con un recálculo independiente
node scripts/test-bot.mjs       # requiere el servidor del bot corriendo
npm run build                   # build de producción (el servidor sirve dist/ si existe)
```

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
