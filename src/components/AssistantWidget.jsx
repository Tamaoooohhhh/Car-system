import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Send, X } from 'lucide-react'
import { apiUrl } from '../lib/api.js'

const SALUDO =
  'Hola, soy el asistente virtual de CarSystem. Puedo orientarte sobre nuestros repuestos, compatibilidad y cómo cotizar. La disponibilidad está registrada en el inventario; el precio y el plazo de entrega se informan en la cotización. ¿Qué repuesto buscas?'

const SUGERENCIAS = [
  '¿Cómo solicito una cotización?',
  '¿Cuál es el horario?',
  '¿Buscan una pieza que no aparece en el catálogo?',
]

export default function AssistantWidget() {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const fin = useRef(null)
  const historial = mensajes.map(({ role, content }) => ({ role, content }))

  async function enviar(valor = texto) {
    const pregunta = valor.trim()
    if (!pregunta || cargando) return

    const siguiente = [...historial, { role: 'user', content: pregunta }]
    setTexto('')
    setMensajes([...siguiente, { role: 'assistant', content: '' }])
    setCargando(true)
    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: siguiente, mode: 'public' }),
      })
      if (!response.ok) throw new Error(`Chat API respondió ${response.status}`)
      const data = await response.json()
      if (typeof data.text !== 'string') throw new Error('El chat devolvió una respuesta inválida')
      setMensajes([...siguiente, { role: 'assistant', content: data.text }])
    } catch (error) {
      console.error('[assistant]', error)
      setMensajes([
        ...siguiente,
        {
          role: 'assistant',
          content: 'No pude responder en este momento. Puedes continuar en la página de cotización o contactarnos por los canales de atención.',
        },
      ])
    } finally {
      setCargando(false)
      requestAnimationFrame(() => fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }))
    }
  }

  return (
    <aside className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <section className="w-[min(92vw,380px)] h-[min(70vh,560px)] flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-xl" aria-label="Asistente virtual de CarSystem">
          <header className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
            <img src="/logo.png" alt="" className="size-9 rounded-full bg-white object-contain p-1" />
            <div className="grow">
              <p className="font-semibold">Asistente CarSystem</p>
              <p className="text-xs text-white/80">Orientación sobre repuestos y cotizaciones</p>
            </div>
            <button type="button" className="btn btn-sm btn-ghost-light !px-2" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="grow overflow-y-auto space-y-3 bg-[#e8edf1] px-3 py-4" role="log" aria-live="polite" aria-label="Conversación con el asistente">
            <Burbuja texto={SALUDO} />
            {mensajes.map((m, i) => <Burbuja key={`${i}-${m.role}`} cliente={m.role === 'user'} texto={m.content || (cargando ? 'Escribiendo…' : '')} />)}
            <div ref={fin} />
          </div>

          {mensajes.length === 0 && (
            <div className="flex flex-wrap gap-2 border-t border-line bg-white px-3 py-2" aria-label="Preguntas sugeridas">
              {SUGERENCIAS.map((s) => (
                <button key={s} type="button" className="chip chip-info cursor-pointer !px-2.5 !py-1.5 hover:bg-teal hover:text-white" onClick={() => enviar(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="flex items-center gap-2 border-t border-line bg-white p-3" onSubmit={(event) => { event.preventDefault(); enviar() }}>
            <label htmlFor="assistant-message" className="sr-only">Escribe una pregunta</label>
            <input id="assistant-message" className="input" placeholder="Escribe una pregunta…" value={texto} onChange={(event) => setTexto(event.target.value)} autoComplete="off" maxLength={600} />
            <button type="submit" className="btn btn-dark !px-3" disabled={!texto.trim() || cargando} aria-label="Enviar mensaje">
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
          <Link to="/cotizacion" className="link border-t border-line bg-white px-3 py-2 text-center text-xs">
            Continuar con una cotización
          </Link>
        </section>
      )}
      <button type="button" className="btn btn-dark min-h-12 rounded-full px-5 shadow-lg" aria-expanded={abierto} onClick={() => setAbierto((value) => !value)}>
        {abierto ? <X size={19} aria-hidden="true" /> : <MessageCircle size={19} aria-hidden="true" />}
        <span>{abierto ? 'Cerrar' : '¿Te ayudamos?'}</span>
      </button>
    </aside>
  )
}

function Burbuja({ cliente = false, texto }) {
  if (!texto) return null
  return (
    <div className={`flex ${cliente ? 'justify-end' : ''}`}>
      <p className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-3.5 py-2 text-sm ${cliente ? 'rounded-tr-none bg-[#cdeaf2]' : 'rounded-tl-none bg-white'}`}>
        {texto}
      </p>
    </div>
  )
}
