/**
 * ==========================================================================
 * SHOWTECH SOLUTIONS - GESTOR DE EVENTOS
 * Módulo: Modificar datos del evento
 * Tecnologías: JavaScript Puro (ES6+), HTML5, CSS3
 * ==========================================================================
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Constantes y Configuración de Datos Iniciales
  // =========================================================================
  const STORAGE_KEYS = {
    EVENTS: 'SHOWTECH_EVENTOS_V2',
    HISTORY: 'SHOWTECH_HISTORIAL_V2'
  };

  const REGULAR_HOURS = {
    START_MINUTES: 6 * 60,   // 06:00
    END_MINUTES: 22 * 60     // 22:00
  };

  // Datos de fábrica según requerimientos
  const INITIAL_EVENTS = [
    {
      id: 'EVT-001',
      code: 'EVT-001',
      name: 'Ceremonia de graduación',
      client: 'Promoción Horizonte 2026',
      contact: 'María Rodríguez',
      phone: '998 765 432',
      email: 'm.rodriguez@horizonte2026.edu',
      requestedBy: 'Cliente',
      notes: 'Disposición de silletería para 350 personas, atril central y 2 micrófonos inalámbricos.',
      space: 'Auditorio Showtech',
      status: 'Confirmado',
      date: '2026-11-07',
      startTime: '10:00',
      endTime: '13:00',
      hasMontaje: true,
      montajeStart: '09:00',
      hasDesmontaje: true,
      desmontajeEnd: '14:00',
      hasEnsayo: false,
      ensayoDate: '',
      ensayoStart: '',
      ensayoEnd: ''
    },
    {
      id: 'EVT-002',
      code: 'EVT-002',
      name: 'Encuentro de docentes',
      client: 'Consejo Académico',
      contact: 'Prof. Carlos Duarte',
      phone: '997 654 321',
      email: 'c.duarte@colegio.edu',
      requestedBy: 'Asesor comercial',
      notes: 'Proyección multimedia activa, sonido ambiental y mesa principal con 6 micrófonos.',
      space: 'Auditorio Showtech',
      status: 'Confirmado',
      date: '2026-11-07',
      startTime: '16:00',
      endTime: '19:00',
      hasMontaje: true,
      montajeStart: '15:00',
      hasDesmontaje: true,
      desmontajeEnd: '20:00',
      hasEnsayo: false,
      ensayoDate: '',
      ensayoStart: '',
      ensayoEnd: ''
    }
  ];

  // Bloqueos institucionales programados
  const INSTITUTIONAL_BLOCKS = [
    {
      id: 'BLK-001',
      title: 'Mantenimiento preventivo e iluminación institucional',
      space: 'Auditorio Showtech',
      date: '2026-11-06',
      startTime: '14:00',
      endTime: '17:00',
      type: 'Bloqueo institucional',
      notes: 'Calibración de consolas de audio digital, reflectores y cambio de lámparas.'
    }
  ];

  // =========================================================================
  // 2. Estado de la Aplicación
  // =========================================================================
  let eventsData = [];
  let historyData = {};
  let currentEventId = 'EVT-001';
  let originalSnapshot = null;
  let isAvailabilityVerified = false;
  let pasoActual = 1;
  let pendingSwitchEventId = null;
  let lastConflictAlternatives = [];

  // =========================================================================
  // 3. Referencias al DOM
  // =========================================================================
  const $ = id => document.getElementById(id);

  const dom = {
    // Header y Demo
    btnResetDemo: $('btnResetDemo'),
    
    // Paso 1
    buscar: $('buscar'),
    tablaEventos: $('tablaEventos'),
    contadorEventos: $('contadorEventos'),
    bannerTextoEvento: $('bannerTextoEvento'),
    avisoPaso1: $('avisoPaso1'),

    // Paso 2 (Formulario)
    badgeEventoPaso2: $('badgeEventoPaso2'),
    eventCode: $('eventCode'),
    eventSpace: $('eventSpace'),
    eventName: $('eventName'),
    eventClient: $('eventClient'),
    eventContact: $('eventContact'),
    eventPhone: $('eventPhone'),
    eventEmail: $('eventEmail'),
    requestedBy: $('requestedBy'),
    eventNotes: $('eventNotes'),

    eventDate: $('eventDate'),
    eventStartTime: $('eventStartTime'),
    eventEndTime: $('eventEndTime'),

    chkMontaje: $('chkMontaje'),
    fieldsMontaje: $('fieldsMontaje'),
    montajeStartTime: $('montajeStartTime'),

    chkDesmontaje: $('chkDesmontaje'),
    fieldsDesmontaje: $('fieldsDesmontaje'),
    desmontajeEndTime: $('desmontajeEndTime'),

    chkEnsayo: $('chkEnsayo'),
    fieldsEnsayo: $('fieldsEnsayo'),
    ensayoDate: $('ensayoDate'),
    ensayoStartTime: $('ensayoStartTime'),
    ensayoEndTime: $('ensayoEndTime'),

    resumenHorarioItems: $('resumenHorarioItems'),
    errorPaso2: $('errorPaso2'),
    btnAvanzarPaso2: $('btnAvanzarPaso2'),
    btnDirectoRevision: $('btnDirectoRevision'),
    btnDescartarPaso2: $('btnDescartarPaso2'),

    // Insignias Modificado
    modBadgeEventName: $('modBadgeEventName'),
    modBadgeEventClient: $('modBadgeEventClient'),
    modBadgeEventContact: $('modBadgeEventContact'),
    modBadgeEventPhone: $('modBadgeEventPhone'),
    modBadgeEventEmail: $('modBadgeEventEmail'),
    modBadgeRequestedBy: $('modBadgeRequestedBy'),
    modBadgeEventNotes: $('modBadgeEventNotes'),
    modBadgeEventDate: $('modBadgeEventDate'),
    modBadgeEventStartTime: $('modBadgeEventStartTime'),
    modBadgeEventEndTime: $('modBadgeEventEndTime'),
    modBadgeMontajeStart: $('modBadgeMontajeStart'),
    modBadgeDesmontajeEnd: $('modBadgeDesmontajeEnd'),
    modBadgeEnsayoDate: $('modBadgeEnsayoDate'),
    modBadgeEnsayoStart: $('modBadgeEnsayoStart'),
    modBadgeEnsayoEnd: $('modBadgeEnsayoEnd'),

    // Paso 3 (Validar)
    detalleHorarioValidar: $('detalleHorarioValidar'),
    btnCheckAvailability: $('btnCheckAvailability'),
    availabilityFeedback: $('availabilityFeedback'),
    feedbackTitle: $('feedbackTitle'),
    feedbackMessage: $('feedbackMessage'),
    feedbackDetails: $('feedbackDetails'),
    scheduleSuggestionsContainer: $('scheduleSuggestionsContainer'),
    suggestionsList: $('suggestionsList'),
    btnContinuarPaso4: $('btnContinuarPaso4'),

    // Paso 4 (Revisar y Confirmar)
    vistaRevision: $('vistaRevision'),
    vistaExito: $('vistaExito'),
    diffTableContainer: $('diffTableContainer'),
    comprobante: $('comprobante'),
    comprobanteFinal: $('comprobanteFinal'),
    modificationReason: $('modificationReason'),
    errorPaso4: $('errorPaso4'),
    btnDescartarFinal: $('btnDescartarFinal'),
    btnConfirmSave: $('btnConfirmSave'),
    avisoFinal: $('avisoFinal'),

    // Historial
    countHistorial: $('countHistorial'),
    historyListContainer: $('historyListContainer'),

    // Modales
    confirmDiscardModal: $('confirmDiscardModal'),
    btnCloseDiscardModal: $('btnCloseDiscardModal'),
    btnStayOnForm: $('btnStayOnForm'),
    btnConfirmDiscard: $('btnConfirmDiscard'),

    confirmResetModal: $('confirmResetModal'),
    btnCloseResetModal: $('btnCloseResetModal'),
    btnCancelResetModal: $('btnCancelResetModal'),
    btnConfirmResetDemo: $('btnConfirmResetDemo'),

    toastContainer: $('toastContainer')
  };

  // =========================================================================
  // 4. Utilidades de Formato y Tiempo
  // =========================================================================
  function timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return -1;
    const parts = timeStr.split(':');
    if (parts.length < 2) return -1;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    return h * 60 + m;
  }

  function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function fechaPe(fechaStr) {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return fechaStr;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'ok' ? 'ok' : type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 5. Inicialización y Persistencia (localStorage)
  // =========================================================================
  function loadStorage() {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) {
        eventsData = JSON.parse(storedEvents);
      } else {
        eventsData = JSON.parse(JSON.stringify(INITIAL_EVENTS));
        saveEventsStorage();
      }

      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (storedHistory) {
        historyData = JSON.parse(storedHistory);
      } else {
        historyData = {};
      }
    } catch (e) {
      console.warn('Error accediendo a localStorage. Usando datos iniciales en memoria.', e);
      eventsData = JSON.parse(JSON.stringify(INITIAL_EVENTS));
      historyData = {};
    }
  }

  function saveEventsStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventsData));
    } catch (e) {
      console.error('Error al guardar eventos en localStorage:', e);
    }
  }

  function saveHistoryStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyData));
    } catch (e) {
      console.error('Error al guardar historial en localStorage:', e);
    }
  }

  function getCurrentEvent() {
    return eventsData.find(e => e.id === currentEventId) || eventsData[0];
  }

  // =========================================================================
  // 6. Navegación en Cuatro Pasos
  // =========================================================================
  window.irPaso = function (n) {
    // Si intenta salir del Paso 2 hacia otro paso con validación pendiente de formulario:
    if (pasoActual === 2 && n > 2) {
      const validationError = validarFormularioPaso2();
      if (validationError) {
        dom.errorPaso2.textContent = validationError;
        return;
      }
      dom.errorPaso2.textContent = '';
    }

    // Regla: si va al Paso 4 habiendo cambios de horario y sin haber verificado disponibilidad:
    if (n === 4) {
      if (hayCambiosDeHorario() && !isAvailabilityVerified) {
        showToast('Debe validar la disponibilidad de los nuevos horarios antes de revisar y confirmar.', 'error');
        irPaso(3);
        return;
      }
    }

    pasoActual = n;

    // Actualizar visibilidad de secciones
    for (let i = 1; i <= 4; i++) {
      const sec = $('s' + i);
      if (sec) sec.classList.toggle('oculto', i !== n);
    }

    // Actualizar clases de los pasos en la barra superior
    for (let i = 1; i <= 4; i++) {
      const p = $('p' + i);
      if (p) {
        p.classList.toggle('activo', i === n);
        p.classList.toggle('hecho', i < n);
      }
    }

    // Acciones según el paso activo
    if (n === 1) {
      renderTablaEventos();
      actualizarBannerPaso1();
    } else if (n === 2) {
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    } else if (n === 3) {
      prepararPaso3Validacion();
    } else if (n === 4) {
      prepararPaso4Revision();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function marcarPasoFinalizado(n) {
    for (let i = 1; i <= 4; i++) {
      const p = $('p' + i);
      if (p) {
        p.classList.toggle('activo', i === n);
        p.classList.toggle('hecho', i <= n);
      }
    }
  }

  // =========================================================================
  // 7. Paso 1: Seleccionar Evento y Búsqueda
  // =========================================================================
  function renderTablaEventos() {
    const filtro = dom.buscar ? dom.buscar.value.trim().toLowerCase() : '';
    const filtrados = eventsData.filter(e => {
      const txt = `${e.code} ${e.client} ${e.name} ${e.contact}`.toLowerCase();
      return txt.includes(filtro);
    });

    if (dom.contadorEventos) {
      dom.contadorEventos.textContent = `${filtrados.length} evento(s) encontrado(s)`;
    }

    if (filtrados.length === 0) {
      dom.tablaEventos.innerHTML = '<tr><td colspan="8" class="vacio">No se encontraron eventos coincidentes con el criterio de búsqueda.</td></tr>';
      return;
    }

    dom.tablaEventos.innerHTML = filtrados.map(ev => {
      const esActivo = ev.id === currentEventId;
      const tiemposTec = [];
      if (ev.hasMontaje) tiemposTec.push(`Montaje: ${ev.montajeStart}`);
      if (ev.hasDesmontaje) tiemposTec.push(`Desmontaje: ${ev.desmontajeEnd}`);
      if (ev.hasEnsayo) tiemposTec.push(`Ensayo: ${fechaPe(ev.ensayoDate)} (${ev.ensayoStart}-${ev.ensayoEnd})`);
      const tecTexto = tiemposTec.length > 0 ? tiemposTec.join(' | ') : 'Sin adicionales';

      let claseEtiqueta = 'et-confirmado';
      if (ev.status === 'Con adelanto') claseEtiqueta = 'et-adelanto';
      if (ev.status === 'Pagado') claseEtiqueta = 'et-pagado';

      return `
        <tr class="${esActivo ? 'fila-activa' : ''}">
          <td><strong>${escapeHtml(ev.code)}</strong></td>
          <td>${escapeHtml(ev.client)}</td>
          <td>${escapeHtml(ev.name)}</td>
          <td>${fechaPe(ev.date)}</td>
          <td>${ev.startTime} - ${ev.endTime}</td>
          <td><small style="color:var(--gris);">${escapeHtml(tecTexto)}</small></td>
          <td><span class="etiqueta ${claseEtiqueta}">${escapeHtml(ev.status)}</span></td>
          <td class="num-der">
            <button type="button" class="btn btn-chico ${esActivo ? 'btn-sec' : 'btn-primario'}" onclick="window.seleccionarEvento('${ev.id}')">
              ${esActivo ? 'Editando' : 'Seleccionar'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function actualizarBannerPaso1() {
    const ev = getCurrentEvent();
    if (ev && dom.bannerTextoEvento) {
      dom.bannerTextoEvento.textContent = `${ev.code} • ${ev.name} (${ev.client})`;
    }
  }

  window.seleccionarEvento = function (id) {
    if (id === currentEventId && pasoActual === 1) {
      irPaso(2);
      return;
    }

    // Si hay cambios sin guardar en el evento actual, pedir confirmación antes de cambiar
    if (hayCambiosPendientes()) {
      pendingSwitchEventId = id;
      abrirModalDescartar('Tiene cambios sin guardar en el evento actual. ¿Desea descartarlos para editar otro evento?');
      return;
    }

    cargarEvento(id);
    irPaso(2);
  };

  function cargarEvento(id) {
    currentEventId = id;
    const ev = getCurrentEvent();
    if (!ev) return;

    originalSnapshot = JSON.parse(JSON.stringify(ev));
    isAvailabilityVerified = false;

    // Poblar campos de información general
    dom.eventCode.value = ev.code || ev.id;
    dom.eventSpace.value = ev.space || 'Auditorio Showtech';
    dom.eventName.value = ev.name || '';
    dom.eventClient.value = ev.client || '';
    dom.eventContact.value = ev.contact || '';
    dom.eventPhone.value = ev.phone || '';
    dom.eventEmail.value = ev.email || '';
    dom.requestedBy.value = ev.requestedBy || 'Cliente';
    dom.eventNotes.value = ev.notes || '';

    // Poblar fecha y horarios
    dom.eventDate.value = ev.date || '';
    dom.eventStartTime.value = ev.startTime || '';
    dom.eventEndTime.value = ev.endTime || '';

    // Montaje independiente
    dom.chkMontaje.checked = !!ev.hasMontaje;
    dom.fieldsMontaje.classList.toggle('oculto', !ev.hasMontaje);
    dom.montajeStartTime.value = ev.montajeStart || '';

    // Desmontaje independiente
    dom.chkDesmontaje.checked = !!ev.hasDesmontaje;
    dom.fieldsDesmontaje.classList.toggle('oculto', !ev.hasDesmontaje);
    dom.desmontajeEndTime.value = ev.desmontajeEnd || '';

    // Ensayo independiente
    dom.chkEnsayo.checked = !!ev.hasEnsayo;
    dom.fieldsEnsayo.classList.toggle('oculto', !ev.hasEnsayo);
    dom.ensayoDate.value = ev.ensayoDate || '';
    dom.ensayoStartTime.value = ev.ensayoStart || '';
    dom.ensayoEndTime.value = ev.ensayoEnd || '';

    // Badges y feedback
    dom.badgeEventoPaso2.textContent = `${ev.code} • ${ev.status}`;
    dom.errorPaso2.textContent = '';
    if (dom.modificationReason) dom.modificationReason.value = '';

    actualizarResumenHorario();
    actualizarEstadoDiferencias();
    renderHistorial();
  }

  // =========================================================================
  // 8. Paso 2: Modificación de Datos y Lógica de Tiempos
  // =========================================================================
  function getValoresFormulario() {
    return {
      code: dom.eventCode.value.trim(),
      space: dom.eventSpace.value.trim(),
      name: dom.eventName.value.trim(),
      client: dom.eventClient.value.trim(),
      contact: dom.eventContact.value.trim(),
      phone: dom.eventPhone.value.trim(),
      email: dom.eventEmail.value.trim(),
      requestedBy: dom.requestedBy.value,
      notes: dom.eventNotes.value.trim(),

      date: dom.eventDate.value,
      startTime: dom.eventStartTime.value,
      endTime: dom.eventEndTime.value,

      hasMontaje: dom.chkMontaje.checked,
      montajeStart: dom.chkMontaje.checked ? dom.montajeStartTime.value : '',

      hasDesmontaje: dom.chkDesmontaje.checked,
      desmontajeEnd: dom.chkDesmontaje.checked ? dom.desmontajeEndTime.value : '',

      hasEnsayo: dom.chkEnsayo.checked,
      ensayoDate: dom.chkEnsayo.checked ? dom.ensayoDate.value : '',
      ensayoStart: dom.chkEnsayo.checked ? dom.ensayoStartTime.value : '',
      ensayoEnd: dom.chkEnsayo.checked ? dom.ensayoEndTime.value : ''
    };
  }

  function hayCambiosPendientes() {
    if (!originalSnapshot) return false;
    const actual = getValoresFormulario();
    return (
      actual.name !== originalSnapshot.name ||
      actual.client !== originalSnapshot.client ||
      actual.contact !== originalSnapshot.contact ||
      actual.phone !== originalSnapshot.phone ||
      actual.email !== originalSnapshot.email ||
      actual.requestedBy !== originalSnapshot.requestedBy ||
      actual.notes !== originalSnapshot.notes ||
      actual.date !== originalSnapshot.date ||
      actual.startTime !== originalSnapshot.startTime ||
      actual.endTime !== originalSnapshot.endTime ||
      actual.hasMontaje !== !!originalSnapshot.hasMontaje ||
      (actual.hasMontaje && actual.montajeStart !== originalSnapshot.montajeStart) ||
      actual.hasDesmontaje !== !!originalSnapshot.hasDesmontaje ||
      (actual.hasDesmontaje && actual.desmontajeEnd !== originalSnapshot.desmontajeEnd) ||
      actual.hasEnsayo !== !!originalSnapshot.hasEnsayo ||
      (actual.hasEnsayo && (
        actual.ensayoDate !== originalSnapshot.ensayoDate ||
        actual.ensayoStart !== originalSnapshot.ensayoStart ||
        actual.ensayoEnd !== originalSnapshot.ensayoEnd
      ))
    );
  }

  function hayCambiosDeHorario() {
    if (!originalSnapshot) return false;
    const actual = getValoresFormulario();
    return (
      actual.date !== originalSnapshot.date ||
      actual.startTime !== originalSnapshot.startTime ||
      actual.endTime !== originalSnapshot.endTime ||
      actual.hasMontaje !== !!originalSnapshot.hasMontaje ||
      (actual.hasMontaje && actual.montajeStart !== originalSnapshot.montajeStart) ||
      actual.hasDesmontaje !== !!originalSnapshot.hasDesmontaje ||
      (actual.hasDesmontaje && actual.desmontajeEnd !== originalSnapshot.desmontajeEnd) ||
      actual.hasEnsayo !== !!originalSnapshot.hasEnsayo ||
      (actual.hasEnsayo && (
        actual.ensayoDate !== originalSnapshot.ensayoDate ||
        actual.ensayoStart !== originalSnapshot.ensayoStart ||
        actual.ensayoEnd !== originalSnapshot.ensayoEnd
      ))
    );
  }

  function actualizarEstadoDiferencias() {
    if (!originalSnapshot) return;
    const actual = getValoresFormulario();

    // Actualizar pills de modificado
    dom.modBadgeEventName.classList.toggle('visible', actual.name !== originalSnapshot.name);
    dom.modBadgeEventClient.classList.toggle('visible', actual.client !== originalSnapshot.client);
    dom.modBadgeEventContact.classList.toggle('visible', actual.contact !== originalSnapshot.contact);
    dom.modBadgeEventPhone.classList.toggle('visible', actual.phone !== originalSnapshot.phone);
    dom.modBadgeEventEmail.classList.toggle('visible', actual.email !== originalSnapshot.email);
    dom.modBadgeRequestedBy.classList.toggle('visible', actual.requestedBy !== originalSnapshot.requestedBy);
    dom.modBadgeEventNotes.classList.toggle('visible', actual.notes !== originalSnapshot.notes);

    dom.modBadgeEventDate.classList.toggle('visible', actual.date !== originalSnapshot.date);
    dom.modBadgeEventStartTime.classList.toggle('visible', actual.startTime !== originalSnapshot.startTime);
    dom.modBadgeEventEndTime.classList.toggle('visible', actual.endTime !== originalSnapshot.endTime);

    dom.modBadgeMontajeStart.classList.toggle('visible', actual.hasMontaje && actual.montajeStart !== originalSnapshot.montajeStart);
    dom.modBadgeDesmontajeEnd.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeEnd !== originalSnapshot.desmontajeEnd);

    dom.modBadgeEnsayoDate.classList.toggle('visible', actual.hasEnsayo && actual.ensayoDate !== originalSnapshot.ensayoDate);
    dom.modBadgeEnsayoStart.classList.toggle('visible', actual.hasEnsayo && actual.ensayoStart !== originalSnapshot.ensayoStart);
    dom.modBadgeEnsayoEnd.classList.toggle('visible', actual.hasEnsayo && actual.ensayoEnd !== originalSnapshot.ensayoEnd);

    // Botón de pase directo a revisión si SOLO cambió información general
    const cambiosHorario = hayCambiosDeHorario();
    const cambiosPendientes = hayCambiosPendientes();

    if (!cambiosHorario && cambiosPendientes) {
      dom.btnDirectoRevision.classList.remove('oculto');
    } else {
      dom.btnDirectoRevision.classList.add('oculto');
    }
  }

  function actualizarResumenHorario() {
    const f = getValoresFormulario();
    const items = [];

    if (f.hasMontaje && f.montajeStart && f.startTime) {
      items.push(`<span class="timeline-pill montaje">Montaje: ${f.montajeStart} - ${f.startTime}</span>`);
    }

    if (f.startTime && f.endTime) {
      items.push(`<span class="timeline-pill evento">Evento: ${f.startTime} - ${f.endTime}</span>`);
    }

    if (f.hasDesmontaje && f.endTime && f.desmontajeEnd) {
      items.push(`<span class="timeline-pill desmontaje">Desmontaje: ${f.endTime} - ${f.desmontajeEnd}</span>`);
    }

    if (f.hasEnsayo && f.ensayoDate && f.ensayoStart && f.ensayoEnd) {
      items.push(`<span class="timeline-pill ensayo">Ensayo: ${fechaPe(f.ensayoDate)} (${f.ensayoStart} - ${f.ensayoEnd})</span>`);
    }

    if (items.length === 0) {
      dom.resumenHorarioItems.innerHTML = '<span style="color:var(--gris); font-size:13px;">Ingrese los horarios para visualizar el cronograma propuesto.</span>';
    } else {
      dom.resumenHorarioItems.innerHTML = items.join('');
    }
  }

  function validarFormularioPaso2() {
    const f = getValoresFormulario();

    if (!f.name) return 'El nombre de la convocatoria o evento es obligatorio.';
    if (!f.client) return 'El cliente (nombre o razón social) es obligatorio.';
    if (!f.contact) return 'La persona de contacto es obligatoria.';
    if (!f.date) return 'Debe ingresar la fecha del evento.';
    if (!f.startTime || !f.endTime) return 'Debe especificar la hora de inicio y de fin del evento.';

    const startM = timeToMinutes(f.startTime);
    const endM = timeToMinutes(f.endTime);

    if (startM < REGULAR_HOURS.START_MINUTES || endM > REGULAR_HOURS.END_MINUTES) {
      return 'El horario del evento debe estar dentro del rango permitido (06:00 a 22:00).';
    }
    if (endM <= startM) {
      return 'La hora de fin del evento debe ser mayor a la hora de inicio.';
    }

    // Montaje
    if (f.hasMontaje) {
      if (!f.montajeStart) return 'Ingrese la hora de inicio del montaje previo.';
      const montStartM = timeToMinutes(f.montajeStart);
      if (montStartM < REGULAR_HOURS.START_MINUTES) {
        return 'La hora de montaje no puede ser previa a las 06:00.';
      }
      if (montStartM >= startM) {
        return 'La hora de inicio del montaje debe ser anterior al inicio del evento.';
      }
    }

    // Desmontaje
    if (f.hasDesmontaje) {
      if (!f.desmontajeEnd) return 'Ingrese la hora de fin del desmontaje posterior.';
      const desEndM = timeToMinutes(f.desmontajeEnd);
      if (desEndM > REGULAR_HOURS.END_MINUTES) {
        return 'La hora de fin del desmontaje no puede exceder las 22:00.';
      }
      if (desEndM <= endM) {
        return 'La hora de fin del desmontaje debe ser posterior al fin del evento.';
      }
    }

    // Ensayo técnico
    if (f.hasEnsayo) {
      if (!f.ensayoDate) return 'Ingrese la fecha del ensayo técnico previo.';
      if (!f.ensayoStart || !f.ensayoEnd) return 'Ingrese la hora de inicio y fin del ensayo técnico.';
      const ensStartM = timeToMinutes(f.ensayoStart);
      const ensEndM = timeToMinutes(f.ensayoEnd);

      if (ensStartM < REGULAR_HOURS.START_MINUTES || ensEndM > REGULAR_HOURS.END_MINUTES) {
        return 'El ensayo debe ocurrir dentro del horario regular (06:00 a 22:00).';
      }
      if (ensEndM <= ensStartM) {
        return 'La hora de fin del ensayo debe ser posterior a su hora de inicio.';
      }
      if (f.ensayoDate > f.date) {
        return 'La fecha del ensayo no puede ser posterior a la fecha del evento.';
      }
      // Si el ensayo es el mismo día del evento, debe terminar antes del montaje/evento
      if (f.ensayoDate === f.date) {
        const limiteM = f.hasMontaje ? timeToMinutes(f.montajeStart) : startM;
        if (ensEndM > limiteM) {
          return `El ensayo debe finalizar antes del ${f.hasMontaje ? 'montaje previo' : 'evento'} (${minutesToTime(limiteM)}).`;
        }
      }
    }

    return null;
  }

  // =========================================================================
  // 9. Paso 3: Validación de Disponibilidad y Cruces
  // =========================================================================
  function prepararPaso3Validacion() {
    const f = getValoresFormulario();

    let montageHtml = f.hasMontaje ? `${f.montajeStart} - ${f.startTime}` : 'No requiere';
    let desmontajeHtml = f.hasDesmontaje ? `${f.endTime} - ${f.desmontajeEnd}` : 'No requiere';
    let ensayoHtml = f.hasEnsayo ? `${fechaPe(f.ensayoDate)} | ${f.ensayoStart} - ${f.ensayoEnd}` : 'No requiere';

    dom.detalleHorarioValidar.innerHTML = `
      <div class="dato"><small>Auditorio</small><strong>Auditorio Showtech</strong></div>
      <div class="dato"><small>Fecha del evento</small><strong>${fechaPe(f.date)}</strong></div>
      <div class="dato"><small>Montaje previo</small><strong>${montageHtml}</strong></div>
      <div class="dato"><small>Horario del evento</small><strong>${f.startTime} - ${f.endTime}</strong></div>
      <div class="dato"><small>Desmontaje posterior</small><strong>${desmontajeHtml}</strong></div>
      <div class="dato"><small>Ensayo técnico</small><strong>${ensayoHtml}</strong></div>
    `;

    // Si no ha sido verificado este horario:
    if (!isAvailabilityVerified) {
      dom.availabilityFeedback.className = 'aviso aviso-info';
      dom.feedbackTitle.textContent = 'Pendiente de verificar';
      dom.feedbackMessage.textContent = 'Haga clic en el botón superior para comprobar posibles cruces con otros eventos y bloqueos institucionales.';
      dom.feedbackDetails.classList.add('oculto');
      dom.feedbackDetails.innerHTML = '';
      dom.scheduleSuggestionsContainer.classList.add('oculto');
      dom.btnContinuarPaso4.disabled = true;
    }
  }

  /**
   * Determina si dos franjas horarias se solapan en minutos.
   * Admite intervalos consecutivos: Si finA === inicioB o finB === inicioA, NO colisionan.
   */
  function intervalsOverlap(startA, endA, startB, endB) {
    return startA < endB && endA > startB;
  }

  function comprobarDisponibilidadCompleta() {
    const f = getValoresFormulario();
    const conflictos = [];

    // Franja principal ocupada por este evento en f.date
    const mainStartM = f.hasMontaje ? timeToMinutes(f.montajeStart) : timeToMinutes(f.startTime);
    const mainEndM = f.hasDesmontaje ? timeToMinutes(f.desmontajeEnd) : timeToMinutes(f.endTime);

    // 1. Comparar contra otros eventos registrados (excluyendo el actual)
    eventsData.forEach(ev => {
      if (ev.id === currentEventId) return;

      // Otros eventos ocupan su franja principal (montaje a desmontaje)
      if (ev.date === f.date) {
        const evStartM = ev.hasMontaje ? timeToMinutes(ev.montajeStart) : timeToMinutes(ev.startTime);
        const evEndM = ev.hasDesmontaje ? timeToMinutes(ev.desmontajeEnd) : timeToMinutes(ev.endTime);

        if (intervalsOverlap(mainStartM, mainEndM, evStartM, evEndM)) {
          conflictos.push({
            origen: `${ev.code}: ${ev.name} (${ev.client})`,
            fecha: ev.date,
            franja: `${minutesToTime(evStartM)} - ${minutesToTime(evEndM)}`,
            motivo: 'Cruce con franja de evento / montaje / desmontaje'
          });
        }
      }

      // Comparar franja principal contra ensayo de otro evento (si coincide la fecha)
      if (ev.hasEnsayo && ev.ensayoDate === f.date) {
        const evEnsStartM = timeToMinutes(ev.ensayoStart);
        const evEnsEndM = timeToMinutes(ev.ensayoEnd);
        if (intervalsOverlap(mainStartM, mainEndM, evEnsStartM, evEnsEndM)) {
          conflictos.push({
            origen: `${ev.code}: Ensayo de ${ev.name}`,
            fecha: ev.ensayoDate,
            franja: `${ev.ensayoStart} - ${ev.ensayoEnd}`,
            motivo: 'Cruce con ensayo técnico de otro evento'
          });
        }
      }

      // Si nuestro evento tiene ensayo, comparar nuestro ensayo contra otros eventos
      if (f.hasEnsayo && f.ensayoDate) {
        const myEnsStartM = timeToMinutes(f.ensayoStart);
        const myEnsEndM = timeToMinutes(f.ensayoEnd);

        if (ev.date === f.ensayoDate) {
          const evStartM = ev.hasMontaje ? timeToMinutes(ev.montajeStart) : timeToMinutes(ev.startTime);
          const evEndM = ev.hasDesmontaje ? timeToMinutes(ev.desmontajeEnd) : timeToMinutes(ev.endTime);
          if (intervalsOverlap(myEnsStartM, myEnsEndM, evStartM, evEndM)) {
            conflictos.push({
              origen: `${ev.code}: ${ev.name}`,
              fecha: ev.date,
              franja: `${minutesToTime(evStartM)} - ${minutesToTime(evEndM)}`,
              motivo: 'El ensayo solicitado colisiona con este evento'
            });
          }
        }

        if (ev.hasEnsayo && ev.ensayoDate === f.ensayoDate) {
          const evEnsStartM = timeToMinutes(ev.ensayoStart);
          const evEnsEndM = timeToMinutes(ev.ensayoEnd);
          if (intervalsOverlap(myEnsStartM, myEnsEndM, evEnsStartM, evEnsEndM)) {
            conflictos.push({
              origen: `${ev.code}: Ensayo técnico de ${ev.name}`,
              fecha: ev.ensayoDate,
              franja: `${ev.ensayoStart} - ${ev.ensayoEnd}`,
              motivo: 'Conflicto entre ensayos técnicos'
            });
          }
        }
      }
    });

    // 2. Comparar contra bloqueos institucionales
    INSTITUTIONAL_BLOCKS.forEach(blk => {
      const blkStartM = timeToMinutes(blk.startTime);
      const blkEndM = timeToMinutes(blk.endTime);

      if (blk.date === f.date) {
        if (intervalsOverlap(mainStartM, mainEndM, blkStartM, blkEndM)) {
          conflictos.push({
            origen: `${blk.id}: ${blk.title}`,
            fecha: blk.date,
            franja: `${blk.startTime} - ${blk.endTime}`,
            motivo: 'Cruce con bloqueo institucional de auditorio'
          });
        }
      }

      if (f.hasEnsayo && f.ensayoDate === blk.date) {
        const myEnsStartM = timeToMinutes(f.ensayoStart);
        const myEnsEndM = timeToMinutes(f.ensayoEnd);
        if (intervalsOverlap(myEnsStartM, myEnsEndM, blkStartM, blkEndM)) {
          conflictos.push({
            origen: `${blk.id}: ${blk.title}`,
            fecha: blk.date,
            franja: `${blk.startTime} - ${blk.endTime}`,
            motivo: 'El ensayo solicitado cruza con este bloqueo institucional'
          });
        }
      }
    });

    return conflictos;
  }

  // Generador de sugerencias de horarios viables para el mismo día
  function generarSugerenciasHorarios() {
    const f = getValoresFormulario();
    const durMontaje = f.hasMontaje ? (timeToMinutes(f.startTime) - timeToMinutes(f.montajeStart)) : 0;
    const durEvento = timeToMinutes(f.endTime) - timeToMinutes(f.startTime);
    const durDesmontaje = f.hasDesmontaje ? (timeToMinutes(f.desmontajeEnd) - timeToMinutes(f.endTime)) : 0;
    const durTotal = durMontaje + durEvento + durDesmontaje;

    const alternativas = [];
    const step = 30; // intervalos de 30 minutos

    for (let t = REGULAR_HOURS.START_MINUTES; t + durTotal <= REGULAR_HOURS.END_MINUTES; t += step) {
      const cMainStart = t;
      const cMainEnd = t + durTotal;

      const cMontStart = f.hasMontaje ? minutesToTime(t) : null;
      const cEvtStart = minutesToTime(t + durMontaje);
      const cEvtEnd = minutesToTime(t + durMontaje + durEvento);
      const cDesEnd = f.hasDesmontaje ? minutesToTime(cMainEnd) : null;

      // Verificar si colisiona con algún evento en esa fecha
      let choca = false;
      for (const ev of eventsData) {
        if (ev.id === currentEventId) continue;
        if (ev.date === f.date) {
          const evStartM = ev.hasMontaje ? timeToMinutes(ev.montajeStart) : timeToMinutes(ev.startTime);
          const evEndM = ev.hasDesmontaje ? timeToMinutes(ev.desmontajeEnd) : timeToMinutes(ev.endTime);
          if (intervalsOverlap(cMainStart, cMainEnd, evStartM, evEndM)) {
            choca = true;
            break;
          }
        }
      }

      if (!choca) {
        for (const blk of INSTITUTIONAL_BLOCKS) {
          if (blk.date === f.date) {
            const blkStartM = timeToMinutes(blk.startTime);
            const blkEndM = timeToMinutes(blk.endTime);
            if (intervalsOverlap(cMainStart, cMainEnd, blkStartM, blkEndM)) {
              choca = true;
              break;
            }
          }
        }
      }

      // Si además hay ensayo el mismo día, verificar compatibilidad
      if (!choca && f.hasEnsayo && f.ensayoDate === f.date) {
        const ensEndM = timeToMinutes(f.ensayoEnd);
        if (ensEndM > (f.hasMontaje ? t : (t + durMontaje))) {
          choca = true; // El ensayo no terminaría antes
        }
      }

      if (!choca) {
        alternativas.push({
          inicio: cEvtStart,
          fin: cEvtEnd,
          montajeStart: cMontStart,
          desmontajeEnd: cDesEnd,
          duracionTotal: durTotal
        });
      }

      if (alternativas.length >= 3) break;
    }

    return alternativas;
  }

  function ejecutarVerificacionDisponibilidad() {
    const validacionError = validarFormularioPaso2();
    if (validacionError) {
      dom.availabilityFeedback.className = 'aviso aviso-error';
      dom.feedbackTitle.textContent = 'Datos incompletos o inválidos';
      dom.feedbackMessage.textContent = validacionError;
      dom.feedbackDetails.classList.add('oculto');
      dom.scheduleSuggestionsContainer.classList.add('oculto');
      dom.btnContinuarPaso4.disabled = true;
      isAvailabilityVerified = false;
      return;
    }

    const conflictos = comprobarDisponibilidadCompleta();

    if (conflictos.length === 0) {
      // ÉXITO: Disponible
      isAvailabilityVerified = true;
      dom.availabilityFeedback.className = 'aviso aviso-ok';
      dom.feedbackTitle.textContent = '✓ Horario disponible en Auditorio Showtech';
      dom.feedbackMessage.textContent = 'La franja solicitada y sus tiempos técnicos no presentan conflictos con otros eventos ni bloqueos institucionales.';
      dom.feedbackDetails.classList.add('oculto');
      dom.scheduleSuggestionsContainer.classList.add('oculto');
      dom.btnContinuarPaso4.disabled = false;
      showToast('Disponibilidad confirmada sin conflictos.', 'ok');
    } else {
      // CONFLICTO DETECTADO
      isAvailabilityVerified = false;
      dom.availabilityFeedback.className = 'aviso aviso-error';
      dom.feedbackTitle.textContent = `⚠ Conflicto detectado (${conflictos.length} cruce(s))`;
      dom.feedbackMessage.textContent = 'El auditorio se encuentra ocupado en los horarios solicitados por las siguientes reservas:';
      dom.feedbackDetails.classList.remove('oculto');
      dom.feedbackDetails.innerHTML = conflictos.map(c => `
        <li><strong>${escapeHtml(c.origen)}</strong> (${fechaPe(c.fecha)} de ${c.franja}): ${escapeHtml(c.motivo)}</li>
      `).join('');

      dom.btnContinuarPaso4.disabled = true;

      // Calcular y mostrar sugerencias
      lastConflictAlternatives = generarSugerenciasHorarios();
      if (lastConflictAlternatives.length > 0) {
        dom.scheduleSuggestionsContainer.classList.remove('oculto');
        dom.suggestionsList.innerHTML = lastConflictAlternatives.map((alt, idx) => `
          <div class="sugerencia-card">
            <div>
              <div class="sug-horario">Evento: ${alt.inicio} - ${alt.fin}</div>
              <div class="sug-detalle">
                ${alt.montajeStart ? `Montaje: ${alt.montajeStart} &bull; ` : ''}
                ${alt.desmontajeEnd ? `Desmontaje hasta: ${alt.desmontajeEnd}` : ''}
              </div>
            </div>
            <button type="button" class="btn btn-sec btn-chico" onclick="window.aplicarSugerenciaHorario(${idx})">
              Aplicar este horario
            </button>
          </div>
        `).join('');
      } else {
        dom.scheduleSuggestionsContainer.classList.add('oculto');
      }

      showToast('Se detectaron conflictos en los horarios solicitados.', 'error');
    }
  }

  window.aplicarSugerenciaHorario = function (idx) {
    const alt = lastConflictAlternatives[idx];
    if (!alt) return;

    dom.eventStartTime.value = alt.inicio;
    dom.eventEndTime.value = alt.fin;
    if (alt.montajeStart) dom.montajeStartTime.value = alt.montajeStart;
    if (alt.desmontajeEnd) dom.desmontajeEndTime.value = alt.desmontajeEnd;

    actualizarResumenHorario();
    actualizarEstadoDiferencias();
    prepararPaso3Validacion();

    // Revalidar automáticamente para mostrar disponibilidad
    ejecutarVerificacionDisponibilidad();
    showToast('Horario alternativo aplicado al formulario (sin guardar automáticamente).', 'ok');
  };

  // =========================================================================
  // 10. Paso 4: Revisión, Diff y Guardado Definitivo
  // =========================================================================
  function calcularDiferencias() {
    if (!originalSnapshot) return [];
    const actual = getValoresFormulario();
    const diffs = [];

    const campos = [
      { key: 'name', label: 'Nombre del evento' },
      { key: 'client', label: 'Cliente' },
      { key: 'contact', label: 'Contacto' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'email', label: 'Correo' },
      { key: 'requestedBy', label: 'Solicitado por' },
      { key: 'notes', label: 'Observaciones y requerimientos' },
      { key: 'date', label: 'Fecha del evento', esFecha: true },
      { key: 'startTime', label: 'Hora de inicio' },
      { key: 'endTime', label: 'Hora de fin' }
    ];

    campos.forEach(c => {
      const origVal = originalSnapshot[c.key] || '';
      const actVal = actual[c.key] || '';
      if (origVal !== actVal) {
        diffs.push({
          campo: c.label,
          anterior: c.esFecha ? fechaPe(origVal) : (origVal || '(vacío)'),
          nuevo: c.esFecha ? fechaPe(actVal) : (actVal || '(vacío)')
        });
      }
    });

    // Montaje
    const origMont = originalSnapshot.hasMontaje ? `Sí (${originalSnapshot.montajeStart})` : 'No';
    const actMont = actual.hasMontaje ? `Sí (${actual.montajeStart})` : 'No';
    if (origMont !== actMont) {
      diffs.push({ campo: 'Requiere montaje previo', anterior: origMont, nuevo: actMont });
    }

    // Desmontaje
    const origDes = originalSnapshot.hasDesmontaje ? `Sí (${originalSnapshot.desmontajeEnd})` : 'No';
    const actDes = actual.hasDesmontaje ? `Sí (${actual.desmontajeEnd})` : 'No';
    if (origDes !== actDes) {
      diffs.push({ campo: 'Requiere desmontaje posterior', anterior: origDes, nuevo: actDes });
    }

    // Ensayo
    const origEns = originalSnapshot.hasEnsayo ? `Sí (${fechaPe(originalSnapshot.ensayoDate)} ${originalSnapshot.ensayoStart}-${originalSnapshot.ensayoEnd})` : 'No';
    const actEns = actual.hasEnsayo ? `Sí (${fechaPe(actual.ensayoDate)} ${actual.ensayoStart}-${actual.ensayoEnd})` : 'No';
    if (origEns !== actEns) {
      diffs.push({ campo: 'Requiere ensayo técnico', anterior: origEns, nuevo: actEns });
    }

    return diffs;
  }

  function armarComprobanteHtml(finalizado = false, correlativo = '') {
    const f = getValoresFormulario();
    const ev = getCurrentEvent();
    const fila = (a, b) => `<div class="comp-fila"><span>${escapeHtml(a)}</span><span>${escapeHtml(b)}</span></div>`;

    const tiemposArr = [];
    if (f.hasMontaje) tiemposArr.push(`Montaje: ${f.montajeStart}`);
    tiemposArr.push(`Evento: ${f.startTime} - ${f.endTime}`);
    if (f.hasDesmontaje) tiemposArr.push(`Desmontaje: ${f.desmontajeEnd}`);

    return `
      <div class="marca-agua">${finalizado ? 'CONFIRMADO' : 'BORRADOR'}</div>
      <div class="comp-cab">
        <div>
          <div class="marca">SHOWTECH <span>SOLUTIONS S.A.C.</span></div>
          <small style="color:var(--gris)">RUC 20613979051 &bull; Gestión Operativa de Auditorio</small>
        </div>
        <div style="text-align:right">
          <strong>Ficha de Modificación de Evento</strong><br>
          <small style="color:var(--gris)">${finalizado ? correlativo : 'Borrador preliminar'}</small>
        </div>
      </div>

      <div class="comp-sec">Datos del Evento</div>
      ${fila('Código', f.code)}
      ${fila('Nombre de la convocatoria', f.name)}
      ${fila('Lugar asignado', f.space)}
      ${fila('Fecha del evento', fechaPe(f.date))}
      ${fila('Horarios y tiempos técnicos', tiemposArr.join(' | '))}
      ${f.hasEnsayo ? fila('Ensayo técnico previo', `${fechaPe(f.ensayoDate)} (${f.ensayoStart} - ${f.ensayoEnd})`) : ''}

      <div class="comp-sec">Cliente y Contacto</div>
      ${fila('Cliente (Razón Social)', f.client)}
      ${fila('Persona de contacto', f.contact)}
      ${f.phone ? fila('Teléfono', f.phone) : ''}
      ${f.email ? fila('Correo electrónico', f.email) : ''}
      ${fila('Modificación solicitada por', f.requestedBy)}

      <div class="comp-sec">Control y Auditoría</div>
      ${fila('Estado del evento', ev.status || 'Confirmado')}
      ${fila('Actualizado por', 'Asesor(a) comercial')}
      ${dom.modificationReason && dom.modificationReason.value.trim() ? fila('Motivo de la modificación', dom.modificationReason.value.trim()) : ''}
      ${f.notes ? fila('Observaciones y requerimientos', f.notes) : ''}

      <div class="comp-fila comp-total">
        <span>Disponibilidad en Auditorio</span>
        <span style="color:var(--ok)">✓ Verificado y Aprobado</span>
      </div>
    `;
  }

  function prepararPaso4Revision() {
    dom.vistaRevision.classList.remove('oculto');
    dom.vistaExito.classList.add('oculto');
    dom.errorPaso4.textContent = '';
    dom.avisoFinal.innerHTML = '';

    const diffs = calcularDiferencias();

    if (diffs.length === 0) {
      dom.diffTableContainer.innerHTML = `
        <div class="aviso aviso-info" style="margin-bottom:0;">
          No se han detectado modificaciones en los campos respecto al registro actual en el sistema.
        </div>
      `;
    } else {
      dom.diffTableContainer.innerHTML = `
        <table class="diff-tabla">
          <thead>
            <tr>
              <th>Campo modificado</th>
              <th>Valor registrado (anterior)</th>
              <th>Nuevo valor propuesto</th>
            </tr>
          </thead>
          <tbody>
            ${diffs.map(d => `
              <tr>
                <td><strong>${escapeHtml(d.campo)}</strong></td>
                <td><span class="diff-previo">${escapeHtml(d.anterior)}</span></td>
                <td><span class="diff-nuevo">${escapeHtml(d.nuevo)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    dom.comprobante.innerHTML = armarComprobanteHtml(false);
  }

  function ejecutarGuardadoDefinitivo() {
    // 1. REGLA OBLIGATORIA: Antes del guardado definitivo, vuelve a comprobar los horarios afectados
    const f = getValoresFormulario();

    if (hayCambiosDeHorario()) {
      const conflictos = comprobarDisponibilidadCompleta();
      if (conflictos.length > 0) {
        dom.errorPaso4.textContent = 'No se puede guardar: se detectó un conflicto de horario antes de la confirmación definitiva. Los datos originales se conservan.';
        showToast('Conflicto detectado antes del guardado. Operación cancelada.', 'error');
        return;
      }
    }

    // 2. Localizar y actualizar el registro en eventsData
    const idx = eventsData.findIndex(e => e.id === currentEventId);
    if (idx === -1) {
      dom.errorPaso4.textContent = 'Error: no se encontró el evento a actualizar.';
      return;
    }

    const diffs = calcularDiferencias();
    const correlativo = `ACT-${String(Date.now()).slice(-6)}`;
    const motivo = dom.modificationReason ? dom.modificationReason.value.trim() : '';

    const eventoActualizado = {
      ...eventsData[idx],
      name: f.name,
      client: f.client,
      contact: f.contact,
      phone: f.phone,
      email: f.email,
      requestedBy: f.requestedBy,
      notes: f.notes,
      date: f.date,
      startTime: f.startTime,
      endTime: f.endTime,
      hasMontaje: f.hasMontaje,
      montajeStart: f.montajeStart,
      hasDesmontaje: f.hasDesmontaje,
      desmontajeEnd: f.desmontajeEnd,
      hasEnsayo: f.hasEnsayo,
      ensayoDate: f.ensayoDate,
      ensayoStart: f.ensayoStart,
      ensayoEnd: f.ensayoEnd,
      lastModified: new Date().toISOString()
    };

    eventsData[idx] = eventoActualizado;
    saveEventsStorage();

    // 3. Registrar en historial de auditoría
    if (!historyData[currentEventId]) {
      historyData[currentEventId] = [];
    }
    historyData[currentEventId].unshift({
      id: correlativo,
      timestamp: new Date().toLocaleString('es-PE'),
      usuario: 'Asesor(a) comercial',
      motivo: motivo || 'Actualización de datos generales y/o cronograma',
      cambios: diffs
    });
    saveHistoryStorage();

    // Actualizar snapshot original
    originalSnapshot = JSON.parse(JSON.stringify(eventoActualizado));
    isAvailabilityVerified = true;

    // 4. Mostrar vista de confirmación exitosa final
    dom.comprobanteFinal.innerHTML = armarComprobanteHtml(true, correlativo);
    dom.vistaRevision.classList.add('oculto');
    dom.vistaExito.classList.remove('oculto');
    dom.avisoFinal.innerHTML = '<div class="aviso aviso-ok">✔ Los datos del evento se actualizaron correctamente en el sistema.</div>';

    marcarPasoFinalizado(4);
    renderHistorial();
    renderTablaEventos();
    actualizarBannerPaso1();
    showToast('Evento actualizado y guardado correctamente en este navegador.', 'ok');
  }

  window.reiniciar = function (pasoDestino) {
    cargarEvento(currentEventId);
    irPaso(pasoDestino);
  };

  // =========================================================================
  // 11. Historial de Auditoría
  // =========================================================================
  function renderHistorial() {
    const hist = historyData[currentEventId] || [];
    dom.countHistorial.textContent = hist.length;

    if (hist.length === 0) {
      dom.historyListContainer.innerHTML = '<p style="color:var(--gris); font-size:13px;">No hay registros de modificaciones previas para este evento.</p>';
      return;
    }

    dom.historyListContainer.innerHTML = hist.map(h => `
      <div class="historial-item">
        <div class="historial-header">
          <span><strong>Registro ${escapeHtml(h.id)}</strong> &bull; ${escapeHtml(h.timestamp)}</span>
          <span>${escapeHtml(h.usuario)}</span>
        </div>
        <div><em>Motivo:</em> ${escapeHtml(h.motivo)}</div>
        ${h.cambios && h.cambios.length > 0 ? `
          <div class="historial-cambios">
            <strong>Campos modificados (${h.cambios.length}):</strong>
            <ul style="margin-left: 18px; margin-top: 4px;">
              ${h.cambios.map(c => `<li><strong>${escapeHtml(c.campo)}:</strong> ${escapeHtml(c.anterior)} &rarr; ${escapeHtml(c.nuevo)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // =========================================================================
  // 12. Modales (Descartar y Restablecer Demo)
  // =========================================================================
  function abrirModalDescartar(mensaje) {
    if (dom.discardModalMessage && mensaje) {
      dom.discardModalMessage.textContent = mensaje;
    }
    dom.confirmDiscardModal.classList.remove('oculto');
  }

  function cerrarModalDescartar() {
    dom.confirmDiscardModal.classList.add('oculto');
    pendingSwitchEventId = null;
  }

  function confirmarDescarte() {
    cerrarModalDescartar();
    if (pendingSwitchEventId) {
      const targetId = pendingSwitchEventId;
      pendingSwitchEventId = null;
      cargarEvento(targetId);
      irPaso(2);
    } else {
      cargarEvento(currentEventId);
      showToast('Modificaciones pendientes descartadas. Datos restaurados.', 'info');
      irPaso(2);
    }
  }

  function abrirModalReset() {
    dom.confirmResetModal.classList.remove('oculto');
  }

  function cerrarModalReset() {
    dom.confirmResetModal.classList.add('oculto');
  }

  function confirmarResetDemo() {
    cerrarModalReset();
    try {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.warn(e);
    }
    eventsData = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    historyData = {};
    saveEventsStorage();
    saveHistoryStorage();
    cargarEvento('EVT-001');
    irPaso(1);
    showToast('Datos de demostración restablecidos a valores de fábrica.', 'ok');
  }

  // =========================================================================
  // 13. Vinculación de Event Listeners
  // =========================================================================
  function bindEvents() {
    // Búsqueda en Paso 1
    if (dom.buscar) {
      dom.buscar.addEventListener('input', renderTablaEventos);
    }

    // Toggles de tiempos independientes en Paso 2
    dom.chkMontaje.addEventListener('change', () => {
      dom.fieldsMontaje.classList.toggle('oculto', !dom.chkMontaje.checked);
      if (dom.chkMontaje.checked && !dom.montajeStartTime.value && dom.eventStartTime.value) {
        // Sugerir 1 hora antes por defecto si está vacío
        const m = Math.max(REGULAR_HOURS.START_MINUTES, timeToMinutes(dom.eventStartTime.value) - 60);
        dom.montajeStartTime.value = minutesToTime(m);
      }
      isAvailabilityVerified = false;
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    dom.chkDesmontaje.addEventListener('change', () => {
      dom.fieldsDesmontaje.classList.toggle('oculto', !dom.chkDesmontaje.checked);
      if (dom.chkDesmontaje.checked && !dom.desmontajeEndTime.value && dom.eventEndTime.value) {
        // Sugerir 1 hora después por defecto si está vacío
        const m = Math.min(REGULAR_HOURS.END_MINUTES, timeToMinutes(dom.eventEndTime.value) + 60);
        dom.desmontajeEndTime.value = minutesToTime(m);
      }
      isAvailabilityVerified = false;
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    dom.chkEnsayo.addEventListener('change', () => {
      dom.fieldsEnsayo.classList.toggle('oculto', !dom.chkEnsayo.checked);
      if (dom.chkEnsayo.checked && !dom.ensayoDate.value) {
        dom.ensayoDate.value = dom.eventDate.value;
      }
      isAvailabilityVerified = false;
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    // Inputs que modifican horario -> invalidan verificación previa
    const scheduleInputs = [
      dom.eventDate, dom.eventStartTime, dom.eventEndTime,
      dom.montajeStartTime, dom.desmontajeEndTime,
      dom.ensayoDate, dom.ensayoStartTime, dom.ensayoEndTime
    ];
    scheduleInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          isAvailabilityVerified = false;
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        });
      }
    });

    // Inputs de datos generales -> actualizan badges sin invalidar horario
    const generalInputs = [
      dom.eventName, dom.eventClient, dom.eventContact,
      dom.eventPhone, dom.eventEmail, dom.requestedBy, dom.eventNotes
    ];
    generalInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          actualizarEstadoDiferencias();
        });
      }
    });

    // Botones del Paso 2
    dom.btnAvanzarPaso2.addEventListener('click', () => {
      const err = validarFormularioPaso2();
      if (err) {
        dom.errorPaso2.textContent = err;
        return;
      }
      dom.errorPaso2.textContent = '';
      irPaso(3);
    });

    dom.btnDescartarPaso2.addEventListener('click', () => {
      if (hayCambiosPendientes()) {
        abrirModalDescartar('¿Desea descartar todas las modificaciones realizadas en este formulario?');
      } else {
        showToast('No hay cambios pendientes por descartar.', 'info');
      }
    });

    // Botones del Paso 3
    dom.btnCheckAvailability.addEventListener('click', ejecutarVerificacionDisponibilidad);
    dom.btnContinuarPaso4.addEventListener('click', () => irPaso(4));

    // Botones del Paso 4
    dom.btnConfirmSave.addEventListener('click', ejecutarGuardadoDefinitivo);
    dom.btnDescartarFinal.addEventListener('click', () => {
      if (hayCambiosPendientes()) {
        abrirModalDescartar('¿Desea descartar las modificaciones y cancelar el guardado?');
      } else {
        showToast('No hay cambios pendientes.', 'info');
      }
    });

    // Modales listeners
    dom.btnCloseDiscardModal.addEventListener('click', cerrarModalDescartar);
    dom.btnStayOnForm.addEventListener('click', cerrarModalDescartar);
    dom.btnConfirmDiscard.addEventListener('click', confirmarDescarte);

    dom.btnResetDemo.addEventListener('click', abrirModalReset);
    dom.btnCloseResetModal.addEventListener('click', cerrarModalReset);
    dom.btnCancelResetModal.addEventListener('click', cerrarModalReset);
    dom.btnConfirmResetDemo.addEventListener('click', confirmarResetDemo);
  }

  // =========================================================================
  // 14. Arranque inicial
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    loadStorage();
    bindEvents();
    cargarEvento('EVT-001');
    irPaso(1);
  });

})();
