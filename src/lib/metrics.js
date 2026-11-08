// Cálculos del CRM demo. Todo sale de los CSV (src/data/crm.json); nada se escribe a mano.
// scripts/verify-data.mjs recalcula las cifras clave por un camino independiente y las compara.
import crm from '../data/crm.json'
import catalog from '../data/catalog.json'
import { enHorario } from './horario.js'

export const FECHA_CORTE = '2026-09-30' // cierre del trimestre de los datos (jul–sep 2026)
export const D = crm

const byId = (rows, key) => Object.fromEntries(rows.map((r) => [r[key], r]))
export const clientePorId = byId(crm.clientes, 'cliente_id')
export const productoPorSku = byId(crm.productos, 'sku')
export const cotizacionPorId = byId(crm.cotizaciones, 'cotizacion_id')
export const catalogoPorSku = byId(catalog, 'sku')
const sum = (a) => a.reduce((x, y) => x + y, 0)
const diasEntre = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)

// ---------- Ventas y cotizaciones ----------
export function resumenGeneral() {
  const ventasValor = sum(crm.ventas.map((v) => v.valor_cop))
  const ganadas = crm.cotizaciones.filter((c) => c.estado === 'Ganada').length
  const perdidas = crm.cotizaciones.filter((c) => c.estado === 'Perdida').length
  const sinMotivo = crm.cotizaciones.filter((c) => c.estado === 'Perdida' && c.motivo_perdida === 'No registrado').length
  return {
    ventas: crm.ventas.length,
    ventasValor,
    cotizaciones: crm.cotizaciones.length,
    ganadas,
    perdidas,
    tasaCierre: ganadas / crm.cotizaciones.length,
    sinMotivo,
    perdidasConMotivo: perdidas - sinMotivo,
  }
}

export function ventasPorSegmento() {
  const out = {}
  for (const v of crm.ventas) {
    const seg = clientePorId[v.cliente_id]?.segmento ?? 'Sin cliente'
    out[seg] ??= { segmento: seg, ventas: 0, valor: 0 }
    out[seg].ventas += 1
    out[seg].valor += v.valor_cop
  }
  const total = sum(Object.values(out).map((s) => s.valor))
  return Object.values(out).map((s) => ({ ...s, parte: s.valor / total }))
}

/** Valor estimado de lo perdido: cantidad × precio de lista (productos.csv). Es una estimación interna. */
export const valorLista = (c) => c.cantidad * (productoPorSku[c.sku]?.precio_cop ?? 0)

export function perdidasPorMotivo() {
  const out = {}
  for (const c of crm.cotizaciones.filter((x) => x.estado === 'Perdida')) {
    const m = c.motivo_perdida ?? 'No registrado'
    out[m] ??= { motivo: m, cotizaciones: 0, valor: 0 }
    out[m].cotizaciones += 1
    out[m].valor += valorLista(c)
  }
  return Object.values(out).sort((a, b) => b.cotizaciones - a.cotizaciones || b.valor - a.valor)
}

export const RANGOS_RESPUESTA = [
  { id: 'rapida', label: 'Hasta 1,2 h', test: (h) => h <= 1.2 },
  { id: 'media', label: 'De 2,5 a 4 h', test: (h) => h >= 2.5 && h <= 4 },
  { id: 'lenta', label: '6,5 h o más', test: (h) => h >= 6.5 },
]
export function cierrePorRespuesta() {
  return RANGOS_RESPUESTA.map((r) => {
    const rows = crm.cotizaciones.filter((c) => c.horas_respuesta != null && r.test(c.horas_respuesta))
    const g = rows.filter((c) => c.estado === 'Ganada').length
    return { ...r, cotizaciones: rows.length, ganadas: g, tasa: rows.length ? g / rows.length : null }
  })
}

export function cierrePorCanal() {
  const out = {}
  for (const c of crm.cotizaciones) {
    out[c.canal] ??= { canal: c.canal, cotizaciones: 0, ganadas: 0 }
    out[c.canal].cotizaciones += 1
    if (c.estado === 'Ganada') out[c.canal].ganadas += 1
  }
  return Object.values(out).map((x) => ({ ...x, tasa: x.ganadas / x.cotizaciones })).sort((a, b) => b.cotizaciones - a.cotizaciones)
}

// ---------- Interacciones ----------
export const RESULTADOS_SIN_RESPUESTA = ['Sin respuesta registrada', 'Llamada no contestada']
export function interaccionesEnriquecidas() {
  return crm.interacciones.map((i) => ({
    ...i,
    clienteNombre: i.cliente_id ? clientePorId[i.cliente_id]?.nombre ?? i.cliente_id : null,
    sinRespuesta: RESULTADOS_SIN_RESPUESTA.includes(i.resultado),
    fueraHorario: enHorario(i.fecha, i.hora_entrada) === false,
  }))
}

