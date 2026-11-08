import { Link } from 'react-router-dom'
import { empresa } from '../config/empresa'
import { Cabecera, Contacto } from '../components/ui.jsx'

function Seccion({ titulo, children }) {
  return (
    <section className="py-8 border-b border-line last:border-0">
      <h2 className="text-2xl">{titulo}</h2>
      <div className="mt-3 text-muted space-y-3 max-w-[68ch]">{children}</div>
    </section>
  )
}

export function ComoCotizamos() {
  return (
    <>
      <Cabecera titulo="Cómo cotizamos">
        Somos distribuidores, no una tienda en línea. Por eso cada pedido pasa por un asesor que confirma lo que importa: la pieza correcta, el precio, la disponibilidad y el plazo.
      </Cabecera>
      <div className="wrap py-8 max-w-[860px]">
        <Seccion titulo="Los pasos">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Eliges referencias en el <Link to="/catalogo" className="link">catálogo</Link> o describes lo que buscas.</li>
            <li>Un asesor valida la compatibilidad con tu vehículo. Puedes darle marca, línea y año, la placa o una foto de la pieza.</li>
            <li>Recibes la cotización con precio, disponibilidad y plazo de entrega confirmados.</li>
            <li>Si aceptas, el asesor coordina el pedido contigo.</li>
          </ol>
        </Seccion>
        <Seccion titulo="Piezas que no están en el catálogo">
          <p>Podemos traer productos específicos. No se asegura que estén disponibles ni que lleguen en un día determinado: eso se confirma en la cotización. <Link to="/pieza-especifica" className="link">Cuéntanos qué necesitas</Link>.</p>
        </Seccion>
        <Seccion titulo="Horario de atención">
          <ul>{empresa.horario.map((h) => <li key={h.dias}><strong className="text-ink">{h.dias}:</strong> {h.horas}</li>)}</ul>
          <p>Puedes dejar tu solicitud en cualquier momento; un asesor la atiende cuando reabrimos.</p>
        </Seccion>
        <Seccion titulo="Entregas">
          <p>Entregamos en {empresa.cobertura.join(', ')}. Hay dos rutas diarias en moto, con salida a las {empresa.rutas.join(' y a las ')}. Es la forma en que operamos: el plazo de cada pedido lo indica la cotización.</p>
        </Seccion>
        <Seccion titulo="Contacto">
          <p><Contacto campo="whatsapp" etiqueta="WhatsApp" /></p>
          <p><Contacto campo="telefono" etiqueta="Teléfono" /></p>
          <p>Sede: {empresa.sede}.</p>
        </Seccion>
      </div>
    </>
  )
}

export function Garantia() {
  return (
    <>
      <Cabecera titulo="Garantía">Las garantías se gestionan directamente en nuestro local.</Cabecera>
      <div className="wrap py-8 max-w-[860px]">
        <Seccion titulo="Cómo funciona">
          <p>Si una pieza presenta un problema, la gestionamos con nosotros en el local en Guayabal. CarSystem tramita el reclamo con el proveedor.</p>
          <p>Cada ficha del <Link to="/catalogo" className="link">catálogo</Link> indica los meses de garantía de la referencia.</p>
        </Seccion>
        <Seccion titulo="Qué tener a la mano">
          <ul className="list-disc pl-5 space-y-1">
            <li>La referencia o el SKU de la pieza.</li>
            <li>La factura o la cotización con la que se hizo el pedido.</li>
            <li>Una descripción de lo que ocurre y, si es posible, fotos.</li>
          </ul>
          <p>Un asesor revisa tu caso y te indica los pasos.</p>
        </Seccion>
      </div>
    </>
  )
}

export function Privacidad() {
  return (
    <>
      <Cabecera titulo="Privacidad y datos personales">
        Tratamos tus datos solo para atender tus solicitudes de cotización, conforme a la Ley 1581 de 2012.
      </Cabecera>
      <div className="wrap py-8 max-w-[860px]">
        <Seccion titulo="Quién es el responsable">
          <p>{empresa.razonSocial}, con sede en {empresa.sede}.</p>
          <p className="bg-orange-tint text-orange-ink rounded-md px-4 py-3 text-sm">Por completar por la empresa: nombre y contacto del responsable del tratamiento de datos {empresa.responsableDatos ? `(${empresa.responsableDatos})` : ''}.</p>
        </Seccion>
        <Seccion titulo="Para qué usamos tus datos">
          <p>Para identificar la pieza que necesitas, preparar tu cotización y contactarte sobre ella. Los datos que puedes darnos son tu nombre, tu contacto, el vehículo y las referencias de interés.</p>
          <p>No te pedimos cédula, tarjetas ni contraseñas, y no debes enviarlas por el chat.</p>
        </Seccion>
        <Seccion titulo="Tus derechos">
          <p>Puedes conocer, actualizar y rectificar tus datos, pedir que se suprima tu información y revocar tu autorización. Para hacerlo, contacta a CarSystem por los canales de atención.</p>
        </Seccion>
        <Seccion titulo="El simulador de WhatsApp">
          <p>El simulador de la demo guarda las conversaciones solo en tu navegador. No se envían a WhatsApp ni a ningún CRM real.</p>
        </Seccion>
      </div>
    </>
  )
}

export function NoEncontrada() {
  return (
    <div className="wrap py-24 max-w-[640px]">
      <h1 className="text-4xl">No encontramos esa página</h1>
      <p className="mt-4 text-muted">Puede que el enlace haya cambiado. Prueba con el catálogo o escríbenos.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/catalogo" className="btn btn-dark">Ir al catálogo</Link>
        <Link to="/" className="btn btn-line">Volver al inicio</Link>
      </div>
    </div>
  )
}
