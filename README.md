# SHOWTECH SOLUTIONS &bull; Módulo “Modificar datos del evento”
### Gestión Operativa de Auditorio &bull; Panel de Administración

Este proyecto implementa el prototipo funcional y de diseño del módulo administrativo **“Modificar datos del evento”** para el **Auditorio Showtech**, adaptado visual y estructuralmente con base en los estándares corporativos de **Showtech Solutions** y el flujo guiado en cuatro pasos.

Desarrollado con **HTML5 semántico, CSS3 y JavaScript puro (Vanilla JS / ES6+)**, sin frameworks, sin librerías de terceros y con persistencia en `localStorage`.

---

## 1. Identidad Visual y Estilo

- **Paleta de marca corporativa:**
  - Azul marino principal: `#13264a`
  - Azul secundario: `#1f4e9c`
  - Dorado de acento: `#f2a900`
  - Fondo general: `#f5f7fb`
  - Lavanda suave: `#eef1fb`
  - Verde de confirmación / éxito: `#1e8e5a`
  - Rojo de error / conflicto: `#c0392b`
- **Tipografía y acabados:**
  - Familia tipográfica limpia: `Arial, Helvetica, sans-serif`.
  - Tarjetas blancas estructuradas (`#ffffff`) con bordes suaves (`#d9deea`) y esquinas redondeadas (8–10 px).
  - Iconos vectoriales SVG limpios con dimensiones explícitas normalizadas (18–24 px).
  - Sin menús de módulos inexistentes ni elementos decorativos innecesarios.
  - Diseño totalmente adaptable (responsive) para escritorio, tablet y dispositivos móviles.

---

## 2. Organización del Módulo en Cuatro Pasos

El flujo de trabajo se organiza en una barra superior interactiva de cuatro fases secuenciales:

1. **Paso 1: Seleccionar evento:**
   - Tabla responsiva con listado de eventos registrados y buscador en tiempo real por código, cliente o nombre de evento.
   - Indicadores visuales de estado (`Confirmado`, `Con adelanto`, `Pagado`).
   - Botón de selección y banner informativo del evento cargado actualmente para edición.
2. **Paso 2: Modificar datos:**
   - Código del evento y Auditorio asignado (`Auditorio Showtech`) fijos en modo solo lectura (`readonly`).
   - Edición de información general: Nombre de la convocatoria, Cliente, Persona de contacto, Teléfono, Correo, Solicitado por (`Cliente` / `Asesor comercial`) y Observaciones.
   - Edición de fecha y horario del evento (06:00 a 22:00, mismo día).
   - Tiempos técnicos independientes:
     - **Requiere montaje previo:** Despliega hora de inicio; finaliza al iniciar el evento.
     - **Requiere desmontaje posterior:** Despliega hora de fin; inicia al terminar el evento.
     - **Requiere ensayo técnico previo:** Despliega fecha, hora inicio y fin; debe finalizar antes del evento y no cruzarse con su montaje.
   - Insignias visuales discretas `Modificado` para rastrear campos alterados.
   - Botón directo **“Revisar y confirmar directo &rarr;”** activo cuando únicamente cambian datos generales sin alteración de horarios.
3. **Paso 3: Validar disponibilidad:**
   - Ficha resumen de la franja total solicitada (montaje, evento, desmontaje, ensayo).
   - Botón de comprobación contra otros eventos registrados y bloqueos institucionales (`BLK-001`).
   - Exclusión automática del evento actual evaluado.
   - Admisión de intervalos consecutivos: eventos que finalizan exactamente a la misma hora en que otro inicia (`finA === inicioB`) no generan conflicto.
   - Detección precisa de solapes con reporte detallado.
   - **Sugerencias de horarios alternativos:** En caso de colisión, calcula hasta 3 opciones viables para el mismo día manteniendo la duración requerida, con botón para aplicar al formulario sin guardado automático.
4. **Paso 4: Revisar y confirmar:**
   - **Resumen de diferencias (Diff):** Tabla comparativa entre el valor anterior registrado y el nuevo valor propuesto.
   - **Ficha / Comprobante de modificación:** Con marca de agua `BORRADOR` antes de guardar, datos fiscales de la empresa (RUC 20613979051) y resumen integral.
   - Campo opcional para ingresar el motivo de la modificación con fines de auditoría.
   - **Revalidación atómica:** Antes de consolidar el guardado definitivo, vuelve a comprobar que los horarios sigan libres de conflicto. Ante cualquier colisión, se conservan los datos guardados originales y se cancela la operación.
   - Al confirmar, almacena en `localStorage`, actualiza el historial de auditoría y genera el comprobante final con correlativo y opción de impresión.

