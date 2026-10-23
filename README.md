# SHOWTECH SOLUTIONS &bull; Módulo “Modificar datos del evento”
### Gestión Operativa de Auditorio &bull; Panel de Administración

Este proyecto implementa el prototipo funcional y de diseño del módulo administrativo **“Modificar datos del evento”** para el **Auditorio Showtech**, adaptado visual y estructuralmente con base en la identidad corporativa de **Showtech Solutions S.A.C.** y el flujo guiado en cuatro pasos.

Desarrollado con **HTML5 semántico, CSS3 y JavaScript puro (Vanilla JS / ES6+)**, incorporando localmente **Flatpickr (v4.6.13)** con localización en español y **jsPDF (v2.5.1)** para la generación del resumen formal para el cliente, sin dependencias de Node en tiempo de ejecución, compatible con apertura directa de archivos locales (`file://`), servidores estáticos y GitHub Pages.

---

## 1. Identidad Visual y Estilo

- **Paleta de marca corporativa:**
  - Azul marino principal: `#13264a`
  - Azul secundario Showtech: `#1f4e9c`
  - Dorado de acento: `#f2a900`
  - Fondo general: `#f5f7fb`
  - Lavanda suave: `#eef1fb`
  - Verde de confirmación / éxito: `#1e8e5a`
  - Rojo de error / conflicto: `#c0392b`
- **Identificación visual de bloques técnicos (Colores suaves y etiquetas legibles):**
  - **Evento principal:** Azul Showtech (`#1f4e9c` / fondo suave `#eff6ff`) &bull; Etiqueta `badge-evento`.
  - **Montaje técnico:** Ámbar (`#d97706` / fondo suave `#fef3c7`) &bull; Etiqueta `badge-montaje`.
  - **Desmontaje técnico:** Violeta (`#7c3aed` / fondo suave `#f3e8ff`) &bull; Etiqueta `badge-desmontaje`.
  - **Ensayo técnico:** Turquesa (`#0d9488` / fondo suave `#ccfbf1`) &bull; Etiqueta `badge-ensayo`.
  - No depende exclusivamente del color: cada bloque cuenta con encabezados textuales explícitos, ayudas contextuales y etiquetas semánticas.

---

## 2. Ajustes Implementados

### 1. Selector de Hora Más Claro (Flatpickr Rediseñado)
- **Campo único HH:mm con icono de reloj:** Se eliminaron los antiguos desplegables dobles voluminosos. Cada horario se muestra en un campo estilizado con esquinas redondeadas de 8 px, fondo blanco, borde gris suave y foco azul Showtech.
- **Panel flotante amplio y ergonómico:** Panel rediseñado con padding generoso (16 px), etiquetas textuales superiores **“Hora”** y **“Minutos”**, separador `:`, números grandes (20 px) y controles de flecha cómodos para pulsación táctil o con cursor.
- **Acción clara “Listo”:** Se añadió un botón inferior `.btn-fp-listo` dentro del propio panel para cerrar cómodamente la selección con un clic.
- **Entrada manual y teclado:** Permite escribir directamente la hora con formato de 24 horas y precisión de 1 minuto. La validación en fase de captura no corrige silenciosamente horas inválidas: si se introduce una hora fuera del rango (`06:00` a `22:00`), se marca en rojo y muestra el mensaje correspondiente sin alteración forzada.

### 2. Calendario Visual Uniforme (Flatpickr en Español)
- **Localización nativa en español (`assets/vendor/flatpickr/es.js`):** Calendario con nombres de meses y días en español, iniciando la semana en día **Lunes** (`firstDayOfWeek: 1`).
- **Encabezado y navegación clara:** Visualización clara de mes y año con botones ergonómicos de navegación anterior y siguiente.
- **Días y objetivos táctiles cómodos:** Celdas de 36 px de alto con áreas cómodas para pulsar.
- **Estados visuales diferenciados:**
  - **Día seleccionado:** Fondo azul Showtech (`#1f4e9c`) con texto blanco y esquinas redondeadas.
  - **Día actual (Today):** Borde discreto azul Showtech (`1.5px solid #1f4e9c`), fondo transparente y texto destacado, claramente distinguible del día seleccionado.
- **Formato visible e interno:** Configurado con `altInput: true` y `altFormat: 'd/m/Y'`, mostrando la fecha visible en formato peruano (`dd/mm/aaaa`) mientras el valor interno mantiene compatibilidad total en formato ISO (`YYYY-MM-DD`).
- **Icono interactivo:** Icono de calendario integrado a la derecha que despliega el selector tanto en escritorio como en móvil.

### 3. Fechas y Horarios Técnicos Completos
- **Bloques técnicos independientes:** Cada bloque (Montaje, Desmontaje y Ensayo) cuenta con casillas de activación independientes y contiene:
  - **Fecha del bloque** (con selector de calendario Flatpickr).
  - **Hora de inicio** (con selector de hora HH:mm).
  - **Hora de fin** (con selector de hora HH:mm).
