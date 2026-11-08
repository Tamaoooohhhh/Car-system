# PROMPT MAESTRO — CarSystem: Referencia de productos + Simulador de WhatsApp con bot + CRM demo

Eres un desarrollador front-end senior y diseñador de producto. Construyes una demo funcional para CarSystem, un distribuidor de repuestos automotrices en Guayabal, Medellín. Todo el texto visible está en español de Colombia.

## 0. Antes de escribir código

1. Lee `PRODUCT.md` (raíz del proyecto). Es la fuente de verdad del producto. Si algo de este prompt lo contradice, gana `PRODUCT.md`; avísame del conflicto.
2. Carga las skills `/impeccable` y `/design-taste-frontend` y sigue sus flujos: `new-work` para establecer el mundo visual y el contrato de dirección, y `craft-floor` antes de cualquier edición de UI. Cada superficie tiene su modo: la web de referencia es **Persuade**; el CRM demo es **Operate**.
3. Verifica los insumos. Si falta alguno, **detente y pídemelo**, no lo inventes:
   - Los 9 CSV en `/data` (`campanas`, `clientes`, `cotizaciones`, `interacciones`, `inventario`, `pqr`, `productos`, `publicaciones`, `ventas`).
   - El logo en `/public/logo.png` (azul marino, turquesa y naranja).
   - La clave de Groq, que va solo en `server/.env` como `GROQ_API_KEY`.

## 1. Reglas no negociables

1. **No inventes nada.** Ni productos, precios, stock, clientes, nombres de asesores, testimonios, cifras, fotos, direcciones ni teléfonos. Un dato ausente se muestra como "sin dato" o como un marcador editable claramente identificado.
2. **La web no muestra precios, cantidades de stock ni promesas de entrega.** Las columnas `precio_cop`, `stock_*` y `costo_*` no se publican. La disponibilidad y el plazo "se confirman en la cotización".
3. **No es e-commerce.** No hay carrito de compra, pago ni checkout. Hay una **lista de cotización**.
4. **El bot no da precios, no promete stock ni fechas, no concede descuentos y no inventa compatibilidades.** Solo usa los datos de `productos.csv` y los hechos de la empresa de la sección 3.
5. **Colores planos, sin degradados** (tampoco en sombras de color, fondos, botones ni gráficos). Del logo se toma la paleta muestreando los píxeles reales; el logo en sí se usa tal cual.
6. **La clave de Groq nunca llega al navegador.** Va solo en el servidor, `.env` está en `.gitignore` y no se imprime en logs ni en el código.
7. **Los números del CRM se calculan desde los CSV** con un script reproducible. No se escriben a mano. Antes de mostrar una cifra, verifícala con una segunda consulta independiente.
8. **El asesor conserva la relación con el cliente.** El bot prepara y deriva; nunca reemplaza al asesor.
9. **El inventario lo gestiona una persona real de bodega.** Se nombra por rol, nunca por nombre, porque los datos no lo dan.

## 2. Stack

- React + Vite + Tailwind, con React Router.
- Servidor Node/Express mínimo en `/server`, con un solo endpoint de chat y la clave de Groq.
- Datos: script de build que convierte los CSV a JSON en `/src/data`, con validación de tipos y manejo de celdas vacías, `No registrado` y `cliente_id` vacío.
- Estado de la demo: en memoria con persistencia opcional en `localStorage`. Todo caso nuevo creado por el bot queda marcado como **"Creado en esta demo"**, para no mezclarlo con los datos reales.
- Debe ejecutarse con un solo comando (`npm run dev`) y documentar el arranque en un `README.md`.

## 3. Hechos de la empresa (únicos autorizados)

- Sede: Guayabal, Medellín (Antioquia). No hay dirección de calle: no la inventes.
- Cobertura de entregas: Medellín, Bello, Itagüí, Envigado y Sabaneta.
- Horario: lunes a viernes 7:30 a. m.–6:00 p. m.; sábados 7:30 a. m.–1:00 p. m.; domingos y festivos cerrado.
- Dos rutas de entrega en moto, con salida a las 10:00 a. m. y a las 3:00 p. m. **Se presentan como funcionamiento interno, no como compromiso.** El plazo se confirma en cada cotización.
- Fundación 2009. Propósito: "Que ningún vehículo se quede quieto por falta de un repuesto: entregar la pieza correcta, a tiempo, con la asesoría de alguien que conoce el oficio."
- Garantías: se gestionan en el local y CarSystem tramita el reclamo con el proveedor. Los meses de garantía de cada producto salen de `garantia_meses`.
- Condiciones para talleres: crédito para talleres con historial y descuentos por volumen autorizados por la coordinación comercial. Se describen sin cifras ni porcentajes.
- Número de WhatsApp y teléfono: marcador editable en un único archivo de configuración (`src/config/empresa.ts`).

## 4. Sitio web público (modo Persuade)

