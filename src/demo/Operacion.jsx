import { useMemo } from 'react'
import { campanas, D, inventarioConAlertas, totalesInventario } from '../lib/metrics.js'
import { cop, copCorto, fecha, int, pct } from '../lib/format.js'
import { Barras, Dato, Estado, Panel } from './parts.jsx'

export function Campanas() {
  const camp = campanas()
  const orgPost = D.publicaciones
  return (
    <div className="grid gap-6">
      <Panel titulo="Campañas y ventas con origen" fuente="campanas.csv" nota="Las métricas de pauta salen del administrador de anuncios y no tienen etiquetas hacia WhatsApp: el «origen» depende de lo que el asesor registre. No se calcula retorno de inversión porque los datos no lo soportan.">
        <div className="overflow-auto border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th>Campaña</th><th>Canal</th><th>Tipo</th><th className="r">Inversión</th><th className="r">Alcance</th><th className="r">Clics</th><th className="r">Contactos</th><th className="r">Cotiz. con origen</th><th className="r">Ventas con origen</th><th className="r">Valor ventas con origen</th></tr></thead>
            <tbody>
              {camp.map((c) => (
                <tr key={c.campana_id}>
                  <td><span className="font-semibold">{c.nombre}</span><span className="block mono text-xs text-muted">{c.campana_id} · {c.fecha_inicio} a {c.fecha_fin}</span></td>
                  <td>{c.canal}</td><td>{c.tipo}</td>
                  <td className="r">{cop(c.inversion_cop)}</td><td className="r">{int(c.alcance)}</td><td className="r">{int(c.clics)}</td>
                  <td className="r">{int(c.contactos_registrados)}</td><td className="r">{int(c.cotizaciones_con_origen)}</td><td className="r">{int(c.ventas_con_origen)}</td><td className="r">{cop(c.valor_ventas_con_origen_cop)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 grid gap-2 text-xs text-muted">
          {camp.map((c) => <li key={c.campana_id}><span className="mono">{c.campana_id}</span> · nota de medición: {c.nota_medicion}</li>)}
        </ul>
      </Panel>

      <Panel titulo="Alcance por publicación" fuente="publicaciones.csv" nota="Alcance de cada publicación (22). Los reels educativos y las piezas de «disponibilidad general» se comparan por alcance.">
        <Barras
          ariaLabel="Alcance por publicación"
          items={orgPost.map((p) => ({ label: `${p.post_id} · ${p.tema}`, value: p.alcance, texto: `${int(p.alcance)}${p.pagada === 'Sí' ? ' · pauta' : ''}`, color: p.pagada === 'Sí' ? '#ec8227' : p.formato === 'Reel' ? '#078dab' : '#07325a' }))}
        />
        <p className="text-xs text-muted mt-4">Naranja: pagada. Turquesa: reel orgánico. Azul: otras orgánicas.</p>
      </Panel>
    </div>
  )
}

export function Pqr() {
  const filas = D.pqr
  const abiertas = filas.filter((p) => p.estado === 'Abierta')
  const sinResp = filas.filter((p) => !p.responsable)
  const cliente = (id) => D.clientes.find((c) => c.cliente_id === id)?.nombre ?? id
  return (
    <div className="grid gap-6">
      <Panel titulo={`PQR (${filas.length})`} fuente="pqr.csv" nota={`${abiertas.length} abiertas · ${sinResp.length} sin responsable asignado${sinResp.length ? ` (${sinResp.map((p) => p.pqr_id).join(', ')})` : ''}.`}>
        <div className="overflow-auto border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th>PQR</th><th>Fecha</th><th>Cliente</th><th>SKU</th><th>Tipo</th><th>Canal</th><th>Descripción</th><th>Estado</th><th className="r">Días</th><th>Responsable</th></tr></thead>
            <tbody>
              {filas.map((p) => (
                <tr key={p.pqr_id}>
                  <td className="mono">{p.pqr_id}</td><td className="whitespace-nowrap">{fecha(p.fecha)}</td><td>{cliente(p.cliente_id)}</td><td className="mono">{p.sku}</td>
                  <td>{p.tipo}</td><td>{p.canal}</td><td className="min-w-[22rem]">{p.descripcion}</td>
                  <td><Estado v={p.estado} /></td><td className="r">{p.dias_resolucion ?? '—'}</td>
                  <td className="mono">{p.responsable ?? <span className="chip chip-bad">sin responsable</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

export function Inventario() {
  const inv = useMemo(inventarioConAlertas, [])
  const t = useMemo(totalesInventario, [])
  const bajo = inv.filter((i) => i.bajoMinimoFisico)
  const enMin = inv.filter((i) => i.enMinimo)
  const conteo = [...inv].sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia))
  return (
    <div className="grid gap-6">
      <Panel
        titulo="Registrado frente a conteo físico"
        fuente="inventario.csv"
        nota="Vista para el responsable de inventario: alertas y prioridad de conteo. Esta información es interna y no se publica en la web."
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 mb-6">
          <Dato etiqueta="Unidades en la hoja" valor={int(t.registrado)} />
          <Dato etiqueta="Unidades contadas" valor={int(t.fisico)} detalle={`Diferencia ${int(t.fisico - t.registrado)} (${pct((t.fisico - t.registrado) / t.registrado)})`} />
          <Dato etiqueta="Valor a costo en la hoja" valor={copCorto(t.costoRegistrado)} />
          <Dato etiqueta="Valor a costo contado" valor={copCorto(t.costoFisico)} detalle={`Diferencia ${copCorto(t.costoFisico - t.costoRegistrado)}`} />
        </div>
        <p className="text-sm mb-3"><strong>{bajo.length}</strong> referencias bajo el mínimo según el conteo físico{bajo.length ? ` (${bajo.map((i) => i.sku).join(', ')})` : ''}; <strong>{enMin.length}</strong> exactamente en el mínimo{enMin.length ? ` (${enMin.map((i) => i.sku).join(', ')})` : ''}. La hoja no marcaba ninguna.</p>
        <div className="overflow-auto border border-line rounded-md">
          <table className="tbl">
            <thead><tr><th>SKU</th><th>Producto</th><th className="r">Hoja</th><th className="r">Físico</th><th className="r">Diferencia</th><th className="r">Mínimo</th><th className="r">Reposición (días)</th><th className="r">Vendidas jul–sep</th><th>Alerta</th><th>Actualización de la hoja</th></tr></thead>
            <tbody>
              {conteo.map((i) => (
                <tr key={i.sku}>
                  <td className="mono">{i.sku}</td><td>{i.producto}</td>
                  <td className="r">{i.stock_registrado}</td><td className="r">{i.stock_fisico}</td>
                  <td className={`r font-semibold ${i.diferencia < 0 ? 'text-bad' : ''}`}>{i.diferencia}</td>
                  <td className="r">{i.stock_minimo}</td><td className="r">{i.tiempo_reposicion_dias}</td><td className="r">{i.unidades_vendidas_jul_sep}</td>
                  <td className="space-x-1">
                    {i.bajoMinimoFisico && <span className="chip chip-bad">Bajo mínimo</span>}
                    {i.enMinimo && <span className="chip chip-warn">En el mínimo</span>}
                    {i.sinVentas && <span className="chip chip-warn">Sin ventas</span>}
                    {!i.bajoMinimoFisico && !i.enMinimo && !i.sinVentas && <span className="text-muted">—</span>}
                  </td>
                  <td className="whitespace-nowrap">{fecha(i.ultima_actualizacion_hoja)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">Orden: mayor diferencia absoluta primero, como prioridad de conteo cíclico. Conteo físico del {fecha(inv[0].fecha_conteo_fisico)}.</p>
      </Panel>
    </div>
  )
}

export function Contingencia() {
  const pasos = [
    ['Si falla el asistente virtual', 'El teléfono y el mostrador siguen atendiendo. Un asesor revisa los casos marcados como «atención manual» en la bandeja.'],
    ['Si falla el CRM o internet', 'Se registran las cotizaciones en papel y se pasan al sistema al volver el servicio. El 18 de julio una caída de internet de 5 horas obligó a hacerlo así (INC-01).'],
    ['Si falla el celular del mostrador', 'Los mensajes se atienden desde otro dispositivo autorizado. En agosto una falla de 2 días obligó a usar celulares personales (INC-03).'],
    ['Si llega un correo que pide cambiar cuentas bancarias', 'No se acepta el cambio por correo: se verifica por teléfono con un contacto ya conocido. El 11 de septiembre ese control evitó un pago indebido (INC-04).'],
    ['Si una hoja de inventario se sobrescribe', 'Se restaura una versión anterior y se repiten las entradas perdidas. Ocurrió el 14 de agosto (INC-02).'],
  ]
  return (
    <Panel titulo="Modo contingencia" fuente="Diagnóstico de tecnología e infraestructura (INC-01 a INC-05)" nota="Guía de qué hacer cuando falla una herramienta o una persona. No simula controles de seguridad: describe prácticas basadas en los incidentes ocurridos.">
      <ol className="border-t border-navy">
        {pasos.map(([t, d]) => (
          <li key={t} className="py-4 border-b border-line"><h3 className="text-base">{t}</h3><p className="text-sm text-muted mt-1 max-w-[72ch]">{d}</p></li>
        ))}
      </ol>
    </Panel>
  )
}
