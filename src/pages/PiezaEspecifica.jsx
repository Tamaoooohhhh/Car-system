import { useMemo, useState } from 'react'
import { Camera } from 'lucide-react'
import { mensajeCotizacion } from '../lib/quote.jsx'
import { Cabecera } from '../components/ui.jsx'
import { Consentimiento, Envio, Field, inputProps } from '../components/forms.jsx'
import { CamposCliente, validarDatos } from './Cotizacion.jsx'

const inicial = { nombre: '', tipo: '', marca: '', linea: '', anio: '', placa: '', notas: '', consentimiento: false }

export default function PiezaEspecifica() {
  const [datos, setDatos] = useState(inicial)
  const [pieza, setPieza] = useState('')
  const [errores, setErrores] = useState({})
  const set = (p) => setDatos((d) => ({ ...d, ...p }))

  const mensaje = useMemo(
    () =>
      mensajeCotizacion({
        items: [],
        datos: { ...datos, notas: [pieza && `Pieza que necesito: ${pieza}`, datos.notas].filter(Boolean).join('\n') },
        origen: '#WEB-PIEZA',
      }),
    [datos, pieza],
  )

  const validar = () => {
    const e = validarDatos(datos)
    if (!pieza.trim()) e.pieza = 'Describe la pieza o escribe su referencia.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  return (
    <>
      <Cabecera titulo="¿Necesitas un artículo en específico? Escríbenos">
        Somos distribuidores: si la pieza no está en el catálogo, un asesor la consulta con los proveedores. El precio, la disponibilidad y el plazo se confirman en la cotización; no se aseguran de antemano.
      </Cabecera>
      <div className="wrap py-10 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-6 self-start">
          <h2 className="text-2xl">Cómo ayudarnos a encontrarla</h2>
          <ul className="grid gap-4 text-muted">
            <li><strong className="text-ink">La referencia</strong>, si la conoces: está en la pieza o en el manual del vehículo.</li>
            <li><strong className="text-ink">El vehículo</strong>: marca, línea, año y, si puedes, la placa.</li>
            <li className="flex gap-3"><Camera size={20} className="shrink-0 mt-1 text-teal-ink" aria-hidden="true" /><span><strong className="text-ink">Una foto de la pieza.</strong> No se adjunta desde esta página: envíala en la conversación de WhatsApp con el asesor.</span></li>
          </ul>
        </div>
        <form className="grid gap-6 bg-paper border border-line rounded-xl p-6 md:p-8" onSubmit={(e) => e.preventDefault()} noValidate>
          <Field id="pieza" label="¿Qué pieza necesitas?" error={errores.pieza} hint="Nombre, referencia o descripción">
            <textarea {...inputProps('pieza', errores.pieza)} rows={3} value={pieza} onChange={(e) => setPieza(e.target.value)} />
          </Field>
          <CamposCliente datos={datos} set={set} errores={errores} notasLabel="Otros detalles (opcional)" />
          <Consentimiento checked={datos.consentimiento} onChange={(v) => set({ consentimiento: v })} error={errores.consentimiento} />
          <Envio mensaje={mensaje} onValidar={validar} etiqueta="Enviar mi solicitud por WhatsApp" />
        </form>
      </div>
    </>
  )
}