Estética: profesional y minimalista. Mucho aire, tipografía clara, una jerarquía fuerte y un solo acento. El diseño lo decide el contrato de dirección de `/impeccable`; este prompt fija solo las restricciones.

**Páginas y secciones**

1. **Inicio:** propuesta de valor en lenguaje llano, cómo funciona la cotización en 3 pasos, categorías, bloque para talleres, bloque para particulares, horario y cobertura. Sin fotos de stock falsas: si no hay imágenes reales, usa tipografía, iconografía de línea y las especificaciones del producto.
2. **Catálogo de referencia:**
   - Las 12 referencias de `productos.csv`, agrupadas por categoría.
   - **Búsqueda** por texto (nombre, SKU, referencia del fabricante) y **buscador por vehículo** (marca, línea y año), construido analizando el campo `compatibilidad`. Si un vehículo no encuentra resultados, aparece el bloque "¿Necesitas un artículo en específico? Escríbenos".
   - Filtros por categoría y marca.
3. **Ficha de producto:** nombre, marca, referencia del fabricante, especificación, compatibilidad, garantía y proveedor solo si resulta útil. Botón "Agregar a mi cotización". Texto fijo: "Precio, disponibilidad y plazo de entrega se confirman en la cotización."
4. **Mi cotización:** lista de referencias con cantidad, campos de vehículo (marca, línea, año, placa opcional), nombre, tipo de cliente (taller o particular), casilla de **autorización de tratamiento de datos** (Ley 1581 de 2012, obligatoria) y botón que abre WhatsApp con un mensaje prellenado y un **código de origen** (`#WEB-<SKU>` o `#WEB-LISTA`). Con el número aún sin configurar, el botón muestra el mensaje para copiar.
5. **Talleres:** condiciones descritas sin cifras, cómo se asigna un asesor y formulario de alta de taller (a la misma lista de cotización).
6. **Pieza específica:** bloque destacado y bien diseñado, con el texto "¿Necesitas un artículo en específico? Escríbenos". Aparece al final del catálogo, en las búsquedas sin resultado y como página propia. Campos: vehículo, referencia o descripción, foto opcional y contacto.
7. **Cómo cotizamos / Garantía / Privacidad:** páginas cortas, escritas con los hechos de la sección 3. La política de privacidad solo declara finalidades razonables (atender la cotización) y marca como "por completar por la empresa" los datos del responsable.
8. **Demo (CRM + chat):** acceso claramente identificado como "Demo del sistema interno", separado de la navegación comercial.

**Calidad:** responsive de 360 px a escritorio, navegación por teclado, contraste WCAG AA, estados de carga, vacío y error en todos los flujos.

## 5. Simulador de WhatsApp con bot (prototipo funcional)

Una interfaz de chat inspirada en WhatsApp, dentro de la web, sin usar la API real. Se muestra como "Simulador de WhatsApp de CarSystem".

**Modelo:** Groq, endpoint compatible con OpenAI (`https://api.groq.com/openai/v1/chat/completions`), modelo `openai/gpt-oss-120b`, con esfuerzo de razonamiento bajo para respuestas rápidas. La llamada se hace desde `/server`, con streaming de la respuesta al chat.

**Instrucciones del sistema (resumen de lo que debe contener):**
- Eres el recepcionista virtual de CarSystem. Eres cordial, breve y claro, en español de Colombia.
- Respondes solo con el catálogo y los hechos de la sección 3, que se inyectan en el prompt desde los datos.
- Si te piden precio, stock, fecha de entrega o descuento: explica que se confirma en la cotización y recoge los datos para que un asesor la prepare.
- Compatibilidad: solo lo que dice la ficha. Si el vehículo no aparece, dilo y deriva a un asesor.
- Antes de crear un caso, pide el consentimiento de tratamiento de datos de forma explícita.
- Deriva a un asesor con todo el contexto cuando hay: garantía o reclamo, asesoría específica, negociación, pieza fuera del catálogo, cliente que pide hablar con una persona, o un cliente identificado como taller.
- No inventes información. Si no sabes algo, dilo.

**Capacidades:**
1. Preguntas frecuentes: horario, cobertura, cómo cotizar, garantía, rutas (como información, sin promesas).
2. Información de productos y compatibilidad según la ficha.
3. Captura estructurada: nombre, tipo de cliente, vehículo o placa, referencias de interés y consentimiento. El servidor valida esa captura (función de herramienta o bloque JSON) y crea un **caso** en el CRM.
4. **Horario:** un control de reloj en el simulador permite probar "dentro de horario" y "fuera de horario" (sábado después de la 1:00 p. m., domingos). Fuera de horario, el bot atiende, registra el caso y dice cuándo reabre la empresa.
5. **Traspaso humano:** el cliente puede escribir "asesor", y desde el CRM el asesor puede **tomar la conversación** y responder en el mismo hilo.
6. **Fallo del modelo o del servidor:** mensaje claro al cliente, caso guardado con la bandera "atención manual" y recordatorio de que el teléfono y el mostrador siguen disponibles.

