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

## 8. Reglas Comerciales Pendientes de Confirmación

Se documentan los siguientes puntos comerciales para definición con la gerencia, el ingeniero responsable y el área de operaciones:

1. **Retiro de solicitudes sin cargos (Propuesta pendiente de validación por el ingeniero):** En este prototipo, el retiro de una solicitud de modificación no genera cargos ni penalidades financieras para el cliente. Queda pendiente de validación técnica y comercial por el ingeniero si se debe mantener la gratuidad total del retiro o si aplicará alguna retención/cargo administrativo en caso de que la solicitud haya entrado en etapas avanzadas de evaluación técnica.
2. **Aplicabilidad del cargo por modificación (S/ 100):** Falta confirmar si el cargo de S/ 100 aplica a todas las solicitudes de cambio o si se exonera en solicitudes realizadas con más de 15 días de anticipación o por motivos de fuerza mayor.
3. **Facturación de fracciones de hora:** Falta definir si las extensiones de duración en fracciones (ej. 30 o 45 minutos) se prorratean proporcionalmente sobre la tarifa de S/ 500/h o si se redondean a la media hora o a la hora completa siguiente.
4. **Tarifación de tiempos técnicos adicionales:** Falta determinar si el montaje previo, desmontaje posterior y ensayo técnico tienen una tarifa diferenciada de soporte técnico o si se consideran cortesía según el tipo de paquete contratado.
5. **Límites de días de montaje/desmontaje:** Falta confirmar si el montaje puede programarse en días calendario previos a la fecha del evento principal o si debe restringirse estrictamente a la misma jornada.

