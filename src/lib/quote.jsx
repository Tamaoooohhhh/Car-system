import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { empresa } from '../config/empresa'
import { porSku } from './catalog'

const KEY = 'carsystem.cotizacion.v1'
const Ctx = createContext(null)

const vacio = { items: [], datos: { nombre: '', tipo: '', marca: '', linea: '', anio: '', placa: '', notas: '', consentimiento: false } }

export function QuoteProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
      return raw && raw.items ? { ...vacio, ...raw, datos: { ...vacio.datos, ...raw.datos } } : vacio
    } catch {
      return vacio
    }
  })
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo(
    () => ({
      items: state.items,
      datos: state.datos,
      total: state.items.reduce((a, i) => a + i.qty, 0),
      tiene: (sku) => state.items.some((i) => i.sku === sku),
      agregar: (sku) =>
        setState((s) => (s.items.some((i) => i.sku === sku) ? s : { ...s, items: [...s.items, { sku, qty: 1 }] })),
      quitar: (sku) => setState((s) => ({ ...s, items: s.items.filter((i) => i.sku !== sku) })),
      cantidad: (sku, qty) =>
        setState((s) => ({ ...s, items: s.items.map((i) => (i.sku === sku ? { ...i, qty: Math.max(1, Math.min(999, qty || 1)) } : i)) })),
      datosSet: (patch) => setState((s) => ({ ...s, datos: { ...s.datos, ...patch } })),
      limpiar: () => setState(vacio),
    }),
    [state],
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useQuote = () => useContext(Ctx)

export function mensajeCotizacion({ items, datos, origen }) {
  const lineas = items.map((i) => {
    const p = porSku(i.sku)
    return `• ${i.qty} × ${p.producto} (${p.sku} · ref. ${p.referencia})`
  })
  const veh = [datos.marca, datos.linea, datos.anio].filter(Boolean).join(' ')
  const partes = [
    'Hola, quiero solicitar una cotización.',
    '',
    ...(lineas.length ? ['Referencias:', ...lineas, ''] : []),
    veh || datos.placa ? `Vehículo: ${veh || 'sin dato'}${datos.placa ? ` · placa ${datos.placa}` : ''}` : null,
    datos.nombre ? `Nombre: ${datos.nombre}` : null,
    datos.tipo ? `Soy: ${datos.tipo === 'taller' ? 'taller mecánico' : 'propietario de vehículo'}` : null,
    datos.notas ? `Notas: ${datos.notas}` : null,
    datos.consentimiento ? 'Autorizo el tratamiento de mis datos personales para atender esta cotización.' : null,
    '',
    `Origen: ${origen}`,
  ]
  return partes.filter((x) => x !== null).join('\n')
}

export function enlaceWhatsApp(texto) {
  if (!empresa.whatsapp) return null
  return `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(texto)}`
}
