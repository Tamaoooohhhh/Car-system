import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowLeft, BarChart3, Boxes, Clock, CreditCard, Download, FileWarning, Inbox, LifeBuoy, Megaphone, MessagesSquare, Trash2, Users } from 'lucide-react'
import { demo, useDemo } from '../lib/demoStore.js'
import { D, clientesEnriquecidos, interaccionesEnriquecidas, inventarioConAlertas } from '../lib/metrics.js'
import { descargarCsv } from '../lib/csv.js'
import { Embudo, Respuesta, Resumen } from './Analitica.jsx'
import Bandeja, { PanelConversaciones } from './Bandeja.jsx'
import Clientes from './Clientes.jsx'
import { Campanas, Contingencia, Inventario, Pqr } from './Operacion.jsx'
import Pedidos from './Pedidos.jsx'
import WhatsAppSim from './WhatsAppSim.jsx'

function Escenario({ convId, setConvId }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[430px_1fr] items-start">
        <WhatsAppSim convId={convId} setConvId={setConvId} />
        <div className="grid gap-4">
          <div>
            <h2 className="text-xl">Lo que ve el asesor, en tiempo real</h2>
            <p className="text-sm text-muted mt-1 max-w-[62ch]">Escribe como cliente en el chat. El asistente atiende y, cuando tiene los datos y la autorización, crea el caso aquí. El asesor lo toma y responde en el mismo hilo.</p>
          </div>
          <PanelConversaciones convId={convId} setConvId={setConvId} compacto />
        </div>
      </div>
    </div>
  )
}

const SECCIONES = [
  { id: 'escenario', label: 'Chat y bandeja', Icon: MessagesSquare },
  { id: 'pedidos', label: 'Pedidos web', Icon: CreditCard },
  { id: 'resumen', label: 'Resumen', Icon: BarChart3 },
  { id: 'embudo', label: 'Cotizaciones', Icon: FileWarning },
  { id: 'respuesta', label: 'Tiempo de respuesta', Icon: Clock },
  { id: 'clientes', label: 'Clientes', Icon: Users },
  { id: 'bandeja', label: 'Atención', Icon: Inbox },
  { id: 'campanas', label: 'Campañas', Icon: Megaphone },
  { id: 'pqr', label: 'PQR', Icon: FileWarning },
  { id: 'inventario', label: 'Inventario', Icon: Boxes },
  { id: 'contingencia', label: 'Contingencia', Icon: LifeBuoy },
]

// Vista simulada por rol: es un filtro de presentación, no un sistema de permisos.
const ROLES = {
  gerencia: { label: 'Gerencia', ver: SECCIONES.map((s) => s.id) },
  coordinacion: { label: 'Coordinación comercial', ver: ['escenario', 'pedidos', 'resumen', 'embudo', 'respuesta', 'clientes', 'bandeja', 'campanas', 'pqr'] },
  asesor: { label: 'Asesor comercial', ver: ['escenario', 'pedidos', 'bandeja', 'clientes', 'embudo', 'pqr'] },
  bodega: { label: 'Bodega e inventario', ver: ['pedidos', 'inventario', 'pqr', 'contingencia'] },
  administracion: { label: 'Administración', ver: ['pedidos', 'resumen', 'clientes', 'pqr', 'contingencia'] },
}

const TITULOS = Object.fromEntries(SECCIONES.map((s) => [s.id, s.label]))

// Datos que exporta cada sección (los mismos que se ven en pantalla).
function datosExportables(seccion, conversaciones, pedidos) {
  const plano = (rows) => rows.map(({ ventas, cotizaciones, perdidas, interacciones, pqr, senales, patronTaller, ...r }) => ({
    ...r,
    n_ventas: ventas?.length, n_cotizaciones: cotizaciones?.length, n_pqr: pqr?.length,
    senales: senales?.join(' | '), patron_taller: patronTaller?.join(' | '),
  }))
  switch (seccion) {
    case 'pedidos': return { nombre: 'pedidos-web', filas: pedidos.map((p) => ({ id: p.id, creado_en: p.creadoEn, estado: p.estado, cliente: p.cliente.nombre, documento: `${p.cliente.tipoDoc} ${p.cliente.documento}`, celular: p.cliente.celular, correo: p.cliente.correo, ciudad: p.cliente.ciudad, direccion: p.cliente.direccion, metodo: p.metodo, total: p.total, items: p.items.map((i) => `${i.qty}x${i.sku}`).join(' ') })) }
    case 'resumen': return { nombre: 'ventas', filas: D.ventas }
    case 'embudo':
    case 'respuesta': return { nombre: 'cotizaciones', filas: D.cotizaciones }
    case 'clientes': return { nombre: 'clientes-con-alertas', filas: plano(clientesEnriquecidos()) }
    case 'bandeja': return { nombre: 'interacciones', filas: interaccionesEnriquecidas() }
    case 'campanas': return { nombre: 'campanas', filas: D.campanas }
    case 'pqr': return { nombre: 'pqr', filas: D.pqr }
    case 'inventario': return { nombre: 'inventario', filas: inventarioConAlertas() }
    case 'escenario':
      return { nombre: 'conversaciones-demo', filas: conversaciones.map((c) => ({ id: c.id, estado: c.estado, creado_en: c.creadoEn, fuera_de_horario: c.fueraDeHorario, nombre: c.caso?.nombre, vehiculo: c.caso?.vehiculo, referencias: c.caso?.referencias?.join(' '), resumen: c.caso?.resumen, mensajes: c.mensajes.length })) }
    default: return null
  }
}

