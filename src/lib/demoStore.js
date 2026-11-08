// Estado de la demo en memoria (con respaldo en localStorage).
// Todo lo que se crea aquí queda marcado como "Creado en esta demo": no se mezcla con los datos reales.
import { useSyncExternalStore } from 'react'

const KEY = 'carsystem.demo.v1'
let state = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw && Array.isArray(raw.conversaciones)) return { pedidos: [], ...raw }
  } catch { /* sin respaldo */ }
  return { conversaciones: [], pedidos: [] }
})()
const listeners = new Set()

function commit(next) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* cuota llena */ }
  listeners.forEach((l) => l())
}
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
const snapshot = () => state

export const useDemo = () => useSyncExternalStore(subscribe, snapshot)

let n = 0
const uid = (p) => `${p}-${Date.now().toString(36)}${(n++).toString(36)}`

export const demo = {
  obtener: (id) => state.conversaciones.find((c) => c.id === id) || null,
  nuevaConversacion({ fueraDeHorario, relojLabel }) {
    const c = {
      id: uid('DEMO'),
      creadoEn: new Date().toISOString(),
      estado: 'Conversando con el bot',
      fueraDeHorario: !!fueraDeHorario,
      relojLabel: relojLabel || null,
      atencionManual: false,
      tomadaPorAsesor: false,
      caso: null, // datos capturados por el bot
      mensajes: [],
    }
    commit({ ...state, conversaciones: [c, ...state.conversaciones] })
    return c.id
  },
  mensaje(id, de, texto) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) =>
        c.id === id ? { ...c, mensajes: [...c.mensajes, { id: uid('m'), de, texto, ts: new Date().toISOString() }] } : c,
      ),
    })
  },
  registrarCaso(id, caso) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) =>
        c.id === id
          ? { ...c, caso, estado: caso.derivar ? 'Pendiente de asesor' : 'Caso registrado' }
          : c,
      ),
    })
  },
  derivar(id, derivacion) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) =>
        c.id === id && !c.tomadaPorAsesor ? { ...c, derivacion, estado: 'Pendiente de asesor' } : c,
      ),
    })
  },
  marcarManual(id) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) =>
        c.id === id ? { ...c, atencionManual: true, estado: 'Atención manual' } : c,
      ),
    })
  },
  pedirAsesor(id) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) =>
        c.id === id && !c.tomadaPorAsesor ? { ...c, estado: 'Pendiente de asesor', pideAsesor: true } : c,
      ),
    })
  },
  tomar(id) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) =>
        c.id === id ? { ...c, tomadaPorAsesor: true, estado: 'Tomada por asesor' } : c,
      ),
    })
  },
  cerrar(id) {
    commit({
      ...state,
      conversaciones: state.conversaciones.map((c) => (c.id === id ? { ...c, estado: 'Cerrada' } : c)),
    })
  },
  crearPedido(datos) {
    const id = `PED-${Date.now().toString(36).toUpperCase().slice(-6)}`
    const pedido = { id, creadoEn: new Date().toISOString(), estado: 'Pago recibido', ...datos }
    commit({ ...state, pedidos: [pedido, ...state.pedidos] })
    return id
  },
  estadoPedido(id, estado) {
    commit({ ...state, pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, estado } : p)) })
  },
  pedido: (id) => state.pedidos.find((p) => p.id === id) || null,
  reiniciar() {
    commit({ conversaciones: [], pedidos: [] })
  },
}