// ---------- Clientes ----------
export const REGLAS = { activoDias: 30, riesgoDias: 60 }

function coincideVehiculo(cliente, sku) {
  const prod = catalogoPorSku[sku]
  if (!prod || prod.vehiculos.length === 0) return null // sin base para comparar
  if (prod.vehiculos.some((v) => v.linea.startsWith('Motor'))) return null
  const t = cliente.vehiculo_o_especialidad.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  return prod.vehiculos.some((v) => t.includes(norm(v.marca)) && t.includes(norm(v.linea)))
}

export function clientesEnriquecidos(reglas = REGLAS) {
  return crm.clientes.map((c) => {
    const ventas = crm.ventas.filter((v) => v.cliente_id === c.cliente_id)
    const cots = crm.cotizaciones.filter((q) => q.cliente_id === c.cliente_id)
    const perdidas = cots.filter((q) => q.estado === 'Perdida')
    const competidor = perdidas.filter((q) => q.motivo_perdida === 'Compró a competidor')
    const inter = crm.interacciones.filter((i) => i.cliente_id === c.cliente_id)
    const pqr = crm.pqr.filter((p) => p.cliente_id === c.cliente_id)
    const ultima = ventas.length ? ventas.map((v) => v.fecha).sort().at(-1) : null
    const dias = ultima ? diasEntre(ultima, FECHA_CORTE) : null
    const esTaller = c.segmento === 'Taller'

    let estado = null
    if (esTaller) {
      if (dias == null) estado = 'Sin compras en el período'
      else if (dias <= reglas.activoDias) estado = 'Activo'
      else if (dias <= reglas.riesgoDias) estado = 'En riesgo'
      else estado = 'Inactivo'
    }

    const senales = []
    if (esTaller) {
      if (cots.length >= 3 && perdidas.length / cots.length > 0.5)
        senales.push(`Perdió ${perdidas.length} de ${cots.length} cotizaciones (más de la mitad)`)
      if (competidor.length >= 2) senales.push(`${competidor.length} cotizaciones perdidas por "Compró a competidor"`)
      const quejasAbiertas = pqr.filter((p) => p.tipo === 'Queja')
      if (quejasAbiertas.length) senales.push(`${quejasAbiertas.length} queja(s) registrada(s): ${quejasAbiertas.map((p) => p.pqr_id).join(', ')}`)
    }

    let patronTaller = null
    if (c.segmento === 'Particular') {
      const evidencia = []
      if (ventas.length >= 3) evidencia.push(`${ventas.length} compras en el trimestre`)
      const desajustes = ventas
        .map((v) => ({ v, ok: coincideVehiculo(c, v.sku) }))
        .filter((x) => x.ok === false)
      if (desajustes.length >= 2)
        evidencia.push(`${desajustes.length} compras de referencias que no son de su vehículo registrado (${c.vehiculo_o_especialidad}): ${[...new Set(desajustes.map((x) => x.v.sku))].join(', ')}`)
      if (evidencia.length) patronTaller = evidencia
    }

    return {
      ...c,
      ventas,
      cotizaciones: cots,
      perdidas,
      interacciones: inter,
      pqr,
      ventasValor: sum(ventas.map((v) => v.valor_cop)),
      ultimaCompra: ultima,
      diasDesdeCompra: dias,
      estado,
      senales,
      patronTaller,
      sinAutorizacion: c.autoriza_tratamiento_datos !== 'Sí',
    }
  })
}

// ---------- Campañas, PQR, inventario ----------
export const campanas = () => crm.campanas
export function inventarioConAlertas() {
  return crm.inventario.map((i) => ({
    ...i,
    producto: i.producto,
    bajoMinimoFisico: i.stock_fisico < i.stock_minimo,
    enMinimo: i.stock_fisico === i.stock_minimo,
    pctDiferencia: i.stock_registrado ? i.diferencia / i.stock_registrado : null,
    sinVentas: i.unidades_vendidas_jul_sep === 0,
  }))
}
export function totalesInventario() {
  const inv = crm.inventario
  return {
    registrado: sum(inv.map((i) => i.stock_registrado)),
    fisico: sum(inv.map((i) => i.stock_fisico)),
    costoRegistrado: sum(inv.map((i) => i.stock_registrado * i.costo_promedio_cop)),
    costoFisico: sum(inv.map((i) => i.stock_fisico * i.costo_promedio_cop)),
  }
}