export default function Demo() {
  const { pathname } = useLocation()
  const seccion = pathname.replace(/^\/demo\/?/, '').split('/')[0] || 'escenario'
  const [rol, setRol] = useState(() => localStorage.getItem('carsystem.rol') || 'gerencia')
  const [convId, setConvId] = useState(null)
  const { conversaciones, pedidos } = useDemo()
  const exportable = datosExportables(seccion, conversaciones, pedidos)
  useEffect(() => {
    localStorage.setItem('carsystem.rol', rol)
  }, [rol])
  useEffect(() => { document.title = `Demo · ${TITULOS[seccion] || 'CRM'} · CarSystem` }, [seccion])

  const visibles = SECCIONES.filter((s) => ROLES[rol].ver.includes(s.id))
  const permitido = ROLES[rol].ver.includes(seccion)

  const contenido = {
    escenario: <Escenario convId={convId} setConvId={setConvId} />,
    pedidos: <Pedidos />,
    resumen: <Resumen />,
    embudo: <Embudo />,
    respuesta: <Respuesta />,
    clientes: <Clientes />,
    bandeja: <Bandeja convId={convId} setConvId={setConvId} />,
    campanas: <Campanas />,
    pqr: <Pqr />,
    inventario: <Inventario />,
    contingencia: <Contingencia />,
  }[seccion]

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white border-b border-line sticky top-0 z-30">
        <div className="px-4 md:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="btn btn-sm btn-line"><ArrowLeft size={15} aria-hidden="true" /> Sitio</Link>
          <img src="/logo.png" alt="CarSystem" className="h-10 w-auto hidden sm:block" />
          <div className="hidden md:block leading-tight">
            <p className="font-display font-bold">Demo del sistema interno</p>
            <p className="text-xs text-muted">Datos reales jul–sep 2026 · casos nuevos solo en esta sesión</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="rol" className="text-xs font-semibold text-muted hidden sm:block">Vista de</label>
              <select id="rol" className="input !min-h-9 !py-1 !w-auto text-sm" value={rol} onChange={(e) => setRol(e.target.value)}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-sm btn-line" onClick={() => { if (confirm('¿Borrar las conversaciones y pedidos creados en esta demo?')) { demo.reiniciar(); setConvId(null) } }} title="Borrar los casos y pedidos creados en la demo">
              <Trash2 size={15} aria-hidden="true" /><span className="hidden lg:inline">Reiniciar demo</span>
            </button>
          </div>
        </div>
        <nav aria-label="Secciones del CRM" className="px-4 md:px-6 border-t border-line overflow-x-auto">
          <ul className="flex gap-1 min-w-max">
            {visibles.map(({ id, label, Icon }) => (
              <li key={id}>
                <NavLink to={`/demo/${id}`} className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${isActive || (id === 'escenario' && seccion === 'escenario') ? 'border-orange text-navy' : 'border-transparent text-muted hover:text-navy'}`}>
                  <Icon size={16} aria-hidden="true" />{label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="px-4 md:px-6 py-6 max-w-[1500px] mx-auto">
        <p className="text-xs text-muted mb-4">Vista simulada de <strong>{ROLES[rol].label}</strong>: es un filtro de presentación para la demo, no un sistema de permisos.</p>
        {!contenido ? (
          <p>Sección no encontrada. <Link className="link" to={`/demo/${visibles[0].id}`}>Ir a {visibles[0].label}</Link></p>
        ) : permitido ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h1 className="text-3xl">{TITULOS[seccion]}</h1>
              {exportable && (
                <button type="button" className="btn btn-sm btn-line" onClick={() => descargarCsv(exportable.nombre, exportable.filas)} disabled={!exportable.filas.length}>
                  <Download size={15} aria-hidden="true" /> Exportar a CSV
                </button>
              )}
            </div>
            {contenido}
          </>
        ) : (
          <div className="bg-white border border-line rounded-lg p-8 max-w-xl">
            <h1 className="text-2xl">Esta sección no está en la vista de {ROLES[rol].label}</h1>
            <p className="text-muted mt-2">Cambia de rol arriba o ve a una sección de tu vista.</p>
            <Link className="btn btn-dark mt-5" to={`/demo/${visibles[0].id}`}>Ir a {visibles[0].label}</Link>
          </div>
        )}
      </main>
    </div>
  )
}
