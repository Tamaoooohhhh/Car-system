// Servidor mínimo del bot. La clave de Groq vive solo aquí (server/.env), nunca en el navegador.
import express from 'express'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { estadoAtencion } from '../src/lib/horario.js'
import { empresa } from '../src/config/empresa.js'

const here = import.meta.dirname
dotenv.config({ path: path.join(here, '.env') })

const PORT = Number(process.env.PORT || 8787)
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const catalog = JSON.parse(fs.readFileSync(path.join(here, 'catalog.json'), 'utf8'))
const skus = new Set(catalog.map((p) => p.sku))

const app = express()
app.use(express.json({ limit: '60kb' }))

function catalogoParaPrompt() {
  return catalog
    .map(
      (p) =>
        `- ${p.sku} | ${p.producto} | ${p.categoria} | marca ${p.marca} | ref. fabricante ${p.referencia} | compatibilidad: ${p.compatibilidad} | ${p.especificacion} | garantía ${p.garantiaMeses} meses`,
    )
    .join('\n')
}

function sistema(fecha) {
  const est = estadoAtencion(fecha)
  return `Eres el recepcionista virtual de CarSystem, distribuidor de repuestos automotrices en Guayabal, Medellín. Hablas en español de Colombia, con cordialidad, frases cortas y claras. Eres un prototipo de demostración dentro de un simulador de WhatsApp.

TU PAPEL: recibir, orientar y preparar. El asesor humano cotiza, negocia y cierra. Nunca lo reemplazas.

HECHOS DE LA EMPRESA (los únicos que puedes afirmar):
- Sede: ${empresa.sede}. Fundada en ${empresa.fundacion}.
- Cobertura de entregas: ${empresa.cobertura.join(', ')}.
- Horario: lunes a viernes 7:30 a. m. – 6:00 p. m.; sábados 7:30 a. m. – 1:00 p. m.; domingos y festivos cerrado.
- Rutas de entrega en moto con salida a las ${empresa.rutas.join(' y a las ')}. Es información de cómo opera la empresa: NO prometas que un pedido llegará en una ruta o fecha. El plazo se confirma en cada cotización.
- Garantía: se gestiona en el local y CarSystem tramita el reclamo con el proveedor. Los meses de garantía de cada producto están en el catálogo.
- Talleres: hay crédito para talleres con historial y descuentos por volumen, que autoriza la coordinación comercial. No des cifras ni porcentajes.
- Cada venta empieza con una cotización: el asesor confirma precio, disponibilidad y plazo. También se pueden conseguir piezas específicas bajo pedido.

ESTADO ACTUAL DE ATENCIÓN: ${est.texto} ${est.abierto ? '' : 'Si el cliente espera un asesor, dile con claridad cuándo reabrimos.'}

CATÁLOGO DE REFERENCIA (única fuente de productos y compatibilidad):
${catalogoParaPrompt()}

REGLAS ESTRICTAS:
1. NUNCA des precios ni rangos, ni digas "cuesta", "vale" ni cifras de dinero. Si preguntan el precio, el stock, la fecha de entrega o un descuento, explica que eso lo confirma un asesor en la cotización y ofrece prepararla recogiendo los datos.
2. NUNCA afirmes que hay unidades disponibles ni prometas entrega hoy, mañana o en una fecha.
3. Compatibilidad: solo lo que dice la ficha del catálogo. Si el vehículo no aparece o la ficha dice "varios modelos", dilo y deriva a un asesor. No deduzcas ni supongas.
4. Si piden algo que no está en el catálogo, no inventes: di que se puede consultar bajo pedido y recoge los datos para un asesor.
5. Antes de registrar un caso debes tener: nombre, vehículo (marca, línea y año, o placa) y el consentimiento explícito del cliente para tratar sus datos personales (Ley 1581 de 2012) con la finalidad de atender su cotización. Pide el consentimiento con una pregunta clara de sí o no. No lo des por hecho.
6. Cuando tengas esos datos, llama a la herramienta registrar_caso. Después confirma al cliente que un asesor continuará, y recuerda el horario si estamos cerrados.
7. Usa derivar_a_asesor cuando haya garantía o reclamo, asesoría técnica específica, negociación o descuento, pieza fuera del catálogo, el cliente pida hablar con una persona, o diga que es un taller con pedido recurrente. Explica en una frase por qué y qué pasará.
8. No pidas ni aceptes datos sensibles (cédula, tarjetas, contraseñas).
9. Si no sabes algo, dilo. Respuestas de máximo 4 frases salvo que necesites listar referencias. Sin emojis.`
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'registrar_caso',
      description:
        'Registra en el CRM un caso de cotización con los datos capturados. Solo cuando el cliente dio nombre, vehículo y su consentimiento explícito de tratamiento de datos.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          tipo_cliente: { type: 'string', enum: ['taller', 'particular', 'no_indicado'] },
          vehiculo: { type: 'string', description: 'Marca, línea y año, o placa' },
          placa: { type: 'string' },
          referencias: { type: 'array', items: { type: 'string' }, description: 'SKU del catálogo, por ejemplo FR-101' },
          pieza_fuera_de_catalogo: { type: 'string', description: 'Descripción si pide algo que no está en el catálogo' },
          resumen: { type: 'string', description: 'Resumen de la solicitud para el asesor, en una o dos frases' },
          consentimiento_datos: { type: 'boolean' },
        },
        required: ['nombre', 'vehiculo', 'resumen', 'consentimiento_datos'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'derivar_a_asesor',
      description: 'Pasa la conversación a un asesor humano con contexto.',
      parameters: {
        type: 'object',
        properties: {
          motivo: {
            type: 'string',
            enum: ['garantia_reclamo', 'asesoria_especifica', 'negociacion', 'pieza_fuera_de_catalogo', 'cliente_lo_pide', 'taller_identificado', 'otro'],
          },
          resumen: { type: 'string' },
        },
        required: ['motivo', 'resumen'],
      },
    },
  },
]