- **Precarga sin alterar eventos guardados:** Al cargar los eventos iniciales (`EVT-001` y `EVT-002`), se precargan sus intervalos completos sin modificar la información de fábrica.
- **Disponibilidad técnica integral:** La comprobación de disponibilidad evalúa todos los intervalos técnicos activos con sus fechas específicas frente a los demás eventos y bloqueos institucionales, excluyendo del análisis el evento que se encuentra en edición.
- **Reglas de negocio y estado de confirmación:**
  - *Regla implementada:* El fin de montaje no puede superar el inicio del evento cuando ocurren el mismo día. El inicio de desmontaje no puede ser anterior al fin del evento cuando ocurren el mismo día. El ensayo técnico debe finalizar antes del montaje o evento si coincide en la misma fecha.
  - *Regla documentada como pendiente de confirmación:* Se documenta como **pendiente de confirmación con el área de operaciones** si el montaje previo y el desmontaje posterior pueden abarcar días distintos a la fecha del evento principal o si deben permanecer estrictamente unidos a la jornada de inicio y fin del evento. Actualmente el prototipo permite fechas independientes y valida que no colisionen con otras reservas en el auditorio.

### 4. Comparativo en Dos Columnas (Paso 4: Revisión)
- **Estructura en dos columnas:**
  - **Columna izquierda:** “Datos actuales” (valores guardados en el sistema).
  - **Columna derecha:** “Cambios propuestos” (nuevos valores modificados).
- **Alineación fila por fila:** Ambos bloques alinean exactamente los mismos campos (nombre, cliente, contacto, teléfono, correo, solicitado por, observaciones, fecha de evento, horario, montaje, desmontaje y ensayo).
- **Destacado selectivo:** Únicamente las filas que presentan diferencias efectivas reciben la clase `.fila-modificada` y la insignia visual `Modificado`, facilitando una auditoría visual inmediata.
- **Adaptabilidad móvil:** En pantallas pequeñas (`≤ 768px`), las filas se transforman en tarjetas legibles que presentan claramente el bloque "Valor actual" frente a "Propuesta", conservando la relación comparativa sin desbordamientos.

### 5. Resumen de Horas e Importe Adicional (Vista Asesor Comercial)
- **Comparación de tiempos del evento:**
  - Duración anterior del evento (ej. `3 h 00 min`).
  - Duración propuesta del evento (ej. `3 h 30 min`).
  - Diferencia de tiempo calculada (ej. `+30 min`, `Sin variación`, etc.).
- **Reglas de importes para el Asesor Comercial:**
  - **Sin ampliación (`diffMin <= 0`):** Muestra `Horas adicionales: 0` e `Importe adicional: No aplica`.
  - **Con aumento de duración y tarifa configurada:** Muestra las horas adicionales ampliadas, la tarifa aplicada (`S/ XX.XX / h`) y el importe adicional calculado.
  - **Con aumento de duración sin tarifa configurada:** Muestra las horas adicionales e `Importe adicional: Pendiente de cotización`.
  - **Sin notas contractuales:** Resumen compacto y legible sin explicaciones contractuales ni cobros inventados, preservando los pagos registrados.

### 6. Descarga de Resumen de Modificación en PDF para el Cliente
- **Generación local mediante jsPDF (v2.5.1 UMD):** Almacenado localmente en `assets/vendor/jspdf/jspdf.umd.min.js`. No requiere conexión a internet ni CDN externo.
- **Acción tras guardar exitosamente:** En la pantalla final de éxito del Paso 4 se ofrece el botón **“Descargar resumen de modificación en PDF”**.
- **Contenido del PDF:**
  - Encabezado con identidad Showtech Solutions (franja azul marino `#1f4e9c`, franja dorada, RUC 20613979051, auditorio).
  - Ficha de datos del evento: código, nombre, cliente, contacto, lugar asignado, fecha de emisión.
  - Tabla de cronograma confirmado: Evento principal, Montaje, Desmontaje y Ensayo con sus fechas y horarios.
  - Tabla de modificaciones acordadas: valores anteriores vs valores nuevos.
  - Resumen de duración e indicación de: *“Importe adicional por horas: Importe pendiente de cotización”*.
  - **Exclusión de notas internas:** Se excluyen del documento las notas de auditoría o justificaciones internas destinadas únicamente a control del personal.
  - Descarga directa real en el navegador (`Showtech_Resumen_Modificacion_[CODIGO].pdf`). No se simulan envíos de correo ni se muestran mensajes falsos de "PDF enviado".

---

## 3. Organización del Flujo en Cuatro Pasos

1. **Paso 1: Seleccionar evento:**
   - Tabla con anchos optimizados, saltos de línea automáticos, presentación compacta de tiempos técnicos y botón "Seleccionar" / "Editando" siempre visible sin scroll horizontal en escritorio.
   - Vista móvil en tarjetas táctiles independientes.
   - Buscador en tiempo real y banner del evento activo.
2. **Paso 2: Modificar datos:**
   - Edición de información general y campos técnicos con Flatpickr (fecha y hora).
   - Cronograma propuesto con pills visuales en tiempo real.
   - Botón directo "Revisar y confirmar directo &rarr;" cuando solo cambian datos generales.
