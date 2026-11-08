export function Panel({ titulo, fuente, nota, children, accion, className = '' }) {
  return (
    <section className={`bg-white border border-line rounded-lg ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-2 px-5 pt-4 pb-3 border-b border-line">
        <div>
          <h2 className="text-lg font-bold leading-tight">{titulo}</h2>
          {nota && <p className="text-sm text-muted mt-0.5 max-w-[70ch]">{nota}</p>}
        </div>
        {accion}
      </header>
      <div className="p-5">{children}</div>
      {fuente && <p className="px-5 pb-3 text-xs text-muted">Fuente: <span className="mono">{fuente}</span></p>}
    </section>
  )
}

export function Dato({ etiqueta, valor, detalle }) {
  return (
    <div className="py-1">
      <p className="text-xs font-semibold text-muted">{etiqueta}</p>
      <p className="font-display text-2xl font-bold num leading-tight mt-0.5">{valor}</p>
      {detalle && <p className="text-xs text-muted mt-0.5">{detalle}</p>}
    </div>
  )
}

/** Barras horizontales planas. items: [{ label, value, texto?, color? }] */
export function Barras({ items, max, ariaLabel }) {
  const m = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="grid gap-2.5" aria-label={ariaLabel}>
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[minmax(7rem,12rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate" title={i.label}>{i.label}</span>
          <span className="h-3 bg-paper rounded-sm overflow-hidden" aria-hidden="true">
            <span className="block h-full rounded-sm" style={{ width: `${Math.max(2, (i.value / m) * 100)}%`, background: i.color || '#07325a' }} />
          </span>
          <span className="num text-right font-medium min-w-[5.5rem]">{i.texto ?? i.value}</span>
        </li>
      ))}
    </ul>
  )
}

const MAPA = {
  Ganada: 'chip-ok', Perdida: 'chip-bad', Cerrada: 'chip-neutral', Abierta: 'chip-warn',
  Activo: 'chip-ok', 'En riesgo': 'chip-warn', Inactivo: 'chip-bad',
}
export const Estado = ({ v }) => <span className={`chip ${MAPA[v] || 'chip-neutral'}`}>{v ?? 'sin dato'}</span>

export function Vacio({ children }) {
  return <p className="text-sm text-muted border border-dashed border-[#9db0c0] rounded-md p-6 text-center">{children}</p>
}

export function ProximoSinDato({ children }) {
  return <p className="text-xs text-muted italic">{children}</p>
}