function ejecutarHerramienta(nombre, args) {
  if (nombre === 'registrar_caso') {
    if (args.consentimiento_datos !== true) {
      return { ok: false, error: 'Falta el consentimiento explícito del cliente. Pídelo antes de registrar.' }
    }
    if (!args.nombre || !String(args.nombre).trim()) return { ok: false, error: 'Falta el nombre.' }
    if (!args.vehiculo || !String(args.vehiculo).trim()) return { ok: false, error: 'Falta el vehículo.' }
    const refs = (args.referencias || []).filter((s) => skus.has(s))
    const caso = {
      nombre: String(args.nombre).trim().slice(0, 80),
      tipoCliente: ['taller', 'particular'].includes(args.tipo_cliente) ? args.tipo_cliente : 'no_indicado',
      vehiculo: String(args.vehiculo).trim().slice(0, 80),
      placa: args.placa ? String(args.placa).trim().slice(0, 12) : null,
      referencias: refs,
      piezaFueraCatalogo: args.pieza_fuera_de_catalogo ? String(args.pieza_fuera_de_catalogo).slice(0, 200) : null,
      resumen: String(args.resumen || '').slice(0, 400),
      consentimiento: true,
      derivar: false,
    }
    return { ok: true, caso, mensaje: 'Caso registrado en el CRM.' }
  }
  if (nombre === 'derivar_a_asesor') {
    return {
      ok: true,
      derivar: { motivo: args.motivo || 'otro', resumen: String(args.resumen || '').slice(0, 400) },
      mensaje: 'Conversación marcada para un asesor.',
    }
  }
  return { ok: false, error: 'Herramienta desconocida.' }
}

const PRECIO = /(\$\s?\d)|(\bCOP\b)|(\d[\d.,]*\s*(pesos|mil pesos|millones|mil))|(\bcuesta\b|\bvale \d)/i
const SEGURO =
  'El precio, la disponibilidad y el plazo de entrega los confirma un asesor en la cotización. Si quieres, te ayudo a prepararla: ¿me compartes tu nombre y el vehículo?'

async function llamarGroq(messages) {
  const r = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.3,
      max_completion_tokens: 900,
      reasoning_effort: 'low',
    }),
  })
  if (!r.ok) {
    const detalle = await r.text().catch(() => '')
    const e = new Error(`Groq ${r.status}`)
    e.status = r.status
    e.detalle = detalle.slice(0, 300)
    throw e
  }
  return r.json()
}

app.get('/api/salud', (_req, res) => res.json({ ok: true, modelo: MODEL, clave: !!process.env.GROQ_API_KEY }))

app.post('/api/chat', async (req, res) => {
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'sin_clave' })
  const { messages, clockISO } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) return res.status(400).json({ error: 'mensajes_invalidos' })
  const fecha = clockISO ? new Date(clockISO) : new Date()
  const hist = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
  const convo = [{ role: 'system', content: sistema(isNaN(fecha) ? new Date() : fecha) }, ...hist]

  const eventos = { caso: null, derivar: null }
  try {
    for (let i = 0; i < 4; i++) {
      const data = await llamarGroq(convo)
      const msg = data.choices?.[0]?.message
      if (!msg) throw new Error('respuesta_vacia')
      if (msg.tool_calls?.length) {
        convo.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls })
        for (const tc of msg.tool_calls) {
          let args = {}
          try { args = JSON.parse(tc.function.arguments || '{}') } catch { /* args vacíos */ }
          const out = ejecutarHerramienta(tc.function.name, args)
          if (out.ok && out.caso) eventos.caso = out.caso
          if (out.ok && out.derivar) eventos.derivar = out.derivar
          convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(out) })
        }
        continue
      }
      let text = (msg.content || '').trim()
      let filtrado = false
      if (PRECIO.test(text)) { text = SEGURO; filtrado = true }
      if (!text) text = 'Un asesor te ayudará con esto. ¿Me compartes tu nombre y el vehículo para dejar tu solicitud lista?'
      return res.json({ text, caso: eventos.caso, derivar: eventos.derivar, filtrado })
    }
    throw new Error('demasiadas_iteraciones')
  } catch (e) {
    console.error('[chat]', e.message, e.detalle || '')
    return res.status(502).json({ error: 'modelo_no_disponible' })
  }
})

const dist = path.join(here, '..', 'dist')
// Sirve dist/ solo si existe en el momento de la petición (en desarrollo no hay build).
app.use((req, res, next) => (fs.existsSync(path.join(dist, 'index.html')) ? express.static(dist)(req, res, next) : next()))
app.get(/^(?!\/api).*/, (_req, res) => {
  const index = path.join(dist, 'index.html')
  if (fs.existsSync(index)) return res.sendFile(index)
  res.status(404).type('text').send('Esta es la API del bot. Abre la web en http://localhost:5173')
})

app.listen(PORT, () => console.log(`[api] http://localhost:${PORT} · modelo ${MODEL} · clave ${process.env.GROQ_API_KEY ? 'cargada' : 'FALTA'}`))
