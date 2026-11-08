import { Link } from 'react-router-dom'
import { ArrowRight, Check, Cog, Disc3, Filter, MoveVertical, Plus, Thermometer, Zap } from 'lucide-react'
import { useQuote } from '../lib/quote.jsx'
import { empresa } from '../config/empresa'

export const ICONO_CATEGORIA = {
  Frenos: Disc3,
  Motor: Cog,
  Suspensión: MoveVertical,
  Eléctrico: Zap,
  Refrigeración: Thermometer,
  Filtros: Filter,
}

export function IconoCategoria({ categoria, size = 22 }) {
  const I = ICONO_CATEGORIA[categoria] || Cog
  return <I size={size} strokeWidth={1.75} aria-hidden="true" />
}

export function BotonAgregar({ sku, small }) {
  const q = useQuote()
  const dentro = q.tiene(sku)
  return (
    <button
      type="button"
      className={`btn ${dentro ? 'btn-line' : 'btn-dark'} ${small ? 'btn-sm' : ''}`}
      onClick={() => (dentro ? q.quitar(sku) : q.agregar(sku))}
      aria-pressed={dentro}
    >
      {dentro ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      {dentro ? 'En tu cotización' : 'Agregar a mi cotización'}
    </button>
  )
}

export function TarjetaProducto({ p, nota }) {
  return (
    <article className="lift group relative bg-white border border-line rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="grid place-items-center size-11 rounded-md bg-teal-tint text-teal-ink">
          <IconoCategoria categoria={p.categoria} />
        </span>
        <span className="mono text-xs text-muted pt-1">{p.sku}</span>
      </div>
      <div>
        <h3 className="text-lg leading-tight">
          <Link to={`/catalogo/${p.sku}`} className="hover:text-teal-ink hover:underline after:absolute after:inset-0">
            {p.producto}
          </Link>
        </h3>
        <p className="text-sm text-muted mt-1">{p.marca} · <span className="mono">{p.referencia}</span></p>
      </div>
      <p className="text-sm text-muted">{p.especificacion}</p>
      {nota && <p className="text-xs font-medium text-teal-ink">{nota}</p>}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 relative z-10">
        <span className="chip chip-neutral">Garantía {p.garantiaMeses} meses</span>
        <BotonAgregar sku={p.sku} small />
      </div>
    </article>
  )
}

export function BloquePieza({ compacto = false, texto }) {
  return (
    <section className="bg-navy text-white rounded-xl" aria-labelledby="pieza-h">
      <div className={`grid gap-6 items-center ${compacto ? 'p-7 md:grid-cols-[1fr_auto]' : 'p-9 md:p-12 md:grid-cols-[1fr_auto]'}`}>
        <div>
          <h2 id="pieza-h" className={`${compacto ? 'text-2xl' : 'text-3xl md:text-4xl'} font-extrabold`}>
            ¿Necesitas un artículo en específico?
          </h2>
          <p className="mt-3 text-white/85 max-w-[58ch]">
            {texto || 'Si no lo ves en la lista, escríbenos. Un asesor lo consulta con los proveedores y te cotiza, con precio y plazo confirmados.'}
          </p>
        </div>
        <Link to="/pieza-especifica" className="btn btn-primary w-full md:w-auto">
          Escríbenos <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

export function Contacto({ campo, etiqueta }) {
  const v = empresa[campo]
  return (
    <span>
      {etiqueta}: {v ? <strong>{v}</strong> : <em className="text-muted">por confirmar</em>}
    </span>
  )
}

export function Cabecera({ titulo, children, cola }) {
  return (
    <div className="bg-paper border-b border-line">
      <div className="wrap py-12 md:py-16 grid gap-4 md:grid-cols-[1fr_auto] items-end">
        <div>
          <h1 className="text-4xl md:text-5xl">{titulo}</h1>
          {children && <p className="mt-4 text-lg text-muted max-w-[62ch]">{children}</p>}
        </div>
        {cola}
      </div>
    </div>
  )
}
