// Exporta filas (objetos planos) a un CSV compatible con Excel (UTF-8 con BOM, separador coma).
const celda = (v) => {
  if (v == null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function aCsv(filas) {
  if (!filas.length) return ''
  const cols = [...new Set(filas.flatMap((f) => Object.keys(f)))]
  return [cols.join(','), ...filas.map((f) => cols.map((c) => celda(f[c])).join(','))].join('\r\n')
}

export function descargarCsv(nombre, filas) {
  const blob = new Blob(['﻿' + aCsv(filas)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombre}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