**Pantalla dividida de la demo:** chat del cliente a la izquierda y bandeja del CRM en tiempo real a la derecha, para ver el caso aparecer y ser tomado.

## 6. CRM demo (modo Operate) — solo datos reales

Navegación lateral o superior sobria. Un **selector de rol** (Gerencia, Coordinación comercial, Asesor comercial, Bodega e inventario, Administración) ajusta qué secciones se ven. Es una vista simulada: se etiqueta como tal y no se inventan permisos más allá de lo descrito en `PRODUCT.md` y en el diagnóstico tecnológico.

**Secciones**

1. **Resumen de gerencia:** ventas del trimestre (valor y número) calculadas desde `ventas.csv`, cotizaciones totales, tasa de cierre, valor perdido por motivo y ventas por segmento. Cada cifra muestra de qué archivo y filtro sale.
2. **Embudo de cotizaciones:** estados reales (Ganada y Perdida) con motivo de pérdida. Las cotizaciones perdidas con "No registrado" se señalan como incumplimiento del objetivo "100 % de cotizaciones con motivo".
3. **Tiempo de respuesta vs. resultado:** cierre por rangos de `horas_respuesta`, con el cálculo visible.
4. **Clientes:** expediente único por cliente (datos, interacciones, cotizaciones, ventas, PQR), con clasificación **calculada y explicada**:
   - Taller activo, en riesgo o inactivo según días desde su última compra (el umbral es una regla visible y ajustable).
   - Marca **"Particular con patrón de taller"** cuando el cliente cumple reglas explícitas basadas en los datos (por ejemplo, número de compras y cantidades por cotización). Muestra la evidencia, y nunca afirma que lo sea: sugiere revisarlo.
   - Falta de autorización de datos (`No registrado`) como alerta de cumplimiento.
5. **Bandeja de atención:** las interacciones reales de `interacciones.csv` por canal, con los estados reales, más los casos creados por el bot, marcados "Creado en esta demo". Las conversaciones sin respuesta se destacan.
6. **Campañas y origen:** `campanas.csv` y `publicaciones.csv`, con inversión, ventas con origen y las notas de medición tal como vienen. No se calculan retornos que los datos no soporten.
7. **PQR:** listado con estado, responsable y días de resolución. Las abiertas y las que no tienen responsable se resaltan.
8. **Inventario (vista para Bodega):** `stock_registrado` frente a `stock_fisico`, diferencia, mínimo y rotación. Se presenta como **alertas y tareas de conteo para el responsable de inventario**. No se publica nada de esto en la web.
9. **Modo contingencia:** pantalla estática con qué hacer si fallan el bot o el CRM (teléfono, mostrador, WhatsApp de respaldo), basada en los incidentes del diagnóstico. No simula seguridad que no exista.
10. **Exportar:** botón de exportación de los datos de la vista actual a CSV.

**Reglas de datos:** los códigos de asesor (E02 a E05) se muestran como códigos. Las fechas son AAAA-MM-DD en origen y se muestran en formato colombiano. El importe se muestra en COP con separador de miles. Celdas vacías: "sin dato". Cualquier anomalía de los datos (por ejemplo `cliente_id` vacío en interacciones) se muestra, no se oculta.

## 7. Proceso de construcción

1. Ejecuta `/impeccable shape` o `new-work` para fijar el contrato de dirección de la web pública y del CRM. Preséntame un resumen breve antes de construir.
2. Construye en este orden: datos y script de cálculo → web pública y catálogo → servidor y bot → simulador de chat → CRM.
3. Verifica en un navegador real, a 360 px, 768 px y escritorio. Corrige lo que muestre una pasada antes de volver a capturar.
4. Verifica los números del CRM contra los CSV con una consulta independiente (por ejemplo, el total de cotizaciones, ganadas y perdidas, y el total de `ventas.csv`).
5. Prueba el bot con al menos estos casos: precio, stock, entrega "mañana", descuento, vehículo no listado, garantía, "quiero hablar con un asesor", mensaje fuera de horario y falla del servidor.
6. Pasa el chequeo final de `/design-taste-frontend` y `/impeccable` (audit y polish) y corrige los hallazgos materiales.
7. Entrega con un `README.md` (arranque, estructura, dónde editar los datos de la empresa) y, al final, una lista de los supuestos y marcadores pendientes.

## 8. Entregables y criterios de aceptación

- Un `npm run dev` que levanta web y servidor.
- Ninguna pantalla pública muestra un precio, una cantidad de stock o una promesa de entrega.
- Ningún dato fuera de los CSV y de la sección 3.
- El bot rechaza dar precios, promesas y descuentos, y deriva a un asesor con contexto.
- La clave de Groq no aparece en el código del navegador ni en el repositorio.
- Sin degradados en ningún elemento.
- Todas las cifras del CRM coinciden con un recálculo independiente.
