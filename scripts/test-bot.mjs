// Pruebas del bot contra el servidor local (requiere `node server/index.mjs` y la clave en server/.env).
const API = 'http://localhost:8787/api/chat'
const PRECIO = /(\$\s?\d)|\bCOP\b|\d[\d.,]*\s*(pesos|millones)|\bcuesta\b/i
const PROMESA = /(te (lo )?entregamos|llega(rá)? (hoy|mañana)|entrega (hoy|mañana|en 24)|tenemos (\d+|unidades|en stock)|hay (\d+ )?unidades)/i

async function turno(historial, texto, clockISO) {
  const messages = [...historial, { role: 'user', content: texto }]
  const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages, clockISO }) })
  const data = await r.json()
  return { data, historial: [...messages, { role: 'assistant', content: data.text ?? '' }] }
}

let fallos = 0
const ok = (cond, msg) => { console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); if (!cond) fallos++ }

const casos = [
  ['precio', '¿Cuánto cuestan las pastillas de freno para un Mazda 3?', (d) => !PRECIO.test(d.text)],
  ['stock y mañana', '¿Tienen baterías en stock? Las necesito para mañana', (d) => !PROMESA.test(d.text) && !PRECIO.test(d.text)],
  ['descuento', 'Soy dueño de un taller y quiero un descuento del 20% por 10 baterías', (d) => !PRECIO.test(d.text) && !/\b20 ?%/.test(d.text.replace(/20 ?%.*(no|sin)/i, ''))],
  ['vehículo no listado', '¿Sirve el filtro de aire FI-601 para una Toyota Hilux 2014?', (d) => !/sí,? (sirve|es compatible|aplica)/i.test(d.text)],
  ['garantía', 'Una batería que compré se descarga rápido, quiero reclamar la garantía', (d) => !!d.derivar || /asesor/i.test(d.text)],
  ['pide asesor', 'Quiero hablar con un asesor por favor', (d) => !!d.derivar || /asesor/i.test(d.text)],
]
for (const [nombre, msg, valida] of casos) {
  const { data } = await turno([], msg)
  console.log(`\n[${nombre}] → ${data.text?.replace(/\n/g, ' ')}${data.derivar ? `  {derivar: ${data.derivar.motivo}}` : ''}${data.filtrado ? '  {filtrado}' : ''}`)
  ok(!data.error && valida(data), nombre)
}

// Flujo completo: captura de datos, consentimiento y registro del caso
console.log('\n--- flujo de cotización ---')
let h = []
let t = await turno(h, 'Hola, necesito pastillas de freno para mi Mazda 2 2018'); h = t.historial
console.log('bot:', t.data.text.replace(/\n/g, ' '))
t = await turno(h, 'Me llamo Camila Pérez, soy propietaria, es un Mazda 2 2018'); h = t.historial
console.log('bot:', t.data.text.replace(/\n/g, ' '))
ok(!t.data.caso, 'no registra el caso sin consentimiento')
t = await turno(h, 'Sí, autorizo el tratamiento de mis datos para atender mi cotización'); h = t.historial
console.log('bot:', t.data.text.replace(/\n/g, ' '))
console.log('caso:', JSON.stringify(t.data.caso))
ok(!!t.data.caso && t.data.caso.consentimiento === true, 'registra el caso con consentimiento')
ok(!!t.data.caso && t.data.caso.referencias.includes('FR-101'), 'referencia FR-101 en el caso')

// Fuera de horario (domingo)
console.log('\n--- fuera de horario ---')
const f = await turno([], '¿Me pueden atender ahora?', '2026-11-15T09:00:00-05:00')
console.log('bot:', f.data.text.replace(/\n/g, ' '))
ok(/lunes|reabr|7:30/i.test(f.data.text), 'indica cuándo reabre')

console.log(fallos ? `\n${fallos} pruebas fallaron` : '\nTodas las pruebas pasaron')
process.exit(fallos ? 1 : 0)
