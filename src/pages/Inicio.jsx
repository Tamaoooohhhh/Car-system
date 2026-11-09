import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, ClipboardList, UserRoundCheck } from 'lucide-react'
import { categorias, productos, porSku } from '../lib/catalog'
import { empresa } from '../config/empresa'
import { BloquePieza, IconoCategoria } from '../components/ui.jsx'

const EJEMPLO = ['FR-101', 'FR-102', 'EL-401'].map(porSku)

function ListaEjemplo() {
  return (
    <div className="bg-white border border-line rounded-xl shadow-[0_18px_40px_-24px_rgba(7,50,90,0.45)] enter-late" role="img" aria-label="Ejemplo de una lista de cotización con tres referencias del catálogo">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <span className="font-display font-bold text-lg">Tu lista de cotización</span>
        <span className="chip chip-info">3 referencias</span>
      </div>
      <ul>
        {EJEMPLO.map((p) => (
          <li key={p.sku} className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0">
            <span className="grid place-items-center size-10 rounded-md bg-teal-tint text-teal-ink shrink-0"><IconoCategoria categoria={p.categoria} size={20} /></span>
            <div className="min-w-0 grow">
              <p className="font-semibold leading-tight truncate">{p.producto}</p>
              <p className="text-xs text-muted mono mt-0.5">{p.sku} · {p.referencia}</p>
            </div>
            <span className="chip chip-info shrink-0">En inventario</span>
          </li>
        ))}
      </ul>
      <div className="px-5 py-4 bg-paper rounded-b-xl grid gap-1 text-sm">
        <div className="flex justify-between"><span className="text-muted">Precio</span><span className="font-medium">En la cotización</span></div>
        <div className="flex justify-between"><span className="text-muted">Disponibilidad</span><span className="font-medium">En inventario</span></div>
        <div className="flex justify-between"><span className="text-muted">Plazo de entrega</span><span className="font-medium">En la cotización</span></div>
      </div>
    </div>
  )
}

const PASOS = [
  { Icon: ClipboardList, t: 'Arma tu lista', d: 'Elige las referencias del catálogo o cuéntanos qué necesitas. Si no conoces la referencia, dinos el vehículo.' },
  { Icon: UserRoundCheck, t: 'Un asesor te acompaña', d: 'La disponibilidad ya está registrada en el inventario. Si necesitas profundizar en un caso muy específico, un asesor puede ayudarte; para el resto, el chatbot te orienta sobre repuestos, compatibilidad y cotizaciones.' },
  { Icon: ClipboardCheck, t: 'Recibes la cotización', d: 'Recibes el precio y el plazo de entrega por WhatsApp, teléfono o en el mostrador. La disponibilidad está en el inventario.' },
]

