import { useMemo, useState } from 'react'
import { AlertTriangle, ShieldAlert, X } from 'lucide-react'
import { clientesEnriquecidos, FECHA_CORTE, REGLAS } from '../lib/metrics.js'
import { cop, fecha } from '../lib/format.js'
import { Estado, Panel } from './parts.jsx'

export default function Clientes() {
  const [reglas, setReglas] = useState(REGLAS)
  const [sel, setSel] = useState(null)
  const [segmento, setSegmento] = useState('')
  const clientes = useMemo(() => clientesEnriquecidos(reglas), [reglas])
  const lista = clientes.filter((c) => !segmento || c.segmento === segmento)
  const detalle = clientes.find((c) => c.cliente_id === sel)

  const sinAut = clientes.filter((c) => c.sinAutorizacion)
  const patron = clientes.filter((c) => c.patronTaller)
  const enAlerta = clientes.filter((c) => c.senales.length)

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Alerta icono={<ShieldAlert size={18} />} titulo={`${sinAut.length} sin autorización de datos`} tono="bad">
          {sinAut.map((c) => c.nombre).join(', ')}. Campo <span className="mono">autoriza_tratamiento_datos</span> = "No registrado".
        </Alerta>
        <Alerta icono={<AlertTriangle size={18} />} titulo={`${patron.length} particulares con patrón de taller`} tono="warn">
          {patron.map((c) => c.nombre).join(', ')}. Es una sugerencia para revisar con la gerencia, no una conclusión.
        </Alerta>
        <Alerta icono={<AlertTriangle size={18} />} titulo={`${enAlerta.length} taller(es) con señales de fuga`} tono="warn">
          {enAlerta.length ? enAlerta.map((c) => c.nombre).join(', ') : 'Ninguno cumple las reglas.'}
        </Alerta>
      </div>

      <Panel
        titulo={`Clientes (${lista.length})`}
        fuente="clientes.csv · ventas.csv · cotizaciones.csv · interacciones.csv · pqr.csv"
        nota={`Estado de talleres calculado a la fecha de corte ${fecha(FECHA_CORTE)}, último día del trimestre en los datos.`}
        accion={
          <div className="flex flex-wrap items-end gap-3 text-xs">
            <div>
              <label className="label !text-xs" htmlFor="seg">Segmento</label>
              <select id="seg" className="input !min-h-9 !py-1 !w-auto" value={segmento} onChange={(e) => setSegmento(e.target.value)}>
                <option value="">Todos</option><option>Taller</option><option>Particular</option>
              </select>
            </div>
            <div>
              <label className="label !text-xs" htmlFor="r1">Activo hasta (días)</label>
              <input id="r1" type="number" min={1} className="input !min-h-9 !py-1 !w-24" value={reglas.activoDias} onChange={(e) => setReglas({ ...reglas, activoDias: Math.max(1, Number(e.target.value) || 1) })} />
            </div>
            <div>
              <label className="label !text-xs" htmlFor="r2">En riesgo hasta (días)</label>
              <input id="r2" type="number" min={1} className="input !min-h-9 !py-1 !w-24" value={reglas.riesgoDias} onChange={(e) => setReglas({ ...reglas, riesgoDias: Math.max(reglas.activoDias, Number(e.target.value) || 1) })} />
            </div>
          </div>
        }
      >
        <div className="overflow-auto border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th>Cliente</th><th>Segmento</th><th>Canal</th><th className="r">Compras</th><th className="r">Valor comprado</th><th>Última compra</th><th>Estado</th><th>Alertas</th></tr></thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.cliente_id} className="cursor-pointer" onClick={() => setSel(c.cliente_id)}>
                  <td>
                    <button type="button" className="font-semibold text-left link no-underline hover:underline" onClick={(e) => { e.stopPropagation(); setSel(c.cliente_id) }}>{c.nombre}</button>
                    <span className="block text-xs text-muted mono">{c.cliente_id}</span>
                  </td>
                  <td>{c.segmento}</td>
                  <td>{c.canal_preferido}</td>
                  <td className="r">{c.ventas.length}</td>
                  <td className="r">{cop(c.ventasValor)}</td>
                  <td>{c.ultimaCompra ? `${fecha(c.ultimaCompra)} (hace ${c.diasDesdeCompra} d)` : 'sin compras'}</td>
                  <td>{c.estado ? <Estado v={c.estado} /> : <span className="text-muted text-xs">solo aplica a talleres</span>}</td>
                  <td className="space-y-1">
                    {c.sinAutorizacion && <span className="chip chip-bad">Sin autorización</span>}
                    {c.patronTaller && <span className="chip chip-warn ml-1">Patrón de taller</span>}
                    {c.senales.length > 0 && <span className="chip chip-warn ml-1">Señales de fuga</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {detalle && <Expediente c={detalle} cerrar={() => setSel(null)} />}
    </div>
  )
}

