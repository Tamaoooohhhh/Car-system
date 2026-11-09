import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { enlaceWhatsApp } from '../lib/quote.jsx'
import { empresa } from '../config/empresa'

export function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p id={`${id}-err`} className="err" role="alert">{error}</p>}
    </div>
  )
}

export const inputProps = (id, error) => ({
  id,
  className: 'input',
  'aria-invalid': error ? 'true' : undefined,
  'aria-describedby': error ? `${id}-err` : undefined,
})

export function Consentimiento({ checked, onChange, error }) {
  return (
    <div>
      <label className="flex gap-3 items-start cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 size-5 accent-[#07325a]"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'consent-err' : undefined}
        />
        <span className="text-sm">
          Autorizo a {empresa.razonSocial} a tratar mis datos personales para atender esta solicitud, según la Ley 1581 de 2012.{' '}
          <Link to="/privacidad" className="link" target="_blank">Ver aviso de privacidad</Link>.
        </span>
      </label>
      {error && <p id="consent-err" className="err" role="alert">{error}</p>}
    </div>
  )
}

/** Valida el formulario y abre WhatsApp con la solicitud. */
export function Envio({ mensaje, onValidar, etiqueta = 'Enviar por WhatsApp' }) {
  const [listo, setListo] = useState(false)
  const url = enlaceWhatsApp(mensaje)

  const enviar = () => {
    if (!onValidar()) { setListo(false); return }
    setListo(true)
    if (url) window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={enviar}>
          <MessageCircle size={18} aria-hidden="true" /> {etiqueta}
        </button>
      </div>
      {!url && (
        <p className="text-sm text-orange-ink bg-orange-tint rounded-md px-3 py-2" role="status">
          El número de WhatsApp de CarSystem aún no está configurado. Puedes contactarnos por teléfono desde la sección de contacto.
        </p>
      )}
      {listo && url && <p className="text-sm text-ok" role="status">Abrimos WhatsApp con tu solicitud. Un asesor la confirmará en horario de atención.</p>}
      {listo && !url && <p className="text-sm text-ok" role="status">Tu solicitud está lista para enviar al asesor.</p>}
    </div>
  )
}
