const copFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const numFmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const intFmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export const cop = (n) => (n == null ? 'sin dato' : copFmt.format(n))
export const num = (n) => (n == null ? 'sin dato' : numFmt.format(n))
export const int = (n) => (n == null ? 'sin dato' : intFmt.format(n))
export const pct = (n) => (n == null ? 'sin dato' : `${numFmt.format(n * 100)} %`)

export function copCorto(n) {
  if (n == null) return 'sin dato'
  if (Math.abs(n) >= 1e6) return `$${numFmt.format(n / 1e6)} M`
  if (Math.abs(n) >= 1e3) return `$${intFmt.format(n / 1e3)} mil`
  return `$${intFmt.format(n)}`
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export function fecha(iso) {
  if (!iso) return 'sin dato'
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ${MESES[m - 1]} ${y}`
}

export function minutosLegibles(min) {
  if (min == null) return 'sin dato'
  if (min < 60) return `${intFmt.format(min)} min`
  const h = min / 60
  if (h < 48) return `${numFmt.format(h)} h`
  return `${numFmt.format(h / 24)} días`
}

export const horasLegibles = (h) => (h == null ? 'sin dato' : `${numFmt.format(h)} h`)
