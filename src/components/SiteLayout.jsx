import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, Menu, X } from 'lucide-react'
import { empresa } from '../config/empresa'
import { useQuote } from '../lib/quote.jsx'
import AssistantWidget from './AssistantWidget.jsx'

const NAV = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/talleres', label: 'Talleres' },
  { to: '/como-cotizamos', label: 'Cómo cotizamos' },
  { to: '/pieza-especifica', label: 'Pieza específica' },
]

const navClass = ({ isActive }) =>
  `px-3 py-2 text-[0.95rem] font-medium rounded-md transition-colors ${isActive ? 'text-navy bg-teal-tint' : 'text-muted hover:text-navy hover:bg-paper'}`

export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { total } = useQuote()
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-orange focus:text-navy focus:px-4 focus:py-2 focus:rounded-md">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 bg-white border-b border-line">
        <div className="wrap flex items-center justify-between gap-4 h-[72px]">
          <Link to="/" aria-label="CarSystem, ir al inicio" className="shrink-0 flex items-center">
            <img src="/logo.png" alt="CarSystem" width="78" height="50" className="h-[52px] w-auto" />
          </Link>
          <nav aria-label="Principal" className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={navClass}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cotizacion" className="btn btn-primary btn-sm">
              <ClipboardList size={17} aria-hidden="true" />
              <span>Mi cotización</span>
              <span className="mono ml-0.5 bg-navy text-white rounded px-1.5 text-xs leading-5" aria-label={`${total} unidades en la lista`}>{total}</span>
            </Link>
            <button
              type="button"
              className="lg:hidden btn btn-line btn-sm"
              aria-expanded={open}
              aria-controls="menu-movil"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
            </button>
          </div>
        </div>
        {open && (
          <nav id="menu-movil" aria-label="Principal móvil" className="lg:hidden border-t border-line bg-white">
            <div className="wrap py-3 grid gap-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={navClass} onClick={() => setOpen(false)}>{n.label}</NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="contenido" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-paper mt-24">
        <div className="wrap py-14 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <img src="/logo.png" alt="CarSystem" width="78" height="50" className="h-[56px] w-auto" />
            <p className="mt-4 text-sm text-muted max-w-[34ch]">{empresa.razonSocial} · Distribuidor de repuestos desde {empresa.fundacion}.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-normal mb-3">Visítanos</h2>
            <p className="text-sm text-muted">{empresa.sede}</p>
            <p className="text-sm text-muted mt-3">Entregas en {empresa.cobertura.join(', ')}.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-normal mb-3">Horario</h2>
            <ul className="text-sm text-muted space-y-1">
              {empresa.horario.map((h) => (
                <li key={h.dias}><span className="text-ink font-medium">{h.dias}:</span> {h.horas}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-normal mb-3">Más información</h2>
            <ul className="text-sm space-y-1.5">
              <li><Link className="link" to="/garantia">Garantía</Link></li>
              <li><Link className="link" to="/privacidad">Privacidad y datos personales</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <p className="wrap py-4 text-xs text-muted">
            Precio, disponibilidad y plazo de entrega se confirman en cada cotización. Demostración con datos del expediente julio–septiembre 2026.
          </p>
        </div>
      </footer>
      <AssistantWidget />
    </>
  )
}
