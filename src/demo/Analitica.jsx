import { useMemo } from 'react'
import { cierrePorCanal, cierrePorRespuesta, D, perdidasPorMotivo, resumenGeneral, ventasPorSegmento, valorLista } from '../lib/metrics.js'
import { cop, copCorto, int, pct } from '../lib/format.js'
import { Barras, Dato, Estado, Panel } from './parts.jsx'

export function Resumen() {
  const r = useMemo(resumenGeneral, [])
  const seg = useMemo(ventasPorSegmento, [])
  const motivos = useMemo(perdidasPorMotivo, [])
  const noReg = motivos.find((m) => m.motivo === 'No registrado')

  return (
    <div className="grid gap-6">
      <Panel titulo="Trimestre julio–septiembre 2026" fuente="ventas.csv · cotizaciones.csv" nota="Cifras calculadas desde los archivos, sin ajustes manuales.">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          <Dato etiqueta="Ventas registradas" valor={int(r.ventas)} detalle={cop(r.ventasValor)} />
          <Dato etiqueta="Cotizaciones" valor={int(r.cotizaciones)} detalle={`${r.ganadas} ganadas · ${r.perdidas} perdidas`} />
          <Dato etiqueta="Tasa de cierre" valor={pct(r.tasaCierre)} detalle="Ganadas sobre cotizaciones" />
          <Dato etiqueta="Pérdidas sin motivo" valor={`${r.sinMotivo} de ${r.perdidas}`} detalle='Objetivo 2027: 100 % con motivo' />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel titulo="Ventas por segmento" fuente="ventas.csv + clientes.csv (segmento)" nota="Según la clasificación actual del cliente. Revisa 'Clientes': algunos particulares compran como talleres.">
          <Barras
            ariaLabel="Valor de ventas por segmento"
            items={seg.map((s) => ({ label: `${s.segmento} (${s.ventas} ventas)`, value: s.valor, texto: `${copCorto(s.valor)} · ${pct(s.parte)}`, color: s.segmento === 'Taller' ? '#07325a' : '#078dab' }))}
          />
          <p className="text-xs text-muted mt-4">La meta 2027 de «1 de cada 3 ventas a particulares» se mide sobre esta clasificación.</p>
        </Panel>

        <Panel titulo="Por qué se pierden las cotizaciones" fuente="cotizaciones.csv (motivo_perdida)" nota="Valor estimado a precio de lista de productos.csv: cantidad × precio. Es una estimación interna, no un monto facturado.">
          <Barras
            ariaLabel="Cotizaciones perdidas por motivo"
            items={motivos.map((m) => ({
              label: m.motivo,
              value: m.cotizaciones,
              texto: `${m.cotizaciones} · ${copCorto(m.valor)}`,
              color: ['Respuesta tardía', 'Sin seguimiento', 'Sin disponibilidad'].includes(m.motivo) ? '#ec8227' : m.motivo === 'No registrado' ? '#a3262a' : '#07325a',
            }))}
          />
          <p className="text-xs text-muted mt-4"><span className="inline-block size-2.5 rounded-sm align-middle mr-1" style={{ background: '#ec8227' }} />Naranja: causas de proceso interno. {noReg && <>En rojo, {noReg.cotizaciones} pérdidas sin motivo registrado.</>}</p>
        </Panel>
      </div>
    </div>
  )
}

