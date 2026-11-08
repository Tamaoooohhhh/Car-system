import { useState } from 'react'
import { demo, useDemo } from '../lib/demoStore.js'
import { cop, int } from '../lib/format.js'
import { Dato, Panel, Vacio } from './parts.jsx'

const ESTADOS = ['Pago recibido', 'Confirmado por asesor', 'En preparación', 'Despachado', 'Entregado']
const CHIP = { 'Pago recibido': 'chip-warn', 'Confirmado por asesor': 'chip-info', 'En preparación': 'chip-info', Despachado: 'chip-neutral', Entregado: 'chip-ok' }
const hora = (iso) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Pedidos() {
  const { pedidos } = useDemo()
  const [sel, setSel] = useState(null)
  const p = pedidos.find((x) => x.id === sel) || pedidos[0] || null

  if (!pedidos.length) {
    return <Vacio>Aún no hay pedidos. Arma una lista en la web, pulsa «Pagar en línea» y completa la maqueta de pago: el pedido aparece aquí con los datos del cliente.</Vacio>
  }

  const total = pedidos.reduce((a, x) => a + x.total, 0)
  const porConfirmar = pedidos.filter((x) => x.estado === 'Pago recibido').length
  const sig = p ? ESTADOS[ESTADOS.indexOf(p.estado) + 1] : null

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-3 gap-6 bg-white border border-line rounded-lg p-5">
        <Dato etiqueta="Pedidos creados en la demo" valor={int(pedidos.length)} />
        <Dato etiqueta="Valor pagado (simulado)" valor={cop(total)} />
        <Dato etiqueta="Por confirmar con el cliente" valor={int(porConfirmar)} detalle="Estado «Pago recibido»" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <Panel titulo="Pedidos con pago en línea" nota="Pedidos hechos desde la maqueta de pago de la web. Viven solo en este navegador y no se mezclan con las ventas reales de los CSV.">
          <div className="overflow-auto border border-line rounded-md">
            <table className="tbl">
              <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th className="r">Total</th><th>Estado</th></tr></thead>
              <tbody>
                {pedidos.map((x) => (
                  <tr key={x.id} className={x.id === p?.id ? 'bg-teal-tint' : ''}>
                    <td><button type="button" className="mono link" onClick={() => setSel(x.id)} aria-pressed={x.id === p?.id}>{x.id}</button></td>
                    <td className="whitespace-nowrap">{hora(x.creadoEn)}</td>
                    <td>{x.cliente.nombre}</td>
                    <td className="r">{cop(x.total)}</td>
                    <td><span className={`chip ${CHIP[x.estado]}`}>{x.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {p && (
          <Panel titulo={`Pedido ${p.id}`} nota={`Origen ${p.origen} · ${p.metodo}`}>
            <div className="grid gap-5 text-sm">
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                <div><dt className="text-xs font-semibold text-muted">Cliente</dt><dd className="font-medium">{p.cliente.nombre}</dd></div>
                <div><dt className="text-xs font-semibold text-muted">Documento</dt><dd className="mono">{p.cliente.tipoDoc} {p.cliente.documento}</dd></div>
                <div><dt className="text-xs font-semibold text-muted">Celular</dt><dd className="mono">{p.cliente.celular}</dd></div>
                <div><dt className="text-xs font-semibold text-muted">Correo</dt><dd>{p.cliente.correo}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs font-semibold text-muted">Entrega</dt><dd>{p.cliente.direccion}, {p.cliente.ciudad}</dd></div>
                {p.cliente.notas && <div className="sm:col-span-2"><dt className="text-xs font-semibold text-muted">Notas del cliente</dt><dd>{p.cliente.notas}</dd></div>}
              </dl>
              <ul className="border-t border-navy">
                {p.items.map((i) => (
                  <li key={i.sku} className="py-2 border-b border-line flex justify-between gap-3">
                    <span>{i.qty} × {i.producto} <span className="mono text-xs text-muted">{i.sku}</span></span>
                    <span className="num">{cop(i.precio * i.qty)}</span>
                  </li>
                ))}
                <li className="py-2 flex justify-between font-bold"><span>Total</span><span className="num">{cop(p.total)}</span></li>
              </ul>
              <div>
                <p className="text-xs font-semibold text-muted mb-2">Estado de atención</p>
                <ol className="flex flex-wrap gap-2 mb-4" aria-label="Avance del pedido">
                  {ESTADOS.map((e) => <li key={e} className={`chip ${ESTADOS.indexOf(e) <= ESTADOS.indexOf(p.estado) ? CHIP[e] : 'chip-neutral'}`}>{e}</li>)}
                </ol>
                {sig ? (
                  <button type="button" className="btn btn-dark btn-sm" onClick={() => demo.estadoPedido(p.id, sig)}>Pasar a «{sig}»</button>
                ) : (
                  <p className="text-ok font-medium">Pedido entregado.</p>
                )}
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}
