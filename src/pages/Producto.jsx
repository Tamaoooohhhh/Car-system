import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Info } from 'lucide-react'
import { porSku, productos } from '../lib/catalog'
import { BotonAgregar, IconoCategoria, TarjetaProducto } from '../components/ui.jsx'
import { NoEncontrada } from './Info.jsx'

export default function Producto() {
  const { sku } = useParams()
  const p = porSku(sku)
  if (!p) return <NoEncontrada />
  const relacionados = productos.filter((x) => x.categoria === p.categoria && x.sku !== p.sku).slice(0, 3)

  const filas = [
    ['SKU', <span className="mono">{p.sku}</span>],
    ['Marca', p.marca],
    ['Referencia del fabricante', <span className="mono">{p.referencia}</span>],
    ['Categoría', p.categoria],
    ['Especificación', p.especificacion],
    ['Compatibilidad', p.compatibilidad],
    ['Garantía', `${p.garantiaMeses} meses`],
  ]

  return (
    <div className="wrap py-10">
      <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm link"><ChevronLeft size={16} aria-hidden="true" /> Volver al catálogo</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid place-items-center size-12 rounded-md bg-teal-tint text-teal-ink"><IconoCategoria categoria={p.categoria} size={26} /></span>
            <span className="chip chip-neutral">{p.categoria}</span>
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl">{p.producto}</h1>
          <p className="mt-2 text-lg text-muted">{p.marca} · <span className="mono">{p.referencia}</span></p>

          <dl className="mt-8 border-t border-navy">
            {filas.map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[14rem_1fr] gap-1 sm:gap-6 py-3.5 border-b border-line">
                <dt className="text-sm font-semibold text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {p.consultarCompatibilidad && (
            <p className="mt-4 text-sm bg-orange-tint text-orange-ink rounded-md px-4 py-3">La ficha no fija un modelo. Un asesor confirma polaridad, borne y compatibilidad con tu vehículo antes de cotizar.</p>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 self-start bg-paper border border-line rounded-xl p-6 grid gap-4" aria-label="Solicitar cotización">
          <h2 className="text-xl">Solicita tu cotización</h2>
          <p className="text-sm text-muted flex gap-2"><Info size={18} className="shrink-0 mt-0.5" aria-hidden="true" /> Precio, disponibilidad y plazo de entrega se confirman en la cotización.</p>
          <BotonAgregar sku={p.sku} />
          <Link to="/cotizacion" className="btn btn-line">Ver mi lista</Link>
        </aside>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16" aria-labelledby="rel-h">
          <h2 id="rel-h" className="text-2xl">Más de {p.categoria.toLowerCase()}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relacionados.map((r) => <TarjetaProducto key={r.sku} p={r} />)}</div>
        </section>
      )}
    </div>
  )
}