export default function Inicio() {
  return (
    <>
      <section className="border-b border-line">
        <div className="wrap py-14 md:py-20 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="enter">
            <h1 className="text-[2.3rem] md:text-5xl lg:text-[3.4rem] leading-[1.05]">
              Repuestos para talleres y propietarios, cotizados por un asesor que conoce el oficio.
            </h1>
            <p className="mt-6 text-lg text-muted max-w-[56ch]">
              Consulta las referencias que manejamos, arma tu lista y recibe una cotización con precio y plazo de entrega. La disponibilidad está registrada en el inventario. En Guayabal, Medellín, desde {empresa.fundacion}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn btn-primary">Ver el catálogo <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link to="/pieza-especifica" className="btn btn-line">Pedir una pieza específica</Link>
            </div>
          </div>
          <ListaEjemplo />
        </div>
      </section>

      <section className="wrap py-20" aria-labelledby="como-h">
        <h2 id="como-h" className="text-3xl md:text-4xl max-w-[22ch]">Cada venta empieza con una cotización</h2>
        <ol className="mt-10 grid md:grid-cols-3 border-t border-navy">
          {PASOS.map(({ Icon, t, d }, i) => (
            <li key={t} className={`py-8 md:pr-8 ${i > 0 ? 'md:pl-8 md:border-l border-line' : ''} ${i < 2 ? 'border-b md:border-b-0 border-line' : ''}`}>
              <Icon size={26} strokeWidth={1.75} className="text-teal-ink" aria-hidden="true" />
              <h3 className="mt-4 text-xl">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2"><Link to="/como-cotizamos" className="link">Cómo funciona, con horarios y cobertura</Link></p>
      </section>

      <section className="bg-paper border-y border-line" aria-labelledby="cat-h">
        <div className="wrap py-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="cat-h" className="text-3xl md:text-4xl">Seis líneas de repuestos</h2>
            <p className="mt-4 text-muted max-w-[44ch]">{productos.length} referencias de marcas como Frenotec, Motrix, Voltara y Termocar, con marca, referencia del fabricante y compatibilidad en cada ficha.</p>
            <Link to="/catalogo" className="btn btn-dark mt-6">Ver todas las referencias</Link>
          </div>
          <ul className="border-t border-navy">
            {categorias.map((c) => {
              const n = productos.filter((p) => p.categoria === c).length
              return (
                <li key={c} className="border-b border-line">
                  <Link to={`/catalogo?categoria=${encodeURIComponent(c)}`} className="group flex items-center gap-4 py-4 px-1 hover:bg-white transition-colors">
                    <span className="grid place-items-center size-10 rounded-md bg-white text-teal-ink border border-line"><IconoCategoria categoria={c} size={20} /></span>
                    <span className="font-display font-bold text-xl grow">{c}</span>
                    <span className="text-sm text-muted num">{n} {n === 1 ? 'referencia' : 'referencias'}</span>
                    <ArrowRight size={18} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-navy" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="wrap py-20 grid gap-12 md:grid-cols-2" aria-labelledby="dos-h">
        <h2 id="dos-h" className="sr-only">Para talleres y para propietarios</h2>
        <div>
          <h3 className="text-2xl md:text-3xl">Si tienes un taller</h3>
          <p className="mt-3 text-muted max-w-[52ch]">Conoces la referencia y necesitas varias unidades. Te asignamos un asesor, tienes crédito para talleres con historial y descuentos por volumen que autoriza la coordinación comercial.</p>
          <Link to="/talleres" className="link inline-block mt-4">Condiciones para talleres</Link>
        </div>
        <div>
          <h3 className="text-2xl md:text-3xl">Si eres propietario de un vehículo</h3>
          <p className="mt-3 text-muted max-w-[52ch]">No necesitas saber la referencia. Dinos marca, línea y año, o la placa, y un asesor identifica la pieza correcta. También puedes enviar una foto de la pieza por WhatsApp.</p>
          <Link to="/catalogo" className="link inline-block mt-4">Buscar por vehículo</Link>
        </div>
      </section>

      <section className="wrap pb-6" aria-labelledby="horario-h">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] border-t border-navy pt-12">
          <h2 id="horario-h" className="text-3xl md:text-4xl">Dónde estamos y cuándo atendemos</h2>
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            <div><dt className="text-sm font-semibold text-muted">Sede</dt><dd className="mt-1 font-medium">{empresa.sede}</dd></div>
            <div><dt className="text-sm font-semibold text-muted">Cobertura de entregas</dt><dd className="mt-1 font-medium">{empresa.cobertura.join(', ')}</dd></div>
            <div>
              <dt className="text-sm font-semibold text-muted">Horario de atención</dt>
              <dd className="mt-1">{empresa.horario.map((h) => <p key={h.dias}><span className="font-medium">{h.dias}:</span> {h.horas}</p>)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted">Rutas de entrega en moto</dt>
              <dd className="mt-1 font-medium">Salidas a las {empresa.rutas.join(' y a las ')}<p className="text-sm font-normal text-muted mt-1">El plazo de cada pedido se confirma en la cotización.</p></dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="wrap mt-16">
        <BloquePieza />
      </section>
    </>
  )
}