export function Embudo() {
  const r = useMemo(resumenGeneral, [])
  const canales = useMemo(cierrePorCanal, [])
  const perdidas = D.cotizaciones.filter((c) => c.estado === 'Perdida')
  const sinMotivo = perdidas.filter((c) => c.motivo_perdida === 'No registrado')

  return (
    <div className="grid gap-6">
      <Panel titulo="Estado de las cotizaciones" fuente="cotizaciones.csv" nota="En los datos solo existen los estados Ganada y Perdida: no hay cotizaciones abiertas ni en seguimiento. Ese es un hueco del registro actual.">
        <div className="grid sm:grid-cols-3 gap-6">
          <Dato etiqueta="Total" valor={int(r.cotizaciones)} />
          <Dato etiqueta="Ganadas" valor={int(r.ganadas)} detalle={pct(r.ganadas / r.cotizaciones)} />
          <Dato etiqueta="Perdidas" valor={int(r.perdidas)} detalle={`${r.perdidasConMotivo} con motivo · ${r.sinMotivo} sin motivo`} />
        </div>
      </Panel>

      <Panel titulo="Cierre por canal de la cotización" fuente="cotizaciones.csv (canal, estado)">
        <Barras
          ariaLabel="Tasa de cierre por canal"
          max={1}
          items={canales.map((c) => ({ label: `${c.canal} (${c.cotizaciones})`, value: c.tasa, texto: `${c.ganadas}/${c.cotizaciones} · ${pct(c.tasa)}` }))}
        />
        <p className="text-xs text-muted mt-4">Con pocas cotizaciones por canal, las diferencias pequeñas no son concluyentes.</p>
      </Panel>

      <Panel titulo={`Pérdidas sin motivo registrado (${sinMotivo.length})`} fuente="cotizaciones.csv" nota="Incumplen el objetivo de tener resultado y motivo en el 100 % de las cotizaciones.">
        <div className="overflow-auto border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th>Cotización</th><th>Fecha</th><th>Cliente</th><th>SKU</th><th className="r">Cant.</th><th>Canal</th><th className="r">Respuesta</th><th className="r">Valor a precio de lista</th></tr></thead>
            <tbody>
              {sinMotivo.map((c) => (
                <tr key={c.cotizacion_id}>
                  <td className="mono">{c.cotizacion_id}</td><td>{c.fecha}</td>
                  <td>{D.clientes.find((x) => x.cliente_id === c.cliente_id)?.nombre}</td>
                  <td className="mono">{c.sku}</td><td className="r">{c.cantidad}</td><td>{c.canal}</td>
                  <td className="r">{c.horas_respuesta} h</td><td className="r">{cop(valorLista(c))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

export function Respuesta() {
  const rangos = useMemo(cierrePorRespuesta, [])
  const todas = D.cotizaciones.filter((c) => c.horas_respuesta != null)
  const porValor = useMemo(() => {
    const out = {}
    for (const c of todas) {
      out[c.horas_respuesta] ??= { h: c.horas_respuesta, n: 0, g: 0 }
      out[c.horas_respuesta].n += 1
      if (c.estado === 'Ganada') out[c.horas_respuesta].g += 1
    }
    return Object.values(out).sort((a, b) => a.h - b.h)
  }, [todas])

  return (
    <div className="grid gap-6">
      <Panel titulo="Tiempo de respuesta y resultado de la cotización" fuente="cotizaciones.csv (horas_respuesta, estado)" nota={`${todas.length} cotizaciones con dato de tiempo de respuesta. Cada barra es la tasa de cierre del rango.`}>
        <Barras
          ariaLabel="Tasa de cierre por rango de tiempo de respuesta"
          max={1}
          items={rangos.map((r) => ({ label: `${r.label} (${r.cotizaciones})`, value: r.tasa ?? 0, texto: `${r.ganadas}/${r.cotizaciones} · ${pct(r.tasa)}`, color: r.id === 'lenta' ? '#ec8227' : r.id === 'media' ? '#078dab' : '#07325a' }))}
        />
        <p className="text-xs text-muted mt-4">Los rangos son una agrupación de este panel. Muestra una asociación entre rapidez y cierre, no prueba que una cause la otra.</p>
      </Panel>

      <Panel titulo="Detalle por tiempo exacto" fuente="cotizaciones.csv">
        <div className="overflow-auto border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th className="r">Horas de respuesta</th><th className="r">Cotizaciones</th><th className="r">Ganadas</th><th className="r">Tasa de cierre</th></tr></thead>
            <tbody>
              {porValor.map((x) => (
                <tr key={x.h}><td className="r">{x.h}</td><td className="r">{x.n}</td><td className="r">{x.g}</td><td className="r">{pct(x.g / x.n)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

export { Estado }
