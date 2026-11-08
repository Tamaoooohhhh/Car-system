import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { buscarTexto, buscarVehiculo, categorias, lineasDe, marcasVehiculo, productos } from '../lib/catalog'
import { BloquePieza, Cabecera, TarjetaProducto } from '../components/ui.jsx'

const ANIOS = Array.from({ length: 2026 - 2007 }, (_, i) => 2026 - i)

export default function Catalogo() {
  const [params, setParams] = useSearchParams()
  const categoria = params.get('categoria') || ''
  const [q, setQ] = useState('')
  const [veh, setVeh] = useState({ marca: '', linea: '', anio: '' })

  const usandoVehiculo = !!veh.marca
  const resultado = useMemo(() => {
    if (usandoVehiculo) {
      const r = buscarVehiculo({ marca: veh.marca, linea: veh.linea, anio: veh.anio ? Number(veh.anio) : null })
      return {
        items: r.compatibles
          .filter((c) => !categoria || c.producto.categoria === categoria)
          .filter((c) => !q.trim() || buscarTexto(q).some((p) => p.sku === c.producto.sku)),
        aConfirmar: r.aConfirmar.filter((p) => !categoria || p.categoria === categoria),
      }
    }
    return {
      items: buscarTexto(q).filter((p) => !categoria || p.categoria === categoria).map((producto) => ({ producto, nota: null })),
      aConfirmar: [],
    }
  }, [q, veh, categoria, usandoVehiculo])

  const setCategoria = (c) => {
    const next = new URLSearchParams(params)
    if (c) next.set('categoria', c)
    else next.delete('categoria')
    setParams(next, { replace: true })
  }
  const hayFiltros = q || veh.marca || categoria
  const limpiar = () => { setQ(''); setVeh({ marca: '', linea: '', anio: '' }); setCategoria('') }

  return (
    <>
      <Cabecera titulo="Catálogo de referencia">
        Las referencias que manejamos, con marca, referencia del fabricante y compatibilidad. No publicamos precios ni existencias: se confirman en la cotización.
      </Cabecera>

      <section className="wrap py-10" aria-label="Buscar en el catálogo">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr] items-end">
          <div>
            <label htmlFor="q" className="label">Buscar por nombre, SKU o referencia del fabricante</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input id="q" type="search" className="input pl-10" placeholder="Ej.: pastillas, FR-101, FT-D1729" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <fieldset>
            <legend className="label">O busca por tu vehículo</legend>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="v-marca" className="sr-only">Marca</label>
                <select id="v-marca" className="input" value={veh.marca} onChange={(e) => setVeh({ marca: e.target.value, linea: '', anio: veh.anio })}>
                  <option value="">Marca</option>
                  {marcasVehiculo.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="v-linea" className="sr-only">Línea</label>
                <select id="v-linea" className="input" value={veh.linea} disabled={!veh.marca} onChange={(e) => setVeh({ ...veh, linea: e.target.value })}>
                  <option value="">Línea</option>
                  {veh.marca && lineasDe(veh.marca).map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="v-anio" className="sr-only">Año</label>
                <select id="v-anio" className="input" value={veh.anio} disabled={!veh.marca} onChange={(e) => setVeh({ ...veh, anio: e.target.value })}>
                  <option value="">Año</option>
                  {ANIOS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoría">
          <button type="button" className={`chip ${!categoria ? 'chip-info' : 'chip-neutral'} !py-1.5 !px-3 cursor-pointer`} aria-pressed={!categoria} onClick={() => setCategoria('')}>Todas</button>
          {categorias.map((c) => (
            <button key={c} type="button" className={`chip ${categoria === c ? 'chip-info' : 'chip-neutral'} !py-1.5 !px-3 cursor-pointer`} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>{c}</button>
          ))}
          {hayFiltros && (
            <button type="button" className="ml-auto text-sm link inline-flex items-center gap-1" onClick={limpiar}><X size={14} aria-hidden="true" /> Limpiar filtros</button>
          )}
        </div>

        <p className="mt-6 text-sm text-muted" role="status" aria-live="polite">
          {resultado.items.length} de {productos.length} referencias
          {usandoVehiculo && ` compatibles con ${[veh.marca, veh.linea, veh.anio].filter(Boolean).join(' ')}`}
        </p>

        {resultado.items.length > 0 && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.items.map(({ producto, nota }) => <TarjetaProducto key={producto.sku} p={producto} nota={nota} />)}
          </div>
        )}

        {usandoVehiculo && resultado.aConfirmar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl">La ficha no fija un modelo: confirmar con un asesor</h2>
            <p className="text-sm text-muted mt-1 max-w-[62ch]">Estas referencias aplican a varios modelos y dependen de datos del vehículo. Un asesor confirma la compatibilidad antes de cotizar.</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resultado.aConfirmar.map((p) => <TarjetaProducto key={p.sku} p={p} nota="Compatibilidad por confirmar" />)}
            </div>
          </div>
        )}

        {resultado.items.length === 0 && (
          <div className="mt-6">
            <BloquePieza compacto texto="No encontramos esa referencia en el catálogo, pero eso no significa que no podamos conseguirla. Cuéntanos qué buscas y un asesor lo consulta." />
          </div>
        )}
      </section>

      {resultado.items.length > 0 && (
        <section className="wrap mt-6"><BloquePieza compacto /></section>
      )}
    </>
  )
}
