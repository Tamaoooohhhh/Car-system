import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, RotateCcw } from 'lucide-react'
import { demo, useDemo } from '../lib/demoStore.js'
import { estadoAtencion, fechaDeReloj, RELOJES } from '../lib/horario.js'

const SALUDO =
  'Hola, soy el asistente virtual de CarSystem. Puedo orientarte con las referencias del catálogo, el horario y cómo cotizar. Los precios, la disponibilidad y los plazos los confirma un asesor en la cotización. ¿En qué te ayudo?'

const SUGERENCIAS = [
  '¿Tienen pastillas de freno para un Mazda 3 2016?',
  'Quiero cotizar un kit de distribución',
  '¿Cuánto cuesta una batería?',
  '¿Cuál es el horario?',
  'Necesito una pieza que no veo en el catálogo',
  'Quiero hablar con un asesor',
]

const FALLBACK =
  'No pudimos responder automáticamente en este momento. Tu mensaje quedó guardado y un asesor lo atenderá. También puedes llamarnos o visitarnos en Guayabal: el teléfono y el mostrador siguen disponibles.'

const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

export default function WhatsAppSim({ convId, setConvId }) {
  const { conversaciones } = useDemo()
  const conv = conversaciones.find((c) => c.id === convId) || null
  const [reloj, setReloj] = useState('real')
  const [texto, setTexto] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const fin = useRef(null)

  const fecha = useMemo(() => fechaDeReloj(reloj), [reloj])
  const atencion = estadoAtencion(fecha)
  const relojLabel = RELOJES.find((r) => r.id === reloj)?.label

  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [conv?.mensajes.length, escribiendo])

  async function enviar(t) {
    const msg = (t ?? texto).trim()
    if (!msg || escribiendo) return
    setTexto('')
    let id = convId
    if (!id || !conversaciones.some((c) => c.id === id)) {
      id = demo.nuevaConversacion({ fueraDeHorario: !atencion.abierto, relojLabel })
      setConvId(id)
    }
    demo.mensaje(id, 'cliente', msg)
    if (demo.obtener(id)?.tomadaPorAsesor) return // el asesor responde desde el CRM
    if (/asesor|persona|humano|alguien/i.test(msg)) demo.pedirAsesor(id)

    setEscribiendo(true)
    try {
      const historial = (demo.obtener(id)?.mensajes || [])
        .filter((m) => m.de === 'cliente' || m.de === 'bot')
        .map((m) => ({ role: m.de === 'cliente' ? 'user' : 'assistant', content: m.texto }))
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: historial, clockISO: fecha.toISOString() }),
      })
      if (!r.ok) throw new Error(String(r.status))
      const data = await r.json()
      demo.mensaje(id, 'bot', data.text)
      if (data.caso) demo.registrarCaso(id, data.caso)
      if (data.derivar) demo.derivar(id, data.derivar)
    } catch {
      demo.mensaje(id, 'bot', FALLBACK)
      demo.marcarManual(id)
    } finally {
      setEscribiendo(false)
    }
  }

  const reiniciar = () => { setConvId(null); setTexto('') }
  const mensajes = conv?.mensajes || []
  const conAsesor = conv?.tomadaPorAsesor

  return (
    <section className="flex flex-col bg-white border border-line rounded-xl overflow-hidden h-[640px]" aria-label="Simulador de WhatsApp de CarSystem">
      <header className="bg-navy text-white px-4 py-3 flex items-center gap-3">
        <img src="/logo.png" alt="" className="size-10 rounded-full bg-white object-contain p-1" />
        <div className="grow min-w-0">
          <p className="font-semibold leading-tight">CarSystem</p>
          <p className="text-xs text-white/80">{conAsesor ? 'Atiende un asesor' : 'Asistente virtual · prototipo'}</p>
        </div>
        <button type="button" onClick={reiniciar} className="btn btn-sm btn-ghost-light" title="Empezar una conversación nueva">
          <RotateCcw size={15} aria-hidden="true" /> Nueva
        </button>
      </header>

      <div className="px-4 py-2 bg-paper border-b border-line flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <label htmlFor="reloj" className="font-semibold">Reloj de la demo</label>
        <select id="reloj" value={reloj} onChange={(e) => setReloj(e.target.value)} className="input !min-h-8 !py-1 !w-auto text-xs">
          {RELOJES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <span className={`chip ${atencion.abierto ? 'chip-ok' : 'chip-warn'}`}>{atencion.abierto ? 'Dentro de horario' : 'Fuera de horario'}</span>
      </div>

      <div className="grow overflow-y-auto px-4 py-4 bg-[#e8edf1] space-y-3" role="log" aria-live="polite" aria-label="Conversación">
        <Burbuja de="bot" texto={SALUDO} />
        {mensajes.map((m) => <Burbuja key={m.id} de={m.de} texto={m.texto} ts={m.ts} />)}
        {escribiendo && (
          <div className="flex"><div className="bg-white rounded-lg rounded-tl-none px-4 py-3 flex gap-1" aria-label="El asistente está escribiendo"><span className="dot" /><span className="dot" /><span className="dot" /></div></div>
        )}
        <div ref={fin} />
      </div>

      {mensajes.length === 0 && (
        <div className="px-3 py-2 border-t border-line bg-white flex flex-wrap gap-2 max-h-[104px] overflow-y-auto" aria-label="Mensajes sugeridos">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" className="chip chip-info !py-1.5 !px-3 cursor-pointer hover:bg-teal hover:text-white transition-colors" onClick={() => enviar(s)}>{s}</button>
          ))}
        </div>
      )}

      <form className="flex items-center gap-2 p-3 border-t border-line bg-white" onSubmit={(e) => { e.preventDefault(); enviar() }}>
        <label htmlFor="msg" className="sr-only">Escribe un mensaje</label>
        <input id="msg" className="input" placeholder={conAsesor ? 'Escríbele al asesor…' : 'Escribe un mensaje…'} value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" maxLength={600} />
        <button type="submit" className="btn btn-dark !px-3" disabled={!texto.trim() || escribiendo} aria-label="Enviar mensaje"><Send size={18} aria-hidden="true" /></button>
      </form>
    </section>
  )
}

function Burbuja({ de, texto, ts }) {
  const cliente = de === 'cliente'
  const asesor = de === 'asesor'
  return (
    <div className={`flex ${cliente ? 'justify-end' : ''}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2 text-[0.92rem] whitespace-pre-wrap rounded-lg ${
          cliente ? 'bg-[#cdeaf2] rounded-tr-none' : asesor ? 'bg-orange-tint border border-orange/40 rounded-tl-none' : 'bg-white rounded-tl-none'
        }`}
      >
        {asesor && <p className="text-xs font-bold text-orange-ink mb-0.5">Asesor (demo)</p>}
        {texto}
        {ts && <p className="text-[0.68rem] text-muted text-right mt-1 num">{hora(ts)}</p>}
      </div>
    </div>
  )
}