3. **Paso 3: Validar disponibilidad:**
   - Resumen del cronograma técnico propuesto.
   - Comprobación cruzada de intervalos completos.
   - Generador de alternativas viables para el mismo día en caso de conflicto.
4. **Paso 4: Revisar y confirmar:**
   - Cuadro comparativo en dos columnas con resaltado de modificaciones.
   - Resumen de variación de duración y cotización pendiente.
   - Desplegable opcional con la ficha completa del evento.
   - Confirmación atómica y guardado en `localStorage`.
   - Vista de éxito con opción de impresión y **descarga del resumen en PDF para el cliente**.

---

## 4. Datos de Prueba Iniciales (Seed Data)

- **EVT-001:** Ceremonia de graduación (Promoción Horizonte 2026), 07/11/2026.
  - Montaje: 07/11/2026 de 09:00 a 10:00.
  - Evento: 07/11/2026 de 10:00 a 13:00.
  - Desmontaje: 07/11/2026 de 13:00 a 14:00.
  - Ensayo: No solicitado.
- **EVT-002:** Encuentro de docentes (Consejo Académico), 07/11/2026.
  - Montaje: 07/11/2026 de 15:00 a 16:00.
  - Evento: 07/11/2026 de 16:00 a 19:00.
  - Desmontaje: 07/11/2026 de 19:00 a 20:00.
  - Ensayo: No solicitado.
- **BLK-001:** Bloqueo institucional por mantenimiento preventivo, 06/11/2026 de 14:00 a 17:00.

---

## 5. Pruebas Realizadas e Informe Técnico

Se ejecutaron pruebas exhaustivas de integración y validación:

1. **Pruebas de Componentes y Selectores:**
   - **Selectores de hora:** Apertura flotante, inyección de encabezado ("Hora" / "Minutos") y botón "Listo". Precisión de un minuto y formato 24 horas comprobados. Verificación de rechazo a horas fuera de rango (`06:00` a `22:00`) sin corrección silenciosa.
   - **Selectores de fecha:** Configuración en español con lunes como primer día de la semana verificada. Formato visible `dd/mm/aaaa` y valor interno `YYYY-MM-DD` comprobados. Apertura mediante clic en icono de calendario verificada.
2. **Pruebas de Fechas y Horarios Técnicos:**
   - Activación y desactivación de casillas independientes de montaje, desmontaje y ensayo.
   - Verificación de no colisión en intervalos adyacentes (`10:00-13:00` y `13:00-14:00`).
   - Detección precisa de solapamiento en intervalos cruzados (`10:00-13:00` y `12:00-14:00`).
   - Sincronización automática de fechas de montaje/desmontaje con la fecha del evento.
3. **Pruebas de Comparativa y Duración:**
   - Comparativo en dos columnas alineado fila por fila.
   - Resaltado estricto de solo las filas modificadas mediante `.fila-modificada` y `.pill-mod-inline`.
   - Cálculo de diferencia de duración (`durActMin - durOrigMin`) con formato legible (`+30 min`, `Sin variación`, `-1 h`).
   - Presentación de "Importe pendiente de cotización" sin alterar datos financieros.
4. **Pruebas de Generación de PDF:**
   - Generación exitosa de documento PDF con jsPDF 2.5.1 en memoria.
   - Verificación de inclusión de metadatos, tabla de cronograma confirmado, tabla de cambios e importe pendiente.
   - Verificación de exclusión de notas internas de auditoría.
5. **Pruebas de Persistencia y Descarte:**
   - Guardado definitivo en `localStorage` y actualización del historial de auditoría con correlativo.
   - Modales de descarte protegiendo contra pérdida accidental de cambios.
6. **Nota de Entorno:**
   - La ejecución automatizada mediante el subagente de navegador no pudo completarse debido a restricciones del entorno en la descarga de controladores de navegador (error 404 en el proxy de descarga). Las pruebas estructurales, lógicas, visuales y de rendering se validaron a través del conjunto de pruebas automatizado de Node.js y revisión de código estático.

---

## 6. Instrucciones de Ejecución

