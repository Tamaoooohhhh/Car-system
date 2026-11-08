// Datos de la empresa. Fuente: perfil corporativo entregado por la gerencia.
// Lo que no se conoce queda como marcador editable (null) y la interfaz lo muestra como "por confirmar".
export const empresa = {
  nombre: 'CarSystem',
  razonSocial: 'Carsystem Repuestos S.A.S.',
  fundacion: 2009,
  sede: 'Guayabal, Medellín (Antioquia)',
  cobertura: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta'],
  horario: [
    { dias: 'Lunes a viernes', horas: '7:30 a. m. – 6:00 p. m.' },
    { dias: 'Sábados', horas: '7:30 a. m. – 1:00 p. m.' },
    { dias: 'Domingos y festivos', horas: 'Cerrado' },
  ],
  rutas: ['10:00 a. m.', '3:00 p. m.'],
  proposito:
    'Que ningún vehículo se quede quieto por falta de un repuesto: entregar la pieza correcta, a tiempo, con la asesoría de alguien que conoce el oficio.',
  // MARCADORES EDITABLES: dejar en null hasta tener el dato real.
  whatsapp: '573147462515', // formato internacional sin signos, por ejemplo '57300XXXXXXX'
  telefono: '5173456',
  correo: 'carsystem@gmail.com',
  responsableDatos: 'Car System', // nombre y contacto del responsable del tratamiento de datos
}
