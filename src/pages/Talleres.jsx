import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cabecera } from '../components/ui.jsx'
import { Consentimiento, Envio, Field, inputProps } from '../components/forms.jsx'

const inicial = { taller: '', contacto: '', ciudad: '', especialidad: '', consentimiento: false }

const CONDICIONES = [
  { t: 'Un asesor para tu taller', d: 'Conoce tu historial y tus referencias habituales. Tu trato sigue siendo con una persona, no con un formulario.' },
  { t: 'Crédito para talleres con historial', d: 'Las condiciones de crédito las define la gerencia según el historial de compra del taller.' },
  { t: 'Descuentos por volumen', d: 'Los autoriza la coordinación comercial. Se confirman en cada cotización, no se publican.' },
  { t: 'Cotización con plazo confirmado', d: 'La cotización indica disponibilidad y plazo. Las rutas de entrega salen a las 10:00 a. m. y a las 3:00 p. m.; el plazo de cada pedido se confirma al cotizar.' },
]

export default function Talleres() {
  const [d, setD] = useState(inicial)
  const [errores, setErrores] = useState({})
  const set = (p) => setD((x) => ({ ...x, ...p }))

  const mensaje = useMemo(
    () =>
      [
        'Hola, quiero registrar mi taller como cliente de CarSystem.',
        '',
        d.taller && `Taller: ${d.taller}`,
        d.contacto && `Persona de contacto: ${d.contacto}`,
        d.ciudad && `Ciudad: ${d.ciudad}`,
        d.especialidad && `Especialidad: ${d.especialidad}`,
        d.consentimiento && 'Autorizo el tratamiento de mis datos personales para atender esta solicitud.',
        '',
        'Origen: #WEB-TALLER',
      ]
        .filter((x) => typeof x === 'string')
        .join('\n'),
    [d],
  )

  const validar = () => {
    const e = {}
    if (!d.taller.trim()) e.taller = 'Escribe el nombre del taller.'
    if (!d.contacto.trim()) e.contacto = 'Escribe quién será la persona de contacto.'
    if (!d.ciudad.trim()) e.ciudad = 'Indica el municipio del taller.'
    if (!d.consentimiento) e.consentimiento = 'Necesitamos tu autorización para tratar tus datos.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  return (
    <>
      <Cabecera titulo="Para talleres mecánicos">
        Compra recurrente, varias unidades y la pieza correcta a tiempo. Así trabajamos con los talleres del área metropolitana.
      </Cabecera>
      <div className="wrap py-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-2xl">Condiciones</h2>
          <ul className="mt-4 border-t border-navy">
            {CONDICIONES.map((c) => (
              <li key={c.t} className="py-5 border-b border-line">
                <h3 className="text-lg">{c.t}</h3>
                <p className="mt-1 text-muted max-w-[60ch]">{c.d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">Mientras tanto, puedes <Link to="/catalogo" className="link">armar tu lista de cotización</Link> con las referencias que más usas.</p>
        </div>
        <form className="grid gap-5 bg-paper border border-line rounded-xl p-6 md:p-8 self-start" onSubmit={(e) => e.preventDefault()} noValidate>
          <h2 className="text-2xl">Registra tu taller</h2>
          <Field id="taller" label="Nombre del taller" error={errores.taller}>
            <input {...inputProps('taller', errores.taller)} value={d.taller} onChange={(e) => set({ taller: e.target.value })} />
          </Field>
          <Field id="contacto" label="Persona de contacto" error={errores.contacto}>
            <input {...inputProps('contacto', errores.contacto)} autoComplete="name" value={d.contacto} onChange={(e) => set({ contacto: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="ciudad" label="Municipio" error={errores.ciudad}>
              <input {...inputProps('ciudad', errores.ciudad)} value={d.ciudad} onChange={(e) => set({ ciudad: e.target.value })} />
            </Field>
            <Field id="especialidad" label="Especialidad (opcional)">
              <input {...inputProps('especialidad')} value={d.especialidad} onChange={(e) => set({ especialidad: e.target.value })} />
            </Field>
          </div>
          <Consentimiento checked={d.consentimiento} onChange={(v) => set({ consentimiento: v })} error={errores.consentimiento} />
          <Envio mensaje={mensaje} onValidar={validar} etiqueta="Enviar solicitud por WhatsApp" />
        </form>
      </div>
    </>
  )
}
