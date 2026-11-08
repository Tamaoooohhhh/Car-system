import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Landmark, Loader2, Lock, MessageCircle, ShieldAlert } from 'lucide-react'
import { useQuote } from '../lib/quote.jsx'
import { porSku } from '../lib/catalog'
import { demo, useDemo } from '../lib/demoStore.js'
import { cop } from '../lib/format.js'
import precios from '../data/precios.json'
import { Cabecera } from '../components/ui.jsx'
import { Consentimiento, Field, inputProps } from '../components/forms.jsx'

const BANCOS = ['Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia', 'Banco de Occidente', 'Banco Popular', 'Banco AV Villas', 'Nequi', 'Otro banco']
const SOLO_DIGITOS = (v, max) => v.replace(/\D/g, '').slice(0, max)
const agrupar = (v) => v.replace(/(\d{4})(?=\d)/g, '$1 ')

const FORM_VACIO = {
  nombre: '', tipoDoc: 'CC', documento: '', correo: '', celular: '', ciudad: '', direccion: '', notas: '',
  metodo: 'tarjeta',
  tarjeta: '', vence: '', cvv: '', titular: '',
  banco: '', personaPse: 'natural',
  consentimiento: false,
}

function validar(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'Escribe tu nombre completo o la razón social.'
  if (f.documento.length < 5) e.documento = 'Escribe el número de documento o NIT.'
  if (!/^\S+@\S+\.\S+$/.test(f.correo)) e.correo = 'Escribe un correo válido para enviarte el comprobante.'
  if (f.celular.length !== 10) e.celular = 'Escribe un celular de 10 dígitos, sin espacios.'
  if (!f.ciudad.trim()) e.ciudad = 'Indica la ciudad.'
  if (!f.direccion.trim()) e.direccion = 'Indica la dirección de entrega.'
  if (f.metodo === 'tarjeta') {
    if (f.tarjeta.length < 15) e.tarjeta = 'El número de tarjeta tiene 15 o 16 dígitos.'
    if (!/^(0[1-9]|1[0-2])\d{2}$/.test(f.vence)) e.vence = 'Usa el formato MM/AA.'
    if (f.cvv.length < 3) e.cvv = 'El código tiene 3 o 4 dígitos.'
    if (!f.titular.trim()) e.titular = 'Escribe el nombre como aparece en la tarjeta.'
  }
  if (f.metodo === 'pse' && !f.banco) e.banco = 'Elige tu banco.'
  if (!f.consentimiento) e.consentimiento = 'Necesitamos tu autorización para tratar tus datos y registrar el pedido.'
  return e
}

function Resumen({ items, total }) {
  return (
    <aside className="bg-paper border border-line rounded-xl p-6 self-start lg:sticky lg:top-24" aria-label="Resumen del pedido">
      <h2 className="text-xl">Resumen del pedido</h2>
      <ul className="mt-4 border-t border-navy">
        {items.map((i) => {
          const p = porSku(i.sku)
          return (
            <li key={i.sku} className="py-3 border-b border-line flex justify-between gap-4 text-sm">
              <span><span className="font-medium">{i.qty} × {p.producto}</span><span className="block mono text-xs text-muted">{p.sku} · {p.referencia}</span></span>
              <span className="num font-medium whitespace-nowrap">{cop(precios[i.sku] * i.qty)}</span>
            </li>
          )
        })}
      </ul>
      <div className="flex justify-between items-baseline mt-4">
        <span className="font-semibold">Total</span>
        <span className="font-display text-2xl font-bold num">{cop(total)}</span>
      </div>
      <p className="text-xs text-muted mt-3">Valores de lista del catálogo. Tras el pago, un asesor confirma la compatibilidad con tu vehículo, la disponibilidad y el despacho por WhatsApp.</p>
    </aside>
  )
}