function Alerta({ icono, titulo, tono, children }) {
  return (
    <div className={`rounded-lg border p-4 ${tono === 'bad' ? 'bg-bad-tint border-bad/30 text-bad' : 'bg-orange-tint border-orange/40 text-orange-ink'}`}>
      <p className="font-bold flex items-center gap-2">{icono}{titulo}</p>
      <p className="text-sm mt-1 text-ink/90">{children}</p>
    </div>
  )
}

function Expediente({ c, cerrar }) {
  return (
    <Panel
      titulo={`Expediente: ${c.nombre}`}
      fuente="clientes.csv y archivos cruzados por cliente_id"
      accion={<button type="button" className="btn btn-sm btn-line" onClick={cerrar}><X size={15} aria-hidden="true" /> Cerrar</button>}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <dl className="grid gap-2 text-sm content-start">
          {[
            ['ID', c.cliente_id], ['Segmento', c.segmento], ['Ciudad', c.ciudad ?? 'sin dato'], ['Zona', c.zona ?? 'sin dato'],
            ['Registro', c.fecha_registro ? fecha(c.fecha_registro) : 'sin dato'], ['Contacto', c.contacto], ['Teléfono', c.telefono],
            ['Vehículo o especialidad', c.vehiculo_o_especialidad], ['Condición de pago', c.condicion_pago], ['Canal preferido', c.canal_preferido],
            ['Autoriza tratamiento de datos', c.autoriza_tratamiento_datos],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[11rem_1fr] gap-2"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
          ))}
          {c.senales.length > 0 && (
            <div className="mt-2 rounded-md bg-orange-tint p-3"><p className="font-bold text-orange-ink">Señales de fuga</p><ul className="list-disc pl-5 text-ink/90">{c.senales.map((s) => <li key={s}>{s}</li>)}</ul></div>
          )}
          {c.patronTaller && (
            <div className="mt-2 rounded-md bg-orange-tint p-3"><p className="font-bold text-orange-ink">Patrón de taller (a revisar)</p><ul className="list-disc pl-5 text-ink/90">{c.patronTaller.map((s) => <li key={s}>{s}</li>)}</ul><p className="text-xs text-muted mt-1">Reglas: 3 o más compras, o 2 o más compras de referencias que no corresponden a su vehículo.</p></div>
          )}
        </dl>

        <div className="grid gap-6">
          <Tabla titulo={`Ventas (${c.ventas.length})`} cols={['Venta', 'Fecha', 'SKU', 'Cant.', 'Valor']} filas={c.ventas.map((v) => [v.venta_id, fecha(v.fecha), v.sku, v.cantidad, cop(v.valor_cop)])} />
          <Tabla
            titulo={`Cotizaciones (${c.cotizaciones.length})`}
            cols={['Cotización', 'Fecha', 'SKU', 'Resp. (h)', 'Estado', 'Motivo']}
            filas={c.cotizaciones.map((q) => [q.cotizacion_id, fecha(q.fecha), q.sku, q.horas_respuesta ?? 'sin dato', <Estado key="e" v={q.estado} />, q.motivo_perdida ?? '—'])}
          />
          <Tabla titulo={`PQR (${c.pqr.length})`} cols={['PQR', 'Fecha', 'Tipo', 'Estado', 'Descripción']} filas={c.pqr.map((p) => [p.pqr_id, fecha(p.fecha), p.tipo, <Estado key="e" v={p.estado} />, p.descripcion])} />
          <Tabla
            titulo={`Interacciones (${c.interacciones.length})`}
            cols={['ID', 'Fecha', 'Canal', 'Motivo', 'Resultado']}
            filas={c.interacciones.map((i) => [i.interaccion_id, fecha(i.fecha), i.canal, i.motivo, i.resultado])}
          />
        </div>
      </div>
    </Panel>
  )
}

function Tabla({ titulo, cols, filas }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2">{titulo}</h3>
      {filas.length === 0 ? <p className="text-sm text-muted">sin registros</p> : (
        <div className="overflow-auto max-h-64 border border-line rounded-md">
          <table className="tbl"><thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{filas.map((f, i) => <tr key={i}>{f.map((x, j) => <td key={j}>{x}</td>)}</tr>)}</tbody></table>
        </div>
      )}
    </div>
  )
}
