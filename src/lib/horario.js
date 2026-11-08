// Horario de atención (perfil corporativo). Hora de Colombia (UTC-5, sin horario de verano).
// Los festivos no se calculan (no hay calendario en los datos): solo se tratan los domingos.
const TZ_OFFSET_MIN = -5 * 60

// minutos desde medianoche [apertura, cierre] por día de la semana (0 = domingo)
const VENTANAS = {
  0: null,
  1: [7 * 60 + 30, 18 * 60],
  2: [7 * 60 + 30, 18 * 60],
  3: [7 * 60 + 30, 18 * 60],
  4: [7 * 60 + 30, 18 * 60],
  5: [7 * 60 + 30, 18 * 60],
  6: [7 * 60 + 30, 13 * 60],
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function aBogota(date) {
  const ms = date.getTime() + date.getTimezoneOffset() * 60000 + TZ_OFFSET_MIN * 60000
  const d = new Date(ms)
  return { dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }
}

function hora12(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  const suf = h >= 12 ? 'p. m.' : 'a. m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suf}`
}

export function estadoAtencion(date = new Date()) {
  const { dia, min } = aBogota(date)
  const v = VENTANAS[dia]
  if (v && min >= v[0] && min < v[1]) {
    return { abierto: true, cierraA: hora12(v[1]), texto: `Abierto ahora. Hoy atendemos hasta las ${hora12(v[1])}.` }
  }
  // buscar próxima apertura
  let offset = 0
  let d = dia
  if (v && min < v[0]) {
    return { abierto: false, reabre: `hoy a las ${hora12(v[0])}`, texto: `Cerrado ahora. Reabrimos hoy a las ${hora12(v[0])}.` }
  }
  for (let i = 1; i <= 7; i++) {
    d = (dia + i) % 7
    if (VENTANAS[d]) { offset = i; break }
  }
  const apertura = hora12(VENTANAS[d][0])
  const cuando = offset === 1 ? `mañana (${DIAS[d]})` : `el ${DIAS[d]}`
  return { abierto: false, reabre: `${cuando} a las ${apertura}`, texto: `Cerrado ahora. Reabrimos ${cuando} a las ${apertura}.` }
}

// Relojes de prueba para el simulador (fechas fijas, hora de Colombia).
export const RELOJES = [
  { id: 'real', label: 'Hora real', iso: null },
  { id: 'martes', label: 'Martes 10:00 a. m.', iso: '2026-11-10T10:00:00-05:00' },
  { id: 'lunes-noche', label: 'Lunes 7:30 p. m.', iso: '2026-11-09T19:30:00-05:00' },
  { id: 'sabado-tarde', label: 'Sábado 2:00 p. m.', iso: '2026-11-14T14:00:00-05:00' },
  { id: 'domingo', label: 'Domingo 9:00 a. m.', iso: '2026-11-15T09:00:00-05:00' },
]

export function fechaDeReloj(id) {
  const r = RELOJES.find((x) => x.id === id)
  return r && r.iso ? new Date(r.iso) : new Date()
}

/** ¿Una interacción registrada (fecha AAAA-MM-DD, hora HH:MM) ocurrió dentro del horario de atención? */
export function enHorario(fechaISO, hhmm) {
  if (!fechaISO || !hhmm) return null
  const [y, m, d] = fechaISO.split('-').map(Number)
  const dia = new Date(y, m - 1, d).getDay()
  const [h, mi] = hhmm.split(':').map(Number)
  const min = h * 60 + mi
  const v = VENTANAS[dia]
  return !!v && min >= v[0] && min < v[1]
}
