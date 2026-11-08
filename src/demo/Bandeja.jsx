import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HandHelping, Send, X } from 'lucide-react'
import { demo, useDemo } from '../lib/demoStore.js'
import { interaccionesEnriquecidas } from '../lib/metrics.js'
import { fecha, minutosLegibles } from '../lib/format.js'
import { porSku } from '../lib/catalog.js'
import { Estado, Panel, Vacio } from './parts.jsx'

const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

const CHIP_ESTADO = {
  'Conversando con el bot': 'chip-info',
  'Caso registrado': 'chip-ok',
  'Pendiente de asesor': 'chip-warn',
  'Atención manual': 'chip-bad',
  'Tomada por asesor': 'chip-ok',
  Cerrada: 'chip-neutral',
}

const MOTIVOS = {
  garantia_reclamo: 'Garantía o reclamo',
  asesoria_especifica: 'Asesoría técnica específica',
  negociacion: 'Negociación o descuento',
  pieza_fuera_de_catalogo: 'Pieza fuera del catálogo',
  cliente_lo_pide: 'El cliente pidió un asesor',
  taller_identificado: 'Taller identificado',
  otro: 'Otro motivo',
}

export function nombreConv(c) {
  return c.caso?.nombre || 'Cliente sin identificar'
}

export function PanelConversaciones({ convId, setConvId, compacto }) {
  const { conversaciones } = useDemo()
  const conv = conversaciones.find((c) => c.id === convId) || null
  return (
    <div className={`grid gap-4 ${compacto ? '' : 'lg:grid-cols-[320px_1fr]'}`}>
      <div className="bg-white border border-line rounded-lg overflow-hidden self-start">
        <p className="px-4 py-3 text-sm font-bold border-b border-line flex items-center justify-between">
          <span>Creadas en esta demo</span>
          <span className="chip chip-neutral num">{conversaciones.length}</span>
        </p>
        {conversaciones.length === 0 ? (
          <div className="p-5"><Vacio>Escribe en el chat. La conversación aparecerá aquí con los datos que capture el bot.</Vacio></div>
        ) : (
          <ul className="max-h-[420px] overflow-auto">
            {conversaciones.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setConvId(c.id)}
                  aria-current={c.id === convId}
                  className={`w-full text-left px-4 py-3 border-b border-line hover:bg-paper transition-colors ${c.id === convId ? 'bg-teal-tint' : ''}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{nombreConv(c)}</span>
                    <span className="text-xs text-muted num">{hora(c.creadoEn)}</span>
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <span className={`chip ${CHIP_ESTADO[c.estado] || 'chip-neutral'}`}>{c.estado}</span>
                    {c.fueraDeHorario && <span className="chip chip-warn">Fuera de horario</span>}
                  </span>
                  <span className="block text-xs text-muted truncate mt-1">{c.mensajes.at(-1)?.texto ?? 'Sin mensajes'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <DetalleConversacion conv={conv} onCerrado={() => setConvId(null)} />
    </div>
  )
}

function DetalleConversacion({ conv }) {
  const [texto, setTexto] = useState('')
  if (!conv) return <div className="bg-white border border-line rounded-lg p-6 self-start"><Vacio>Selecciona una conversación para ver el caso, tomarla y responder.</Vacio></div>
  const c = conv.caso
  const enviar = (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    demo.mensaje(conv.id, 'asesor', texto.trim())
    setTexto('')
  }
  return (
    <div className="bg-white border border-line rounded-lg overflow-hidden">
      <header className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display font-bold text-lg leading-tight">{nombreConv(conv)}</p>
          <p className="text-xs text-muted mono">{conv.id} · Creado en esta demo</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`chip ${CHIP_ESTADO[conv.estado] || 'chip-neutral'}`}>{conv.estado}</span>
          {!conv.tomadaPorAsesor && conv.estado !== 'Cerrada' && (
            <button type="button" className="btn btn-sm btn-primary" onClick={() => demo.tomar(conv.id)}><HandHelping size={16} aria-hidden="true" /> Tomar conversación</button>
          )}
          {conv.estado !== 'Cerrada' && <button type="button" className="btn btn-sm btn-line" onClick={() => demo.cerrar(conv.id)}><X size={15} aria-hidden="true" /> Cerrar</button>}
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr_1.1fr]">
        <div className="p-5 border-b md:border-b-0 md:border-r border-line text-sm grid gap-3 content-start">
          <h3 className="text-sm font-bold">Datos capturados por el bot</h3>
          {c ? (
            <dl className="grid gap-2">
              <Fila k="Nombre" v={c.nombre} />
              <Fila k="Tipo" v={{ taller: 'Taller', particular: 'Propietario', no_indicado: 'Sin indicar' }[c.tipoCliente]} />
              <Fila k="Vehículo" v={c.vehiculo} />
              {c.placa && <Fila k="Placa" v={c.placa} />}
              <Fila k="Referencias" v={c.referencias.length ? c.referencias.map((s) => `${s} · ${porSku(s)?.producto}`).join('; ') : 'ninguna indicada'} />
              {c.piezaFueraCatalogo && <Fila k="Pieza fuera del catálogo" v={c.piezaFueraCatalogo} />}
              <Fila k="Resumen" v={c.resumen} />
              <Fila k="Autorización de datos" v="Sí, dada en el chat" ok />
            </dl>
          ) : (
            <p className="text-muted">Aún no hay caso registrado: el bot sigue recogiendo datos y el consentimiento.</p>
          )}
          {conv.derivacion && (
            <p className="chip chip-warn !whitespace-normal !rounded-md !py-2">Derivada: {MOTIVOS[conv.derivacion.motivo] || conv.derivacion.motivo}. {conv.derivacion.resumen}</p>
          )}
          {conv.fueraDeHorario && <p className="text-xs text-orange-ink">Llegó fuera de horario ({conv.relojLabel || 'reloj de la demo'}). Contactar al reabrir.</p>}
          {conv.atencionManual && <p className="text-xs text-bad font-semibold">El asistente falló: atender manualmente.</p>}
        </div>

        <div className="flex flex-col">
          <div className="p-5 grid gap-2 max-h-[340px] overflow-auto bg-paper grow" role="log" aria-label="Conversación del cliente">
            {conv.mensajes.map((m) => (
              <div key={m.id} className={`text-sm rounded-md px-3 py-2 max-w-[92%] whitespace-pre-wrap ${m.de === 'cliente' ? 'bg-[#cdeaf2] justify-self-start' : m.de === 'asesor' ? 'bg-orange-tint border border-orange/40 justify-self-end' : 'bg-white border border-line justify-self-end'}`}>
                <span className="block text-[0.68rem] font-bold text-muted uppercase tracking-wide">{m.de === 'cliente' ? 'Cliente' : m.de === 'asesor' ? 'Asesor (demo)' : 'Asistente'} · {hora(m.ts)}</span>
                {m.texto}
              </div>
            ))}
          </div>
          {conv.tomadaPorAsesor && conv.estado !== 'Cerrada' ? (
            <form onSubmit={enviar} className="flex gap-2 p-3 border-t border-line">
              <label htmlFor="resp" className="sr-only">Respuesta del asesor</label>
              <input id="resp" className="input" placeholder="Responder al cliente…" value={texto} onChange={(e) => setTexto(e.target.value)} />
              <button className="btn btn-dark !px-3" aria-label="Enviar respuesta" disabled={!texto.trim()}><Send size={18} aria-hidden="true" /></button>
            </form>
          ) : (
            <p className="px-4 py-3 border-t border-line text-xs text-muted">{conv.estado === 'Cerrada' ? 'Conversación cerrada.' : 'Toma la conversación para responder desde aquí. Mientras tanto, el asistente sigue atendiendo.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const Fila = ({ k, v, ok }) => (
  <div className="grid grid-cols-[9.5rem_1fr] gap-2">
    <dt className="text-muted">{k}</dt>
    <dd className={ok ? 'text-ok font-semibold' : 'font-medium'}>{v || 'sin dato'}</dd>
  </div>
)

// ---------- Sección completa: demo + interacciones reales ----------
export default function Bandeja({ convId, setConvId }) {
  const todas = useMemo(() => interaccionesEnriquecidas(), [])
  const [f, setF] = useState({ canal: '', resultado: '', soloSinRespuesta: false, soloFuera: false, q: '' })
  const [pagina, setPagina] = useState(0)
  const canales = [...new Set(todas.map((i) => i.canal))].sort()
  const resultados = [...new Set(todas.map((i) => i.resultado))].sort()

  const filas = todas.filter(
    (i) =>
      (!f.canal || i.canal === f.canal) &&
      (!f.resultado || i.resultado === f.resultado) &&
      (!f.soloSinRespuesta || i.sinRespuesta) &&
      (!f.soloFuera || i.fueraHorario) &&
      (!f.q || [i.interaccion_id, i.clienteNombre, i.motivo, i.sku_consultado, i.campana_id].join(' ').toLowerCase().includes(f.q.toLowerCase())),
  )
  const POR = 40
  const paginas = Math.max(1, Math.ceil(filas.length / POR))
  const vista = filas.slice(pagina * POR, pagina * POR + POR)
  const set = (p) => { setF({ ...f, ...p }); setPagina(0) }

  const sinResp = todas.filter((i) => i.sinRespuesta).length
  const fuera = todas.filter((i) => i.fueraHorario).length
  const sinCliente = todas.filter((i) => !i.cliente_id).length

  return (
    <div className="grid gap-6">
      <PanelConversaciones convId={convId} setConvId={setConvId} />
      <Panel
        titulo={`Interacciones reales (${todas.length})`}
        fuente="interacciones.csv"
        nota={`${sinResp} sin respuesta o llamada no contestada · ${fuera} fuera del horario de atención · ${sinCliente} sin cliente identificado. Julio a septiembre de 2026.`}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div className="lg:col-span-2"><label className="label" htmlFor="b-q">Buscar</label><input id="b-q" className="input" placeholder="Cliente, motivo, SKU, campaña…" value={f.q} onChange={(e) => set({ q: e.target.value })} /></div>
          <div><label className="label" htmlFor="b-canal">Canal</label><select id="b-canal" className="input" value={f.canal} onChange={(e) => set({ canal: e.target.value })}><option value="">Todos</option>{canales.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label" htmlFor="b-res">Resultado</label><select id="b-res" className="input" value={f.resultado} onChange={(e) => set({ resultado: e.target.value })}><option value="">Todos</option>{resultados.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="grid gap-1 content-end text-sm">
            <label className="flex gap-2 items-center"><input type="checkbox" className="size-4 accent-[#07325a]" checked={f.soloSinRespuesta} onChange={(e) => set({ soloSinRespuesta: e.target.checked })} /> Solo sin respuesta</label>
            <label className="flex gap-2 items-center"><input type="checkbox" className="size-4 accent-[#07325a]" checked={f.soloFuera} onChange={(e) => set({ soloFuera: e.target.checked })} /> Solo fuera de horario</label>
          </div>
        </div>
        <div className="overflow-auto max-h-[560px] border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th>ID</th><th>Fecha</th><th>Hora</th><th>Canal</th><th>Cliente</th><th>Origen</th><th>Asesor</th><th>Motivo</th><th className="r">1.ª respuesta</th><th>Resultado</th></tr></thead>
            <tbody>
              {vista.map((i) => (
                <tr key={i.interaccion_id}>
                  <td className="mono text-xs">{i.interaccion_id}</td>
                  <td className="whitespace-nowrap">{fecha(i.fecha)}</td>
                  <td className="num">{i.hora_entrada}{i.fueraHorario && <span className="chip chip-warn ml-1">fuera</span>}</td>
                  <td>{i.canal}</td>
                  <td>{i.clienteNombre ?? <span className="text-muted">sin dato</span>}</td>
                  <td>{i.origen_contacto}{i.campana_id && <span className="mono text-xs text-muted"> · {i.campana_id}</span>}</td>
                  <td className="mono">{i.asesor_id ?? <span className="text-bad">sin asesor</span>}</td>
                  <td>{i.motivo}</td>
                  <td className="r">{i.minutos_primera_respuesta == null ? <span className="text-bad">sin dato</span> : minutosLegibles(i.minutos_primera_respuesta)}</td>
                  <td>{i.sinRespuesta ? <span className="chip chip-bad">{i.resultado}</span> : i.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-muted num">{filas.length} resultados · página {pagina + 1} de {paginas}</span>
          <span className="flex gap-2">
            <button type="button" className="btn btn-sm btn-line" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</button>
            <button type="button" className="btn btn-sm btn-line" disabled={pagina >= paginas - 1} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
          </span>
        </div>
        <p className="text-xs text-muted mt-3">El tiempo de primera respuesta viene de la columna <span className="mono">minutos_primera_respuesta</span>. Las celdas vacías se muestran como "sin dato". <Link to="/demo/clientes" className="link">Ver clientes</Link></p>
      </Panel>
    </div>
  )
}
