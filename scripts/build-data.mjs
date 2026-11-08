// Convierte los CSV de /data a JSON tipado en /src/data.
// - catalog.json: catálogo PÚBLICO (sin precio, costo, stock ni proveedor).
// - crm.json: datos completos para el CRM demo (lazy-loaded por la app).
import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

const root = path.resolve(import.meta.dirname, '..')
const read = (name) => {
  const text = fs.readFileSync(path.join(root, 'data', `${name}.csv`), 'utf8').replace(/^\uFEFF/, '')
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true })
  if (errors.length) throw new Error(`${name}.csv: ${errors[0].message}`)
  return data
}

const NUM = {
  campanas: ['inversion_cop','publicaciones','alcance','interacciones','clics','mensajes_recibidos_plataforma','contactos_registrados','cotizaciones_con_origen','ventas_con_origen','valor_ventas_con_origen_cop'],
  cotizaciones: ['cantidad','horas_respuesta'],
  interacciones: ['minutos_primera_respuesta','minutos_envio_precio'],
  inventario: ['stock_registrado','stock_fisico','diferencia','stock_minimo','tiempo_reposicion_dias','costo_promedio_cop','unidades_vendidas_jul_sep'],
  pqr: ['dias_resolucion'],
  productos: ['precio_cop','garantia_meses'],
  publicaciones: ['alcance','me_gusta','comentarios','compartidos','guardados','interacciones','clics_enlace','mensajes_directos'],
  ventas: ['cantidad','valor_cop'],
  clientes: [],
}

function typed(name) {
  return read(name).map((row) => {
    const out = {}
    for (const [k, v] of Object.entries(row)) {
      const s = (v ?? '').trim()
      if (s === '') out[k] = null
      else if (NUM[name].includes(k)) {
        const n = Number(s)
        if (Number.isNaN(n)) throw new Error(`${name}.${k}: "${s}" no es número`)
        out[k] = n
      } else out[k] = s
    }
    return out
  })
}

const all = {}
for (const name of Object.keys(NUM)) all[name] = typed(name)

// Vehículos del catálogo: transcripción literal del campo `compatibilidad`
// de productos.csv, estructurada para el buscador por vehículo. No agrega datos.
const VEHICLES = {
  'FR-101': [
    { marca: 'Mazda', linea: 'Mazda 3', desde: 2014, hasta: 2019 },
    { marca: 'Mazda', linea: 'Mazda 2', desde: 2015, hasta: 2020 },
    { marca: 'Mazda', linea: 'CX-30', desde: 2020, hasta: 2022 },
  ],
  'FR-102': [
    { marca: 'Renault', linea: 'Logan', desde: 2013, hasta: 2020 },
    { marca: 'Renault', linea: 'Sandero', desde: 2013, hasta: 2020 },
    { marca: 'Renault', linea: 'Duster', detalle: '4x2', desde: 2012, hasta: 2019 },
  ],
  'MO-201': [
    { marca: 'Chevrolet', linea: 'Spark' },
    { marca: 'Chevrolet', linea: 'Sail' },
    { marca: 'Chevrolet', linea: 'Aveo' },
    { marca: 'Renault', linea: 'Motor 1.4/1.6', detalle: 'rosca 3/4-16 UNF' },
  ],
  'MO-202': [
    { marca: 'Chevrolet', linea: 'Sail', detalle: '1.4', desde: 2011, hasta: 2019 },
    { marca: 'Chevrolet', linea: 'Aveo', detalle: '1.4/1.6', desde: 2008, hasta: 2017 },
  ],
  'SU-301': [
    { marca: 'Renault', linea: 'Sandero', desde: 2012, hasta: 2019 },
    { marca: 'Renault', linea: 'Logan', desde: 2012, hasta: 2019 },
  ],
  'SU-302': [
    { marca: 'Chevrolet', linea: 'Spark GT', desde: 2011, hasta: 2021 },
    { marca: 'Chevrolet', linea: 'Beat', desde: 2011, hasta: 2021 },
  ],
  'EL-401': [], // "Varios modelos": confirmar con asesor
  'EL-402': [{ marca: 'Chevrolet', linea: 'Sail', detalle: '1.4', desde: 2013, hasta: 2019 }],
  'RE-501': [
    { marca: 'Chevrolet', linea: 'Spark GT', detalle: 'transmisión mecánica', desde: 2011, hasta: 2020 },
    { marca: 'Chevrolet', linea: 'Beat', detalle: 'transmisión mecánica', desde: 2011, hasta: 2020 },
  ],
  'RE-502': [{ marca: 'Renault', linea: 'Motor K4M 1.6 16V' }],
  'FI-601': [
    { marca: 'Renault', linea: 'Logan', detalle: '1.6' },
    { marca: 'Renault', linea: 'Sandero', detalle: '1.6' },
    { marca: 'Renault', linea: 'Duster', detalle: '1.6' },
  ],
  'FI-602': [
    { marca: 'Chevrolet', linea: 'Sail' },
    { marca: 'Chevrolet', linea: 'Aveo' },
  ],
}

const missing = all.productos.filter((p) => !(p.sku in VEHICLES)).map((p) => p.sku)
if (missing.length) throw new Error(`Sin entrada de vehículos para: ${missing.join(', ')}`)

const catalog = all.productos.map((p) => ({
  sku: p.sku,
  producto: p.producto,
  categoria: p.categoria,
  marca: p.marca,
  referencia: p.referencia_fabricante,
  compatibilidad: p.compatibilidad,
  especificacion: p.especificacion,
  garantiaMeses: p.garantia_meses,
  vehiculos: VEHICLES[p.sku],
  consultarCompatibilidad: VEHICLES[p.sku].length === 0,
}))

fs.mkdirSync(path.join(root, 'src/data'), { recursive: true })
fs.writeFileSync(path.join(root, 'src/data/catalog.json'), JSON.stringify(catalog, null, 1))
// Precios de lista: solo los usa la maqueta de pago. No entran al catálogo público ni al bot.
fs.writeFileSync(path.join(root, 'src/data/precios.json'), JSON.stringify(Object.fromEntries(all.productos.map((p) => [p.sku, p.precio_cop]))))
fs.writeFileSync(path.join(root, 'src/data/crm.json'), JSON.stringify(all))
// El servidor del bot lee el mismo catálogo público.
fs.writeFileSync(path.join(root, 'server/catalog.json'), JSON.stringify(catalog))
console.log('datos listos:', Object.entries(all).map(([k, v]) => `${k}=${v.length}`).join(' '))