export default function Pago() {
  const q = useQuote()
  const nav = useNavigate()
  const [f, setF] = useState(() => ({ ...FORM_VACIO, nombre: q.datos.nombre, consentimiento: q.datos.consentimiento }))
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // editando | procesando | rechazado
  const set = (patch) => setF((s) => ({ ...s, ...patch }))
  const { items } = q
  const total = items.reduce((a, i) => a + precios[i.sku] * i.qty, 0)

  if (items.length === 0) {
    return (
      <>
        <Cabecera titulo="Pagar">Aún no hay referencias para pagar.</Cabecera>
        <div className="wrap py-10">
          <div className="border border-dashed border-[#9db0c0] rounded-lg p-8 text-center max-w-xl">
            <p className="font-medium">Tu lista está vacía.</p>
            <p className="text-sm text-muted mt-1">Agrega referencias desde el catálogo para poder pagarlas.</p>
            <Link to="/catalogo" className="btn btn-dark mt-5">Ir al catálogo</Link>
          </div>
        </div>
      </>
    )
  }

  const pagar = (e) => {
    e.preventDefault()
    const err = validar(f)
    setErrores(err)
    if (Object.keys(err).length) {
      document.getElementById(Object.keys(err)[0])?.focus()
      return
    }
    setEstado('procesando')
    setTimeout(() => {
      // Maqueta: la tarjeta de prueba terminada en 0002 simula un rechazo.
      if (f.metodo === 'tarjeta' && f.tarjeta.endsWith('0002')) { setEstado('rechazado'); return }
      const id = demo.crearPedido({
        cliente: { nombre: f.nombre.trim(), tipoDoc: f.tipoDoc, documento: f.documento, correo: f.correo, celular: f.celular, ciudad: f.ciudad.trim(), direccion: f.direccion.trim(), notas: f.notas.trim() },
        items: items.map((i) => ({ sku: i.sku, producto: porSku(i.sku).producto, referencia: porSku(i.sku).referencia, qty: i.qty, precio: precios[i.sku] })),
        total,
        metodo: f.metodo === 'tarjeta' ? `Tarjeta terminada en ${f.tarjeta.slice(-4)}` : `PSE · ${f.banco}`,
        origen: '#WEB-PAGO',
        consentimiento: true,
      })
      q.limpiar()
      nav(`/pago/exito/${id}`, { replace: true })
    }, 1600)
  }

  const procesando = estado === 'procesando'

  return (
    <>
      <Cabecera titulo="Pagar">Completa tus datos y elige cómo pagar. También puedes <Link to="/cotizacion" className="link">pedir la cotización por WhatsApp</Link>.</Cabecera>
      <div className="wrap py-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <form className="grid gap-8" onSubmit={pagar} noValidate>
          <p className="flex gap-3 items-start text-sm bg-orange-tint text-orange-ink rounded-md px-4 py-3" role="note">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span><strong>Maqueta de pago.</strong> No se cobra nada ni se conecta con ninguna entidad. No escribas datos reales de tu tarjeta; sirve cualquier número de prueba, por ejemplo <span className="mono">4242 4242 4242 4242</span>. Con una tarjeta que termine en <span className="mono">0002</span> verás un pago rechazado.</span>
          </p>

          <fieldset className="grid gap-5">
            <legend className="text-2xl font-display font-bold mb-1">Tus datos</legend>
            <Field id="nombre" label="Nombre completo o razón social" error={errores.nombre}>
              <input {...inputProps('nombre', errores.nombre)} autoComplete="name" value={f.nombre} onChange={(e) => set({ nombre: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-[9rem_1fr] gap-5">
              <Field id="tipoDoc" label="Documento">
                <select {...inputProps('tipoDoc')} value={f.tipoDoc} onChange={(e) => set({ tipoDoc: e.target.value })}>
                  <option value="CC">Cédula (CC)</option><option value="CE">Extranjería (CE)</option><option value="NIT">NIT</option>
                </select>
              </Field>
              <Field id="documento" label="Número" error={errores.documento}>
                <input {...inputProps('documento', errores.documento)} inputMode="numeric" value={f.documento} onChange={(e) => set({ documento: SOLO_DIGITOS(e.target.value, 12) })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field id="correo" label="Correo electrónico" error={errores.correo} hint="Aquí llega el comprobante.">
                <input {...inputProps('correo', errores.correo)} type="email" autoComplete="email" value={f.correo} onChange={(e) => set({ correo: e.target.value })} />
              </Field>
              <Field id="celular" label="Celular (WhatsApp)" error={errores.celular} hint="Por aquí te escribe el asesor.">
                <input {...inputProps('celular', errores.celular)} inputMode="numeric" autoComplete="tel-national" value={f.celular} onChange={(e) => set({ celular: SOLO_DIGITOS(e.target.value, 10) })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-[12rem_1fr] gap-5">
              <Field id="ciudad" label="Ciudad" error={errores.ciudad}>
                <input {...inputProps('ciudad', errores.ciudad)} autoComplete="address-level2" placeholder="Medellín" value={f.ciudad} onChange={(e) => set({ ciudad: e.target.value })} />
              </Field>
              <Field id="direccion" label="Dirección de entrega" error={errores.direccion}>
                <input {...inputProps('direccion', errores.direccion)} autoComplete="street-address" value={f.direccion} onChange={(e) => set({ direccion: e.target.value })} />
              </Field>
            </div>
            <Field id="notas" label="Notas para el asesor (opcional)" hint="Marca, línea y año del vehículo, o lo que quieras aclarar.">
              <textarea {...inputProps('notas')} rows={3} value={f.notas} onChange={(e) => set({ notas: e.target.value })} />
            </Field>
          </fieldset>

          <fieldset className="grid gap-5">
            <legend className="text-2xl font-display font-bold mb-1">Método de pago</legend>
            <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Método de pago">
              {[
                { id: 'tarjeta', t: 'Tarjeta crédito o débito', Icon: CreditCard },
                { id: 'pse', t: 'PSE, débito desde tu banco', Icon: Landmark },
              ].map(({ id, t, Icon }) => (
                <label key={id} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${f.metodo === id ? 'border-navy bg-teal-tint' : 'border-[#9db0c0] bg-white'}`}>
                  <input type="radio" name="metodo" className="accent-[#07325a] size-4" checked={f.metodo === id} onChange={() => set({ metodo: id })} />
                  <Icon size={20} className="text-teal-ink" aria-hidden="true" />
                  <span className="font-medium text-sm">{t}</span>
                </label>
              ))}
            </div>

            {f.metodo === 'tarjeta' ? (
              <div className="grid gap-5">
                <Field id="tarjeta" label="Número de tarjeta" error={errores.tarjeta}>
                  <input {...inputProps('tarjeta', errores.tarjeta)} className="input mono" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" value={agrupar(f.tarjeta)} onChange={(e) => set({ tarjeta: SOLO_DIGITOS(e.target.value, 16) })} />
                </Field>
                <div className="grid grid-cols-2 gap-5">
                  <Field id="vence" label="Vence (MM/AA)" error={errores.vence}>
                    <input {...inputProps('vence', errores.vence)} className="input mono" inputMode="numeric" autoComplete="off" placeholder="08/29" value={f.vence.length > 2 ? `${f.vence.slice(0, 2)}/${f.vence.slice(2)}` : f.vence} onChange={(e) => set({ vence: SOLO_DIGITOS(e.target.value, 4) })} />
                  </Field>
                  <Field id="cvv" label="Código de seguridad" error={errores.cvv}>
                    <input {...inputProps('cvv', errores.cvv)} className="input mono" inputMode="numeric" autoComplete="off" type="password" value={f.cvv} onChange={(e) => set({ cvv: SOLO_DIGITOS(e.target.value, 4) })} />
                  </Field>
                </div>
                <Field id="titular" label="Nombre del titular" error={errores.titular}>
                  <input {...inputProps('titular', errores.titular)} autoComplete="off" value={f.titular} onChange={(e) => set({ titular: e.target.value })} />
                </Field>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                <Field id="personaPse" label="Tipo de persona">
                  <select {...inputProps('personaPse')} value={f.personaPse} onChange={(e) => set({ personaPse: e.target.value })}>
                    <option value="natural">Persona natural</option><option value="juridica">Persona jurídica</option>
                  </select>
                </Field>
                <Field id="banco" label="Banco" error={errores.banco}>
                  <select {...inputProps('banco', errores.banco)} value={f.banco} onChange={(e) => set({ banco: e.target.value })}>
                    <option value="">Selecciona…</option>
                    {BANCOS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
            )}
          </fieldset>

          <Consentimiento checked={f.consentimiento} onChange={(v) => set({ consentimiento: v })} error={errores.consentimiento} />

          {estado === 'rechazado' && (
            <p className="text-sm bg-bad-tint text-bad rounded-md px-4 py-3" role="alert">
              El pago fue rechazado (simulación). Prueba con otro número de tarjeta o elige PSE.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={procesando}>
              {procesando ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
              {procesando ? 'Procesando el pago…' : `Pagar ${cop(total)}`}
            </button>
            <Link to="/cotizacion" className="btn btn-line"><ArrowLeft size={16} aria-hidden="true" /> Volver a mi cotización</Link>
          </div>
        </form>

        <Resumen items={items} total={total} />
      </div>
    </>
  )
}

export function PagoExitoso() {
  const { id } = useParams()
  useDemo()
  const p = demo.pedido(id)

  if (!p) {
    return (
      <>
        <Cabecera titulo="Pedido no encontrado">No encontramos ese pedido en este navegador.</Cabecera>
        <div className="wrap py-10"><Link to="/catalogo" className="btn btn-dark">Ir al catálogo</Link></div>
      </>
    )
  }

  return (
    <div className="wrap py-14 max-w-3xl">
      <div className="flex items-center gap-4">
        <CheckCircle2 size={44} className="text-ok shrink-0" aria-hidden="true" />
        <div>
          <h1 className="text-3xl md:text-4xl">¡Compra exitosa!</h1>
          <p className="text-muted mt-1">Pago simulado aprobado. No se cobró nada real.</p>
        </div>
      </div>

      <div className="mt-8 bg-paper border border-line rounded-xl p-6 grid gap-6">
        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><dt className="text-muted font-semibold">Número de pedido</dt><dd className="mono font-medium mt-0.5">{p.id}</dd></div>
          <div><dt className="text-muted font-semibold">Método</dt><dd className="font-medium mt-0.5">{p.metodo}</dd></div>
          <div><dt className="text-muted font-semibold">Total pagado</dt><dd className="font-display text-xl font-bold num mt-0.5">{cop(p.total)}</dd></div>
        </dl>
        <ul className="border-t border-navy">
          {p.items.map((i) => (
            <li key={i.sku} className="py-3 border-b border-line flex justify-between gap-4 text-sm">
              <span><span className="font-medium">{i.qty} × {i.producto}</span><span className="block mono text-xs text-muted">{i.sku} · {i.referencia}</span></span>
              <span className="num">{cop(i.precio * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">Comprobante enviado a <strong className="text-ink">{p.cliente.correo}</strong> (simulado). Dirección de entrega: {p.cliente.direccion}, {p.cliente.ciudad}.</p>
      </div>

      <section className="mt-10" aria-labelledby="sigue-h">
        <h2 id="sigue-h" className="text-2xl">Qué sigue</h2>
        <ol className="mt-4 grid gap-3 text-muted list-decimal pl-5">
          <li>Un asesor revisa tu pedido y valida la compatibilidad con tu vehículo.</li>
          <li>Te escribe al <span className="mono">{p.cliente.celular}</span> por WhatsApp para confirmar disponibilidad y despacho.</li>
          <li>El pedido ya aparece en el sistema interno de CarSystem, con tus datos y el estado de atención.</li>
        </ol>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/catalogo" className="btn btn-dark">Seguir viendo el catálogo</Link>
        <Link to="/demo/pedidos" className="btn btn-primary"><Banknote size={18} aria-hidden="true" /> Ver este pedido en el CRM</Link>
        <Link to="/" className="btn btn-line"><MessageCircle size={18} aria-hidden="true" /> Ir al inicio</Link>
      </div>
    </div>
  )
}