---

## 3. Datos de Prueba Iniciales (Seed Data)

- **EVT-001:** Ceremonia de graduación (Promoción Horizonte 2026), 07/11/2026, montaje desde 09:00, evento de 10:00 a 13:00 y desmontaje hasta 14:00.
- **EVT-002:** Encuentro de docentes (Consejo Académico), 07/11/2026, montaje desde 15:00, evento de 16:00 a 19:00 y desmontaje hasta 20:00.
- **BLK-001:** Bloqueo institucional por mantenimiento preventivo e iluminación en Auditorio Showtech, 06/11/2026 de 14:00 a 17:00.

---

## 4. Instrucciones de Uso y Ejecución

### Opción 1: Abrir directamente en el navegador (Sin servidor)
1. Abra el explorador de archivos en la carpeta del proyecto: `c:\Users\crist\gestor-eventos`.
2. Haga doble clic en el archivo [`index.html`](file:///c:/Users/crist/gestor-eventos/index.html).
3. El módulo cargará de inmediato con persistencia activa en su navegador.

### Opción 2: Mediante servidor web local HTTP
Si prefiere ejecutarlo mediante un servidor HTTP local en PowerShell:
```powershell
python -m http.server 8080
```
Y acceda a: `http://localhost:8080/index.html`.

---

## 5. Guía de Demostración del Flujo Completo

### Demostración 1: Navegación y modificación de datos generales sin verificación de horarios
1. En el **Paso 1**, seleccione el evento **EVT-001** o haga clic en **“Continuar con este evento &rarr;”**.
2. En el **Paso 2**, modifique el campo **Persona de contacto** por `Lic. Sofía Alarcón` y el **Teléfono** por `991 223 344`.
3. Note cómo aparece la etiqueta amarilla `Modificado` junto a dichos campos y se activa el botón verde **“Revisar y confirmar directo &rarr;”**.
4. Haga clic en **“Revisar y confirmar directo &rarr;”**: el sistema permite pasar directamente al **Paso 4** sin exigir validación de horarios, mostrando en la tabla de diferencias los campos modificados.

### Demostración 2: Tiempos técnicos independientes y validación disponible
1. En el **Paso 2**, desactive la casilla **“Requiere desmontaje posterior”**.
2. Observe que el cronograma propuesto elimina la franja de desmontaje, manteniendo únicamente el montaje (`09:00 - 10:00`) y el evento (`10:00 - 13:00`).
3. Avance al **Paso 3** haciendo clic en **“Validar disponibilidad &rarr;”**.
4. Haga clic en **“Comprobar disponibilidad en auditorio”**: el sistema confirma con el aviso verde **`✓ Horario disponible en Auditorio Showtech`** y habilita el botón **“Continuar a revisión y confirmación &rarr;”**.

### Demostración 3: Conflicto de disponibilidad y sugerencias de horarios
1. En el **Paso 2**, cambie el horario del evento para que inicie a las `16:00` y finalice a las `19:00` (horario en el que transcurre el evento `EVT-002`).
2. Avance al **Paso 3** y haga clic en **“Comprobar disponibilidad en auditorio”**.
3. El sistema desplegará el panel de conflicto en rojo detallando el cruce con `EVT-002: Encuentro de docentes` y generará la caja de **“Horarios alternativos disponibles para el mismo día”**.
4. Al pulsar **“Aplicar este horario”** en cualquiera de las sugerencias, los campos se actualizan sin guardar automáticamente y se revalida la disponibilidad quedando en verde.

### Demostración 4: Admisión de intervalos consecutivos
1. En el evento **EVT-001**, configure el fin de desmontaje exactamente a las `15:00`.
2. Dado que **EVT-002** inicia su montaje a las `15:00`, compruebe la disponibilidad en el **Paso 3**.
3. El sistema valida exitosamente la franja como disponible, demostrando que dos eventos consecutivos en frontera (`15:00`) no colisionan.

### Demostración 5: Descarte seguro y confirmación de guardado con historial
1. Al intentar descartar cambios en el Paso 2 o Paso 4, el modal de confirmación protege los datos evitando pérdidas accidentales.
2. Al pulsar **“Confirmar y guardar cambios”** en el Paso 4:
   - Se realiza la comprobación final de disponibilidad.
   - Se guardan los datos en `localStorage`.
   - Se emite el comprobante definitivo y se anota el cambio en el **Historial de auditoría**.
   - Al recargar la página (`F5`), todos los cambios y el historial permanecen intactos.
3. Para volver al estado inicial de pruebas en cualquier momento, use el botón **“Restablecer demo”** en el encabezado.