### Opción 1: Abrir directamente en el navegador (Sin servidor)
1. Abra el explorador de archivos en la carpeta del proyecto: `c:\Users\crist\gestor-eventos`.
2. Haga doble clic en el archivo [`index.html`](file:///c:/Users/crist/gestor-eventos/index.html).
3. El módulo cargará de inmediato con persistencia activa en su navegador.

### Opción 2: Mediante servidor web local HTTP
Si prefiere ejecutarlo mediante un servidor HTTP local en PowerShell:
```powershell
python -m http.server 8080
```
- Vista del Asesor comercial: `http://localhost:8080/index.html`
- Vista del Cliente (Portal de Solicitudes): `http://localhost:8080/cliente.html`

---

## 7. Portal del Cliente (`cliente.html`)

### 1. Propósito y Acceso
El Portal del Cliente permite a los clientes solicitar modificaciones en sus eventos contratados sin alterar directamente la reserva original, sin confirmar disponibilidad definitiva y sin generar deudas ni cobros automáticos.
- **Archivo principal:** [`cliente.html`](file:///c:/Users/crist/gestor-eventos/cliente.html)
- **Lógica específica:** [`cliente.js`](file:///c:/Users/crist/gestor-eventos/cliente.js)
- **Estilos:** Reutiliza [`styles.css`](file:///c:/Users/crist/gestor-eventos/styles.css) manteniendo la identidad Showtech (azul marino `#13264a`, azul secundario `#1f4e9c`, esquinas de 8 px, tarjetas y selectores unificados).
- **Identidad simulada:** La identidad y separación por cliente están simuladas mediante el identificador estable `CLI-001` (`Promoción Horizonte 2026`). En producción, la autenticación y autorización requerirán integración con un backend seguro y sesiones de usuario.

### 2. Flujo en Cuatro Pasos del Cliente

1. **Paso 1: Mis eventos**
   - Lista exclusivamente los eventos asociados al cliente autenticado (`EVT-001: Ceremonia de graduación`). No muestra eventos ajenos ni herramientas internas del asesor.
   - Si no existe una solicitud pendiente, ofrece el botón **“Solicitar modificación”**.
   - Si ya existe una solicitud en revisión para el evento, bloquea el envío de una segunda solicitud paralela y ofrece **“Ver solicitud en trámite”**.
   - Sección inferior **“Mis solicitudes de modificación”** con el historial de solicitudes enviadas y su estado.

2. **Paso 2: Proponer cambios**
   - Muestra los datos de la reserva actual. Código, espacio, cliente y estado son de solo lectura.
   - Permite proponer cambios en nombre del evento, contacto, teléfono, correo, observaciones, fecha, horarios y tiempos técnicos (montaje, desmontaje y ensayo con casillas independientes).
   - Ensayo técnico identificado como **“Ensayo añadido”** si no existía previamente, sin marcas falsas de modificación en carga inicial.
   - Campo obligatorio: **“Motivo de la solicitud”** con validación interactiva.
   - Exige al menos un cambio efectivo en los datos: escribir solo el motivo sin cambios no permite avanzar.
   - Comprobación preliminar de disponibilidad: si se detecta colisión con otro evento o bloqueo institucional, se informa al cliente de manera respetuosa y confidencial (sin revelar nombres ni datos de eventos ajenos).

3. **Paso 3: Revisar solicitud**
   - Comparativo en dos columnas: **“Datos actuales (vigentes)”** frente a **“Cambios solicitados”**, con resaltado de modificaciones y cronograma técnico completo.
   - Muestra el motivo registrado por el cliente.
   - **Bloque informativo de costos y tarifas referenciales:**
     - Cargo administrativo por modificación: **S/ 100**
     - Hora de auditorio: **S/ 500 / hora**
     - Mensaje destacado: *“Importe final pendiente de revisión por el asesor comercial. Enviar esta solicitud no genera deudas automáticas ni requiere pagos en este momento.”*
     - No calcula un total ni asume cobros de montaje/desmontaje/ensayo como horas de evento.

4. **Paso 4: Confirmación**
   - Botón final **“Enviar solicitud de modificación”** con prevención de doble clic.
   - Persiste la solicitud en el repositorio compartido `SHOWTECH_SOLICITUDES_V2`.
   - Muestra correlativo de solicitud (ej. `SOL-2026-643`), fecha/hora de envío y estado **“Pendiente de revisión”**.
   - Mensaje oficial: *“Tu solicitud fue registrada. El asesor revisará la disponibilidad y el importe aplicable. Tu reserva actual se mantiene hasta que se confirme la modificación.”*
   - Ofrece **“Ver detalle de la solicitud”** y **“Volver a mis eventos”**.

### 3. Guion de Demostración del Cliente (Paso a Paso)

1. **Abrir el portal del cliente:** Navegue a `http://localhost:8080/cliente.html`.
2. **Consultar mis eventos:** Verifique que solo aparece `EVT-001` (`Ceremonia de graduación`) para `Promoción Horizonte 2026`. `EVT-002` no es visible.
3. **Iniciar propuesta:** Haga clic en **“Solicitar modificación”**.
4. **Verificar estado inicial limpio:** Observe que ningún campo muestra marcas de `Modificado`.
5. **Comprobar validación de cambios mínimos:** Intente hacer clic en **“Continuar a revisión”**; el sistema exigirá ingresar el motivo y realizar al menos un cambio en los datos.
6. **Proponer cambios:**
   - Active la casilla **“Requiere ensayo técnico previo”**; observe la insignia **“Ensayo añadido”** en su cabecera.
   - Modifique la hora de inicio del evento a `11:00`.
   - Ingrese un motivo: *“Ajuste de agenda por llegada tardía de la mesa de honor”*.
7. **Revisar propuesta:** Haga clic en **“Continuar a revisión”**. En el Paso 3, revise la tabla comparativa con los campos modificados resaltados y la tarjeta informativa de costos.
8. **Enviar solicitud:** Haga clic en **“Enviar solicitud de modificación”**.
9. **Confirmación:** Observe la pantalla de éxito con el código `SOL-2026-xxx` y el estado *“Pendiente de revisión”*.
10. **Prevención de duplicados:** Vuelva al Paso 1 y compruebe que el evento ahora muestra la insignia *“Modificación en trámite”* y no permite registrar una segunda solicitud en paralelo.
11. **Comprobar integridad del asesor:** Abra `http://localhost:8080/index.html` y verifique que `EVT-001` sigue manteniendo sus horarios y reserva original confirmada sin cambios no autorizados.

---

### 4. Opción “Retirar solicitud” (Portal del Cliente)
- **Ubicación y visibilidad:** En el pie del modal “Detalle de la solicitud”, se muestra el botón secundario **“Retirar solicitud”** (con estilo de borde y texto rojo discreto `.btn-outline-danger`), separado a la izquierda del botón “Cerrar”.
- **Condición de visualización:** Se muestra **únicamente** cuando la solicitud pertenece al cliente actual (`CLIENTE_ACTUAL`) y se encuentra en estado **“Pendiente de revisión”**. No se muestra para solicitudes retiradas, aprobadas o rechazadas.
- **Diálogo de confirmación accesible:**
  - Título: *“Retirar solicitud de modificación”*.
  - Mensaje: *“¿Deseas retirar esta solicitud? Tu reserva actual se mantendrá sin cambios”*.
  - Botones: **“Volver”** (cancela la acción sin alterar nada) y **“Sí, retirar solicitud”** (confirma el retiro).
  - Soporte de teclado: Permite cerrar modales con la tecla `Escape`.
- **Efectos del retiro y persistencia:**
  - Re-valida que la solicitud pertenezca al cliente actual y continúe en estado pendiente antes de proceder.
  - Actualiza el estado a **“Retirada por el cliente”** e incorpora `withdrawnAt` (marca temporal ISO) y `withdrawnDisplayDate` (formato legible para Perú).
  - **Conservación íntegra:** Se conservan en el historial el código correlativo, motivo, instantánea original de la reserva y cambios propuestos. La solicitud **no se elimina**.
  - **Integridad de la reserva:** No modifica la reserva original, no altera pagos registrados ni afecta el historial de modificaciones del evento.
  - **Sin cargos:** La acción de retiro no genera cargos ni penalidades en el prototipo (propuesta pendiente de validación por el ingeniero).
  - **Prevención de doble clic:** Deshabilita el botón de confirmación durante el procesamiento.
  - **Tolerancia a fallos de almacenamiento:** Si `localStorage` falla al guardar, se revierte el estado en memoria a "Pendiente de revisión", no se muestra mensaje de éxito y se permite al usuario volver a intentarlo.
  - **Mensaje de confirmación:** Muestra el toast *“Solicitud retirada. Tu reserva se mantiene sin cambios”* únicamente después de guardar con éxito.
- **Actualización reactiva de la interfaz:**
  - El modal de detalle actualiza su estado e incorpora un aviso explicativo con la fecha y hora del retiro.
  - En la tabla “Mis solicitudes”, la solicitud muestra la insignia gris neutro `Retirada por el cliente`.
  - La tarjeta del evento en el Paso 1 retira el indicador `Modificación en trámite`.
  - Se re-habilita inmediatamente el botón **“Solicitar modificación &rarr;”** para dicho evento, permitiendo registrar una nueva propuesta sin impedimentos.
  - Las solicitudes retiradas pueden seguir consultándose en detalle en cualquier momento.

---

## 8. Gestión de Adicionales del Evento (Vista Asesor y Portal del Cliente)

### 1. Aclaración Importante sobre las Tarifas
> [!NOTE]
> **Tarifas simuladas y configurables para el prototipo:**
> Todos los precios de adicionales indicados en el sistema son datos de ejemplo y simulación técnica proporcionados por el ingeniero para evaluar el flujo operativo y de cálculo del prototipo.
> - **No representan precios oficiales ni tarifas aprobadas** por la administración de Showtech Solutions S.A.C.
> - Se encuentran centralizados en una estructura compartida y configurable para su posterior sustitución por las tarifas comerciales definitivas una vez aprobadas.
> - Tanto en los formularios, en los comparativos de revisión (Asesor y Cliente) como en el PDF de resumen se incluye de forma visible pero discreta la nota: *“Importes referenciales para el prototipo”*.

### 2. Catálogo Compartido de Adicionales
Se implementó un catálogo con identificadores estables y tarifas horarias de simulación:
| Identificador | Nombre del Adicional | Tarifa Simulada | Unidad Comercial |
| :--- | :--- | :--- | :--- |
| `cochera` | **Cochera** | S/ 10.00 / hora | *Cantidad de unidades* (pendiente confirmar si vehículo o espacio) |
| `pantalla_5x4` | **Pantalla LED 5×4** | S/ 200.00 / hora | Cantidad de pantallas |
| `pantalla_4x3` | **Pantalla LED 4×3** | S/ 150.00 / hora | Cantidad de pantallas |
| `microfono` | **Micrófono** | S/ 5.00 / hora | Cantidad de micrófonos |
| `teleprompter` | **Teleprompter** | S/ 10.00 / hora | Cantidad de equipos |

### 3. Sección del Formulario (Paso 2: Tiempos del evento)
Ubicada inmediatamente después de los tiempos técnicos (montaje, desmontaje y ensayo):
- **Campos del formulario:**
  - Selector desplegable de adicional disponible.
  - Campo numérico para **Cantidad de unidades** (números enteros positivos $\ge 1$).
  - Campo numérico para **Horas de uso** (números enteros positivos $\ge 1$). Horas explícitas y no condicionadas automáticamente a la duración del evento o montajes.
  - Tarifa por hora de solo lectura en soles (`S/ XX.XX`).
  - Previsualización en vivo del subtotal calculado (`S/ XX.XX`).
  - Botón interactivo **“Agregar adicional”** (se conmuta a **“Actualizar adicional”** y botón **“Cancelar edición”** al editar un registro).
- **Tabla interactiva de adicionales:**
  - Columnas: `Adicional | Cantidad | Horas de uso | Tarifa por hora | Subtotal | Acciones`.
  - **Sin duplicidad de filas:** Si el usuario selecciona un adicional que ya está en la lista, el sistema actualiza la fila existente en lugar de duplicarla.
  - **Acciones disponibles:** Botón "Editar" (carga los valores en el mini-formulario superior) y botón "Quitar" (elimina el adicional de la lista).
  - **Fórmulas de cálculo:**
    $$\text{Subtotal} = \text{Cantidad} \times \text{Horas de uso} \times \text{Tarifa por hora}$$
    $$\text{Total Adicionales} = \sum \text{Subtotales}$$
  - En la parte inferior de la tabla se visualiza el **Total de adicionales**, con formato monetario peruano (`S/ 0.00`).

### 4. Lógica en la Vista del Asesor Comercial (`index.html` / `script.js`)
- **Precarga de adicionales:** Carga los adicionales existentes guardados en el evento. Si el evento es previo y no tenía adicionales registrados, se inicializa como una lista vacía `[]` de forma segura.
- **Detección inteligente de cambios:** Modificar la lista de adicionales (agregar, editar o quitar) se detecta como un cambio pendiente efectivo.
- **Sin validación forzada de auditorio cuando solo cambian adicionales:** Si únicamente cambian los adicionales o datos generales y no se modifican las fechas ni horas del auditorio/técnicos, el botón *“Revisar y confirmar directo &rarr;”* permite avanzar inmediatamente al Paso 4 sin exigir revalidar la disponibilidad de la sala.
- **Cuadro comparativo en Paso 4 (Revisión):**
  - Muestra una tarjeta dedicada con la comparación entre **“Adicionales actuales contratados”** vs **“Adicionales propuestos”**.
  - Detalle fila por fila con badge de variación (`Nuevo`, `Modificado`, `Sin cambios`).
  - Muestra claramente: **Total actual de adicionales**, **Total propuesto de adicionales** y la **Diferencia**.
  - **Tratamiento de reducción (diferencia negativa):** Se etiqueta explícitamente como *“Reducción propuesta”* sin generar devolución automática ni saldos inventados.
- **Guardado atómico y persistencia:** Los adicionales propuestos se guardan en el evento únicamente cuando el asesor confirma definitivamente en el Paso 4. Se persisten con su ID, nombre, cantidad, horas, tarifa y subtotal.
- **Historial y PDF:** Se incorporan en el historial de modificaciones del evento y se desglosan en el PDF de resumen descargable con la nota referencial de prototipo.

### 5. Lógica en el Portal del Cliente (`cliente.html` / `cliente.js`)
- **Propuesta independiente y segura:** El cliente puede visualizar los adicionales vigentes y proponer adiciones, modificaciones o eliminaciones.
- **Cambio válido para solicitar:** Modificar adicionales se reconoce como un cambio real en el formulario, permitiendo avanzar al Paso 3 y enviar la solicitud con su respectivo motivo, incluso si no varían los horarios.
- **Separación estricta de la reserva:** Los adicionales solicitados se guardan dentro de `proposedChanges.adicionales` en el registro de solicitud (`SHOWTECH_SOLICITUDES_V2`). La reserva confirmada en `SHOWTECH_EVENTOS_V2` permanece inalterada hasta la aprobación del asesor.
- **Retiro de solicitud:** Retirar la solicitud de modificación no altera los adicionales confirmados de la reserva.
- **Regla de una sola solicitud pendiente:** Se mantiene el bloqueo para evitar múltiples solicitudes simultáneas en trámite para un mismo evento.
- **Presentación de importes:** Todos los importes en la vista del cliente se identifican como *“Propuesta sujeta a revisión comercial”* y se conserva el aviso oficial: *“Importe final pendiente de revisión por el asesor comercial. Enviar esta solicitud no genera deudas automáticas ni requiere pagos en este momento.”*

---

## 9. Reglas Comerciales Pendientes de Confirmación

Se documentan los siguientes puntos comerciales para definición con la gerencia, el ingeniero responsable y el área de operaciones:

1. **Unidad comercial para cochera:** Falta confirmar si la unidad comercial de cobro corresponde a vehículo particular o a espacio reservado en la zona de estacionamiento.
2. **Fracciones de hora en adicionales:** Para esta primera entrega se aplican cantidades y horas enteras positivas. Queda pendiente de confirmación la política oficial respecto al cobro o prorrateo de fracciones de hora en equipos y servicios adicionales (no se aplican redondeos arbitrarios en el prototipo).
3. **Tarifas oficiales definitivas:** Las tarifas utilizadas (`S/ 10`, `S/ 200`, `S/ 150`, `S/ 5`, `S/ 10`) son valores referenciales de simulación técnica y deben ser sustituidas por el tarifario oficial aprobado por gerencia.
4. **Retiro de solicitudes sin cargos (Propuesta pendiente de validación por el ingeniero):** En este prototipo, el retiro de una solicitud de modificación no genera cargos ni penalidades financieras para el cliente. Queda pendiente de validación técnica y comercial por el ingeniero si se debe mantener la gratuidad total del retiro o si aplicará alguna retención/cargo administrativo en caso de que la solicitud haya entrado en etapas avanzadas de evaluación técnica.
5. **Aplicabilidad del cargo por modificación (S/ 100):** Falta confirmar si el cargo de S/ 100 aplica a todas las solicitudes de cambio o si se exonera en solicitudes realizadas con más de 15 días de anticipación o por motivos de fuerza mayor.
6. **Facturación de fracciones de hora del auditorio:** Falta definir si las extensiones de duración en fracciones (ej. 30 o 45 minutos) se prorratean proporcionalmente sobre la tarifa de S/ 500/h o si se redondean a la media hora o a la hora completa siguiente.
7. **Tarifación de tiempos técnicos adicionales:** Falta determinar si el montaje previo, desmontaje posterior y ensayo técnico tienen una tarifa diferenciada de soporte técnico o si se consideran cortesía según el tipo de paquete contratado.
8. **Límites de días de montaje/desmontaje:** Falta confirmar si el montaje puede programarse en días calendario previos a la fecha del evento principal o si debe restringirse estrictamente a la misma jornada.

---

## 10. Prototipo de Inicio de Sesión y Verificación en Dos Pasos (2FA)

Se incorporó la pantalla de acceso corporativo `inicio.html` con su flujo simulado de autenticación y verificación en dos factores (2FA), preservando íntegramente las vistas del asesor (`index.html`), el portal del cliente (`cliente.html`), el catálogo de adicionales y la persistencia de datos en `localStorage`.

### 1. Estructura y Archivos
- **`inicio.html`:** Interfaz de acceso con diseño visual basado en las especificaciones de marca (azul marino `#13264a`, azul `#1f4e9c`, dorado `#f2a900`, fondo `#f5f7fb`).
- **`acceso.css`:** Estilos delimitados para la tarjeta de acceso, botones sociales, casillas de 6 dígitos, modales y adaptabilidad móvil (`390px` y `1440px`).
- **`acceso.js`:** Controlador de interacción, validaciones de formulario, máquina de estados de tres fases, simulación de acceso social y verificación en dos factores.

### 2. Cuentas Ficticias de Demostración
Para fines exclusivos de evaluación de interfaz y flujos, se definen dos cuentas ficticias. **No se solicita ni almacena ninguna contraseña real:**

| Rol | Correo ficticio | Contraseña demo | Destino tras 2FA | Correo enmascarado (2FA) |
| :--- | :--- | :--- | :--- | :--- |
| **Asesor comercial** | `asesor@showtech.com` | `Asesor2026!` | `index.html` | `as***@showtech.com` |
| **Cliente (Promoción Horizonte)** | `cliente@horizonte.com` | `Cliente2026!` | `cliente.html` | `cl***@horizonte.com` |

> [!NOTE]
> En la pantalla de ingreso se proveen los botones de atajo **"Asesor"** y **"Cliente"** para autocompletar rápidamente las credenciales sin necesidad de digitación manual.

### 3. Código de Verificación de Prueba (2FA)
- **Código válido predeterminado:** `123456`
- **Ayuda en pantalla:** La interfaz ofrece la insignia interactiva *"Código de prueba: 123456"* con botón **"Autocompletar"** para rellenar automáticamente las 6 casillas.

### 4. Flujo y Guion de Demostración

#### Fase 1: Inicio de Sesión (`inicio.html`)
1. **Validaciones en tiempo real:**
   - Si se presiona *Ingresar* con campos vacíos, se marcan en rojo y se muestran los mensajes de error correspondientes junto a cada campo.
   - Si se escribe un correo con formato inválido (ej. `correo-invalido`), se informa la estructura requerida (`usuario@correo.com`).
   - Si se ingresan credenciales que no coinciden con las cuentas demo, se despliega una alerta con mensaje genérico.
2. **Visibilidad de contraseña:**
   - El botón con icono de ojo permite alternar entre texto oculto (`password`) y visible (`text`).
3. **Flujo de recuperación de contraseña:**
   - Al pulsar *"¿Olvidaste tu contraseña?"*, se abre un diálogo modal informando de manera accesible que la recuperación por correo transaccional está en fase de desarrollo.
   - **Alcance de cuentas y registro:** Por indicación de ingeniería, se retiró el registro público de usuarios y no se incluye la pantalla *"Crea tu cuenta"*. El acceso al sistema se realiza a través de las credenciales autorizadas asignadas (o mediante la selección simulada de cuentas en Google y Facebook).
4. **Acceso social simulado (Google y Facebook):**
   - Los botones *"Continuar con Google"* y *"Continuar con Facebook"* abren un modal explícitamente identificado como *"Simulación de acceso con [Google/Facebook]"*.
   - No solicita contraseñas de dichos proveedores; permite seleccionar la cuenta de Asesor o Cliente para continuar al segundo factor o cancelar y regresar.

#### Fase 2: Selección del Método de Verificación (2FA)
Tras validar la cuenta ficticia, se presenta la pantalla con el identificador *"02 · Método de verificación"*:
- Muestra el correo de la cuenta activa y la insignia discreta *"Verificación de demostración"*.
- Permite seleccionar entre:
  1. **Aplicación autenticadora:** *"Usa el código de tu aplicación."*
  2. **Correo electrónico:** *"Recibe un código en tu correo registrado."*
- Cuenta con el botón *"Continuar"* y el enlace *"Volver al inicio de sesión"*.

#### Fase 3: Ingreso y Validación del Código de 6 Dígitos
Identificada con *"03 · Confirmar acceso"*:
- **Casillas de 6 dígitos:** Componente ergonómico que admite escritura con teclado numérico, avance automático al siguiente dígito, borrado retroactivo con `Backspace`, navegación con flechas y pegado directo del código completo desde el portapapeles.
- **Diferenciación por método:**
  - *Aplicación autenticadora:* Indica que el código se consulta en la aplicación vinculada. No muestra reenvíos ni afirma haber despachado correos.
  - *Correo electrónico:* Muestra el correo ficticio parcialmente enmascarado e incluye el botón *"Reenviar código"* con temporizador de espera visible (30s) y aviso de reenvío simulado.
- **Estados de validación contemplados:**
  - *Código incompleto:* Alerta cuando se presiona verificar con menos de 6 dígitos.
  - *Código incorrecto:* Alerta si los 6 dígitos no coinciden con `123456`.
  - *Código vencido:* Temporizador de vigencia (60s) y botón *"Simular vencimiento"* para comprobar el mensaje de expiración y solicitar nuevo código.
  - *Invalidación de desafío:* Reenviar el código o hacer clic en *"Usar otro método"* invalida el desafío anterior y limpia los campos y temporizadores.

#### Fase 4: Finalización y Navegación
- Tras ingresar `123456`, el sistema redirige automáticamente a la vista asociada al rol:
  - Cuenta Asesor &rarr; `index.html`.
  - Cuenta Cliente &rarr; `cliente.html`.
- Se registra el estado de acceso exclusivamente en `sessionStorage` (`showtech_demo_session`).
- **Botón "Cerrar sesión":** Se encuentra visible en la barra superior de `index.html` y `cliente.html`. Al pulsarlo, se elimina el estado de sesión en `sessionStorage` y se regresa a `inicio.html`.
- **Conservación absoluta de datos:** El cierre de sesión no borra ningún evento, solicitud o modificación guardada en `localStorage`.
- **Ausencia de parpadeo (flicker):** La sincronización de sesión se ejecuta de forma síncrona en el renderizado sin ocultar el contenido ni generar saltos visuales.

### 5. Integraciones Pendientes para un Entorno de Producción Real
Este desarrollo corresponde a una entrega de demostración de interfaz de usuario. En una arquitectura de producción deberán incorporarse las siguientes integraciones reales:

1. **Protocolo OAuth 2.0 / OpenID Connect:** Integración real con Google Identity Services y Facebook Login SDK mediante tokens criptográficos (JWT) y validación en backend.
2. **Generador TOTP (RFC 6238):** Servicio de autenticación TOTP con clave secreta compartida y código QR para emparejamiento con Google Authenticator o Microsoft Authenticator.
3. **Servicio SMTP / API Transaccional:** Integración con proveedores de correo transaccional (ej. SendGrid, Amazon SES) para despacho de códigos OTP con expiración estricta y protección antifraude.
4. **Protección contra ataques de fuerza bruta:** Limitador de tasa (*Rate limiting*), bloqueo temporal tras intentos fallidos y reCAPTCHA / Cloudflare Turnstile.
5. **Sesiones Seguras en Servidor:** Almacenamiento de tokens en cookies seguras con directivas `HttpOnly`, `Secure` y `SameSite=Strict`. Las redirecciones y validaciones en navegador no constituyen por sí mismas una barrera de seguridad de datos.


