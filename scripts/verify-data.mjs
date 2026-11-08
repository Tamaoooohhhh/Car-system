// Verificación independiente: recalcula las cifras clave leyendo los CSV a mano (sin papaparse)
// y las compara con lo que calcula el módulo real de la app (src/lib/metrics.js).
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = path.resolve(import.meta.dirname, '..')
const lines = (n) => fs.readFileSync(path.join(root, 'data', `${n}.csv`), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/)
const rows = (n) => lines(n).slice(1).map((l) => l.split(','))

// ---- cálculo independiente (columnas por posición, solo en columnas previas a campos con comas) ----
const ventas = rows('ventas') // venta_id,cotizacion_id,fecha,cliente_id,sku,cantidad,valor_cop
const cot = rows('cotizaciones') // id,fecha,cliente,sku,cantidad,canal,horas,estado,motivo
const prod = Object.fromEntries(rows('productos').map((r) => [r[0], Number(r[3])]))
const inv = rows('inventario') // sku,producto,categoria,ubicacion,reg,fis,dif,min,rep,costo,...
const cli = Object.fromEntries(rows('clientes').map((r) => [r[0], r[2]]))

const esperado = {
  ventas: ventas.length,
  ventasValor: ventas.reduce((a, r) => a + Number(r[6]), 0),
  cotizaciones: cot.length,
  ganadas: cot.filter((r) => r[7] === 'Ganada').length,
  perdidas: cot.filter((r) => r[7] === 'Perdida').length,
  sinMotivo: cot.filter((r) => r[7] === 'Perdida' && r[8] === 'No registrado').length,
  rapida: cot.filter((r) => Number(r[6]) <= 1.2),
  media: cot.filter((r) => Number(r[6]) >= 2.5 && Number(r[6]) <= 4),
  lenta: cot.filter((r) => Number(r[6]) >= 6.5),
  invReg: inv.reduce((a, r) => a + Number(r[4]), 0),
  invFis: inv.reduce((a, r) => a + Number(r[5]), 0),
  valorTaller: ventas.filter((r) => cli[r[3]] === 'Taller').reduce((a, r) => a + Number(r[6]), 0),
  valorPart: ventas.filter((r) => cli[r[3]] === 'Particular').reduce((a, r) => a + Number(r[6]), 0),
  perdidoTardia: cot.filter((r) => r[7] === 'Perdida' && r[8] === 'Respuesta tardía').reduce((a, r) => a + Number(r[4]) * prod[r[3]], 0),
  perdidoSeguimiento: cot.filter((r) => r[7] === 'Perdida' && r[8] === 'Sin seguimiento').reduce((a, r) => a + Number(r[4]) * prod[r[3]], 0),
}

// ---- módulo real de la app ----
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const m = await vite.ssrLoadModule('/src/lib/metrics.js')
const r = m.resumenGeneral()
const seg = Object.fromEntries(m.ventasPorSegmento().map((s) => [s.segmento, s.valor]))
const resp = Object.fromEntries(m.cierrePorRespuesta().map((x) => [x.id, x]))
const mot = Object.fromEntries(m.perdidasPorMotivo().map((x) => [x.motivo, x.valor]))
const t = m.totalesInventario()

const g = (rows_) => rows_.filter((x) => x[7] === 'Ganada').length
const checks = [
  ['ventas (n)', r.ventas, esperado.ventas],
  ['ventas (valor)', r.ventasValor, esperado.ventasValor],
  ['cotizaciones', r.cotizaciones, esperado.cotizaciones],
  ['ganadas', r.ganadas, esperado.ganadas],
  ['perdidas', r.perdidas, esperado.perdidas],
  ['pérdidas sin motivo', r.sinMotivo, esperado.sinMotivo],
  ['respuesta rápida: n', resp.rapida.cotizaciones, esperado.rapida.length],
  ['respuesta rápida: ganadas', resp.rapida.ganadas, g(esperado.rapida)],
  ['respuesta media: n', resp.media.cotizaciones, esperado.media.length],
  ['respuesta media: ganadas', resp.media.ganadas, g(esperado.media)],
  ['respuesta lenta: n', resp.lenta.cotizaciones, esperado.lenta.length],
  ['respuesta lenta: ganadas', resp.lenta.ganadas, g(esperado.lenta)],
  ['inventario hoja', t.registrado, esperado.invReg],
  ['inventario físico', t.fisico, esperado.invFis],
  ['ventas Taller (valor)', seg.Taller, esperado.valorTaller],
  ['ventas Particular (valor)', seg.Particular, esperado.valorPart],
  ['perdido por respuesta tardía', mot['Respuesta tardía'], esperado.perdidoTardia],
  ['perdido sin seguimiento', mot['Sin seguimiento'], esperado.perdidoSeguimiento],
]
let fallos = 0
for (const [nombre, obtenido, esp] of checks) {
  const ok = obtenido === esp
  if (!ok) fallos++
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${nombre}: app=${obtenido} · independiente=${esp}`)
}
console.log('\nCifras de referencia:')
console.log(` tasa de cierre ${(r.tasaCierre * 100).toFixed(1)} % · valor ventas $${(r.ventasValor / 1e6).toFixed(2)} M`)
console.log(` ventas Taller $${(seg.Taller / 1e6).toFixed(2)} M (${((seg.Taller / r.ventasValor) * 100).toFixed(1)} %) · Particular $${(seg.Particular / 1e6).toFixed(2)} M (${((seg.Particular / r.ventasValor) * 100).toFixed(1)} %)`)
console.log(` rápida ${resp.rapida.ganadas}/${resp.rapida.cotizaciones} · media ${resp.media.ganadas}/${resp.media.cotizaciones} · lenta ${resp.lenta.ganadas}/${resp.lenta.cotizaciones}`)
console.log(` perdido por respuesta tardía + sin seguimiento: $${((esperado.perdidoTardia + esperado.perdidoSeguimiento) / 1e6).toFixed(2)} M`)
console.log(` inventario: hoja ${t.registrado} u. · físico ${t.fisico} u.`)
const cl = m.clientesEnriquecidos()
console.log(' patrón de taller:', cl.filter((c) => c.patronTaller).map((c) => c.nombre).join(', ') || 'ninguno')
console.log(' señales de fuga:', cl.filter((c) => c.senales.length).map((c) => c.nombre).join(', ') || 'ninguno')
console.log(' estados de talleres:', cl.filter((c) => c.estado).map((c) => `${c.nombre}=${c.estado}`).join('; '))
await vite.close()
console.log(fallos ? `\n${fallos} verificaciones fallaron` : '\nTodas las verificaciones coinciden')
process.exit(fallos ? 1 : 0)
