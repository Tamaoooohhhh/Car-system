import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Minus, Plus, Trash2 } from 'lucide-react'
import { useQuote, mensajeCotizacion } from '../lib/quote.jsx'
import { porSku } from '../lib/catalog'
import { Cabecera, IconoCategoria } from '../components/ui.jsx'
import { Consentimiento, Envio, Field, inputProps } from '../components/forms.jsx'

export function validarDatos(d, { exigirVehiculo = true } = {}) {
  const e = {}
  if (!d.nombre.trim()) e.nombre = 'Escribe tu nombre para que el asesor sepa con quién hablar.'
  if (!d.tipo) e.tipo = 'Cuéntanos si eres taller o propietario de un vehículo.'
  if (exigirVehiculo && !d.marca.trim() && !d.placa.trim()) e.marca = 'Indica la marca y línea del vehículo o la placa.'
  if (!d.consentimiento) e.consentimiento = 'Necesitamos tu autorización para tratar tus datos y atender la solicitud.'
  return e
}

export function CamposCliente({ datos, set, errores, notasLabel = 'Notas para el asesor (opcional)' }) {
  return (
    <div className="grid gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="nombre" label="Nombre" error={errores.nombre}>
          <input {...inputProps('nombre', errores.nombre)} autoComplete="name" value={datos.nombre} onChange={(e) => set({ nombre: e.target.value })} />
        </Field>
        <Field id="tipo" label="Soy" error={errores.tipo}>
          <select {...inputProps('tipo', errores.tipo)} value={datos.tipo} onChange={(e) => set({ tipo: e.target.value })}>
            <option value="">Selecciona…</option>
            <option value="taller">Taller mecánico</option>
            <option value="particular">Propietario de un vehículo</option>
          </select>
        </Field>
      </div>
      <fieldset className="grid gap-5">
        <legend className="label">Vehículo</legend>
        <div className="grid sm:grid-cols-4 gap-4">
          <Field id="marca" label="Marca" error={errores.marca}>
            <input {...inputProps('marca', errores.marca)} placeholder="Renault" value={datos.marca} onChange={(e) => set({ marca: e.target.value })} />
          </Field>
          <Field id="linea" label="Línea">
            <input {...inputProps('linea')} placeholder="Sandero" value={datos.linea} onChange={(e) => set({ linea: e.target.value })} />
          </Field>
          <Field id="anio" label="Año">
            <input {...inputProps('anio')} inputMode="numeric" maxLength={4} placeholder="2016" value={datos.anio} onChange={(e) => set({ anio: e.target.value.replace(/\D/g, '') })} />
          </Field>
          <Field id="placa" label="Placa (opcional)">
            <input {...inputProps('placa')} maxLength={7} value={datos.placa} onChange={(e) => set({ placa: e.target.value.toUpperCase() })} />
          </Field>
        </div>
      </fieldset>
      <Field id="notas" label={notasLabel}>
        <textarea {...inputProps('notas')} rows={3} value={datos.notas} onChange={(e) => set({ notas: e.target.value })} />
      </Field>
    </div>
  )
}

export default function Cotizacion() {
  const q = useQuote()
  const [errores, setErrores] = useState({})
  const { items, datos } = q

  const origen = items.length === 1 ? `#WEB-${items[0].sku.replace('-', '')}` : '#WEB-LISTA'
  const mensaje = useMemo(() => mensajeCotizacion({ items, datos, origen }), [items, datos, origen])

  const validar = () => {
    const e = validarDatos(datos)
    if (items.length === 0 && !datos.notas.trim()) e.items = 'Agrega al menos una referencia o describe en las notas lo que necesitas.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  return (
    <>
      <Cabecera titulo="Mi cotización">
        Revisa tu lista y envíala a un asesor. Él confirma compatibilidad, precio, disponibilidad y plazo de entrega.
      </Cabecera>
      <div className="wrap py-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-2xl">Referencias</h2>
          {items.length === 0 ? (
            <div className="mt-4 border border-dashed border-[#9db0c0] rounded-lg p-8 text-center">
              <p className="font-medium">Tu lista está vacía.</p>
              <p className="text-sm text-muted mt-1">Agrega referencias desde el catálogo o describe en las notas lo que necesitas.</p>
              <Link to="/catalogo" className="btn btn-dark mt-5">Ir al catálogo</Link>
            </div>
          ) : (
            <ul className="mt-4 border-t border-navy">
              {items.map((i) => {
                const p = porSku(i.sku)
                return (
                  <li key={i.sku} className="flex flex-wrap items-center gap-4 py-4 border-b border-line">
                    <span className="grid place-items-center size-10 rounded-md bg-teal-tint text-teal-ink"><IconoCategoria categoria={p.categoria} size={20} /></span>
                    <div className="grow min-w-[12rem]">
                      <Link to={`/catalogo/${p.sku}`} className="font-semibold hover:underline">{p.producto}</Link>
                      <p className="text-xs text-muted mono">{p.sku} · {p.referencia}</p>
                    </div>
                    <div className="flex items-center border border-[#9db0c0] rounded-md" role="group" aria-label={`Cantidad de ${p.producto}`}>
                      <button type="button" className="size-10 grid place-items-center hover:bg-paper rounded-l-md" onClick={() => q.cantidad(i.sku, i.qty - 1)} aria-label="Quitar una unidad"><Minus size={16} aria-hidden="true" /></button>
                      <span className="w-10 text-center mono" aria-live="polite">{i.qty}</span>
                      <button type="button" className="size-10 grid place-items-center hover:bg-paper rounded-r-md" onClick={() => q.cantidad(i.sku, i.qty + 1)} aria-label="Agregar una unidad"><Plus size={16} aria-hidden="true" /></button>
                    </div>
                    <button type="button" className="btn btn-sm btn-line" onClick={() => q.quitar(i.sku)} aria-label={`Quitar ${p.producto}`}><Trash2 size={15} aria-hidden="true" /></button>
                  </li>
                )
              })}
            </ul>
          )}
          {errores.items && <p className="err" role="alert">{errores.items}</p>}
          <p className="mt-4 text-sm text-muted">¿Falta algo? <Link to="/pieza-especifica" className="link">Pide una pieza específica</Link>.</p>
        </div>

        <form className="grid gap-6 bg-paper border border-line rounded-xl p-6 md:p-8 self-start" onSubmit={(e) => e.preventDefault()} noValidate>
          <h2 className="text-2xl">Tus datos</h2>
          <CamposCliente datos={datos} set={q.datosSet} errores={errores} />
          <Consentimiento checked={datos.consentimiento} onChange={(v) => q.datosSet({ consentimiento: v })} error={errores.consentimiento} />
          <div>
            <p className="label">Mensaje que se enviará</p>
            <pre className="text-xs bg-white border border-line rounded-md p-3 whitespace-pre-wrap font-sans max-h-52 overflow-auto" aria-label="Vista previa del mensaje">{mensaje}</pre>
            <p className="text-xs text-muted mt-1">El código <span className="mono">{origen}</span> le dice a CarSystem que viniste de la web.</p>
          </div>
          <Envio mensaje={mensaje} onValidar={validar} />
          {items.length > 0 && (
            <div className="border-t border-line pt-5">
              <p className="text-sm text-muted mb-3">¿Ya sabes lo que necesitas? Paga en línea sin esperar la cotización.</p>
              <Link to="/pago" className="btn btn-dark"><CreditCard size={18} aria-hidden="true" /> Pagar en línea</Link>
            </div>
          )}
        </form>
      </div>
    </>
  )
}
