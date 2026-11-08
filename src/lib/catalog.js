import catalog from '../data/catalog.json'

export const productos = catalog
export const porSku = (sku) => catalog.find((p) => p.sku === sku)
export const categorias = [...new Set(catalog.map((p) => p.categoria))]
export const marcasProducto = [...new Set(catalog.map((p) => p.marca))].sort()

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export { norm }

// Vehículos disponibles para el buscador (derivados de la compatibilidad de cada ficha).
const vehiculosPlano = catalog.flatMap((p) => p.vehiculos.map((v) => ({ ...v, sku: p.sku })))
export const marcasVehiculo = [...new Set(vehiculosPlano.map((v) => v.marca))].sort()
export const lineasDe = (marca) =>
  [...new Set(vehiculosPlano.filter((v) => v.marca === marca).map((v) => v.linea))].sort()

export function buscarTexto(q) {
  const t = norm(q.trim())
  if (!t) return catalog
  return catalog.filter((p) =>
    norm([p.sku, p.producto, p.marca, p.referencia, p.categoria, p.compatibilidad, p.especificacion].join(' ')).includes(t),
  )
}

/** Buscador por vehículo. Devuelve { compatibles, aConfirmar }.
 *  - compatibles: la ficha lista ese vehículo (y el año cae en el rango si hay rango).
 *  - aConfirmar: fichas que dicen "varios modelos" y requieren confirmación del asesor. */
export function buscarVehiculo({ marca, linea, anio }) {
  const compatibles = []
  for (const p of catalog) {
    const hits = p.vehiculos.filter((v) => {
      if (marca && v.marca !== marca) return false
      if (linea && v.linea !== linea) return false
      if (anio && v.desde && (anio < v.desde || anio > v.hasta)) return false
      return true
    })
    if (hits.length) {
      const h = hits[0]
      compatibles.push({ producto: p, nota: h.desde ? `${h.desde}–${h.hasta}${h.detalle ? ` · ${h.detalle}` : ''}` : h.detalle ? h.detalle : 'Sin rango de años en la ficha: confirmar con el asesor' })
    }
  }
  const aConfirmar = catalog.filter((p) => p.consultarCompatibilidad)
  return { compatibles, aConfirmar }
}
