import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import SiteLayout from './components/SiteLayout.jsx'
import Inicio from './pages/Inicio.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Producto from './pages/Producto.jsx'
import Cotizacion from './pages/Cotizacion.jsx'
import Pago, { PagoExitoso } from './pages/Pago.jsx'
import Talleres from './pages/Talleres.jsx'
import PiezaEspecifica from './pages/PiezaEspecifica.jsx'
import { ComoCotizamos, Garantia, Privacidad, NoEncontrada } from './pages/Info.jsx'

// El CRM y la demo (con los datos reales) se cargan aparte: no pesan en la web pública.
const Demo = lazy(() => import('./demo/Demo.jsx'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Inicio />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="catalogo/:sku" element={<Producto />} />
          <Route path="cotizacion" element={<Cotizacion />} />
          <Route path="pago" element={<Pago />} />
          <Route path="pago/exito/:id" element={<PagoExitoso />} />
          <Route path="talleres" element={<Talleres />} />
          <Route path="pieza-especifica" element={<PiezaEspecifica />} />
          <Route path="como-cotizamos" element={<ComoCotizamos />} />
          <Route path="garantia" element={<Garantia />} />
          <Route path="privacidad" element={<Privacidad />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
        <Route
          path="demo/*"
          element={
            <Suspense fallback={<p className="p-8">Cargando la demo…</p>}>
              <Demo />
            </Suspense>
          }
        />
      </Routes>
    </>
  )
}
