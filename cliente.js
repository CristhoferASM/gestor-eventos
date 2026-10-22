/**
 * ==========================================================================
 * SHOWTECH SOLUTIONS - PORTAL DEL CLIENTE
 * Módulo: Solicitar modificación de evento
 * Tecnologías: JavaScript Puro (ES6+), HTML5, CSS3, Flatpickr
 * ==========================================================================
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Constantes y Configuración
  // =========================================================================
  const STORAGE_KEYS = {
    EVENTS: 'SHOWTECH_EVENTOS_V2',
    HISTORY: 'SHOWTECH_HISTORIAL_V2',
    SOLICITUDES: 'SHOWTECH_SOLICITUDES_V2'
  };

  const CLIENTE_ACTUAL = {
    id: 'CLI-001',
    razonSocial: 'Promoción Horizonte 2026',
    contacto: 'María Rodríguez',
    telefono: '998 765 432',
    email: 'm.rodriguez@horizonte2026.edu'
  };

  const REGULAR_HOURS = {
    START_MINUTES: 6 * 60,   // 06:00
    END_MINUTES: 22 * 60     // 22:00
  };

  const TARIFAS_REFERENCIALES = {
    CARGO_MODIFICACION: 100, // S/ 100
    HORA_AUDITORIO: 500      // S/ 500
  };

  const INITIAL_EVENTS = [
    {
      id: 'EVT-001',
      code: 'EVT-001',
      clientId: 'CLI-001',
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
      montajeDate: '2026-11-07',
      montajeStart: '09:00',
      montajeEnd: '10:00',
      hasDesmontaje: true,
      desmontajeDate: '2026-11-07',
      desmontajeStart: '13:00',
      desmontajeEnd: '14:00',
      hasEnsayo: false,
      ensayoDate: '',
      ensayoStart: '',
      ensayoEnd: ''
    },
    {
      id: 'EVT-002',
      code: 'EVT-002',
      clientId: 'CLI-002',
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
      montajeDate: '2026-11-07',
      montajeStart: '15:00',
      montajeEnd: '16:00',
      hasDesmontaje: true,
      desmontajeDate: '2026-11-07',
      desmontajeStart: '19:00',
      desmontajeEnd: '20:00',
      hasEnsayo: false,
      ensayoDate: '',
      ensayoStart: '',
      ensayoEnd: ''
    }
  ];

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
  // 2. Estado de la Aplicación del Cliente
  // =========================================================================
  let eventsData = [];
  let solicitudesData = [];
  let currentEventId = 'EVT-001';
  let pasoActual = 1;
  let originalSnapshot = null;
  let ultimaSolicitudConfirmada = null;
  let isSubmitting = false;

  const fpInstances = {};
  const fpDateInstances = {};

  // =========================================================================
  // 3. Referencias al DOM
  // =========================================================================
  const $ = id => document.getElementById(id);

  const dom = {
    // Pasos
    cp1: $('cp1'),
    cp2: $('cp2'),
    cp3: $('cp3'),
    cp4: $('cp4'),
    cs1: $('cs1'),
    cs2: $('cs2'),
    cs3: $('cs3'),
    cs4: $('cs4'),

    // Paso 1
    listaEventosCliente: $('listaEventosCliente'),
    contenedorSolicitudesCliente: $('contenedorSolicitudesCliente'),

    // Paso 2
    badgeEventoClientePaso2: $('badgeEventoClientePaso2'),
    formPropuestaCliente: $('formPropuestaCliente'),
    eventCode: $('eventCode'),
    eventSpace: $('eventSpace'),
    eventClient: $('eventClient'),
    eventName: $('eventName'),
    eventContact: $('eventContact'),
    eventPhone: $('eventPhone'),
    eventEmail: $('eventEmail'),
    eventNotes: $('eventNotes'),

    // Fechas y horarios
    eventDate: $('eventDate'),
    eventStartTime: $('eventStartTime'),
    eventEndTime: $('eventEndTime'),

    // Montaje
    chkMontaje: $('chkMontaje'),
    panelMontaje: $('panelMontaje'),
    fieldsMontaje: $('fieldsMontaje'),
    montajeDate: $('montajeDate'),
    montajeStartTime: $('montajeStartTime'),
    montajeEndTime: $('montajeEndTime'),

    // Desmontaje
    chkDesmontaje: $('chkDesmontaje'),
    panelDesmontaje: $('panelDesmontaje'),
    fieldsDesmontaje: $('fieldsDesmontaje'),
    desmontajeDate: $('desmontajeDate'),
    desmontajeStartTime: $('desmontajeStartTime'),
    desmontajeEndTime: $('desmontajeEndTime'),

    // Ensayo
    chkEnsayo: $('chkEnsayo'),
    panelEnsayo: $('panelEnsayo'),
    fieldsEnsayo: $('fieldsEnsayo'),
    ensayoDate: $('ensayoDate'),
    ensayoStartTime: $('ensayoStartTime'),
    ensayoEndTime: $('ensayoEndTime'),

    // Motivo
    requestReason: $('requestReason'),
    errRequestReason: $('errRequestReason'),

    // Resumen horario y error paso 2
    resumenHorarioItemsCliente: $('resumenHorarioItemsCliente'),
    errorPaso2Cliente: $('errorPaso2Cliente'),
    btnAvanzarPaso3Cliente: $('btnAvanzarPaso3Cliente'),
    btnDescartarPaso2Cliente: $('btnDescartarPaso2Cliente'),

    // Badges modificado
    modBadgeEventName: $('modBadgeEventName'),
    modBadgeEventContact: $('modBadgeEventContact'),
    modBadgeEventPhone: $('modBadgeEventPhone'),
    modBadgeEventEmail: $('modBadgeEventEmail'),
    modBadgeEventNotes: $('modBadgeEventNotes'),
    modBadgeEventDate: $('modBadgeEventDate'),
    modBadgeEventStartTime: $('modBadgeEventStartTime'),
    modBadgeEventEndTime: $('modBadgeEventEndTime'),
    modBadgeMontajeDate: $('modBadgeMontajeDate'),
    modBadgeMontajeStart: $('modBadgeMontajeStart'),
    modBadgeMontajeEnd: $('modBadgeMontajeEnd'),
    modBadgeDesmontajeDate: $('modBadgeDesmontajeDate'),
    modBadgeDesmontajeStart: $('modBadgeDesmontajeStart'),
    modBadgeDesmontajeEnd: $('modBadgeDesmontajeEnd'),
    modBadgeEnsayoDate: $('modBadgeEnsayoDate'),
    modBadgeEnsayoStart: $('modBadgeEnsayoStart'),
    modBadgeEnsayoEnd: $('modBadgeEnsayoEnd'),
    modBadgeEnsayoAdded: $('modBadgeEnsayoAdded'),

    // Paso 3
    diffTableContainerCliente: $('diffTableContainerCliente'),
    motivoReviewTexto: $('motivoReviewTexto'),
    errorPaso3Cliente: $('errorPaso3Cliente'),
    btnEnviarSolicitud: $('btnEnviarSolicitud'),

    // Paso 4
    confirmacionMetaGrid: $('confirmacionMetaGrid'),
    btnVerDetalleSolicitudConfirmada: $('btnVerDetalleSolicitudConfirmada'),

    // Modales
    modalDetalleSolicitud: $('modalDetalleSolicitud'),
    modalDetalleBody: $('modalDetalleBody'),
    btnCloseModalDetalle: $('btnCloseModalDetalle'),
    btnCerrarModalDetalle: $('btnCerrarModalDetalle'),
    btnRetirarSolicitudModal: $('btnRetirarSolicitudModal'),

    modalConfirmarRetiro: $('modalConfirmarRetiro'),
    btnCloseModalRetiro: $('btnCloseModalRetiro'),
    btnCancelarRetiro: $('btnCancelarRetiro'),
    btnConfirmarRetiroSolicitud: $('btnConfirmarRetiroSolicitud'),

    modalDescartarCliente: $('modalDescartarCliente'),
    btnCloseDiscardClientModal: $('btnCloseDiscardClientModal'),
    btnStayOnClientForm: $('btnStayOnClientForm'),
    btnConfirmDiscardClient: $('btnConfirmDiscardClient'),

    toastContainerCliente: $('toastContainerCliente')
  };

  // =========================================================================
  // 4. Utilidades de Formato, Tiempo y Normalización
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

  function formatDuracionMin(minsTotales) {
    if (isNaN(minsTotales) || minsTotales <= 0) return '0 min';
    const h = Math.floor(minsTotales / 60);
    const m = minsTotales % 60;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
  }

  function normalizarFecha(val) {
    if (!val) return '';
    const s = String(val).trim();
    const mPe = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mPe) {
      const d = mPe[1].padStart(2, '0');
      const m = mPe[2].padStart(2, '0');
      const y = mPe[3];
      return `${y}-${m}-${d}`;
    }
    const mIso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (mIso) {
      const y = mIso[1];
      const m = mIso[2].padStart(2, '0');
      const d = mIso[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return s;
  }

  function normalizarHora(val) {
    if (!val) return '';
    const s = String(val).trim();
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    if (m) {
      const hh = m[1].padStart(2, '0');
      const mm = m[2];
      return `${hh}:${mm}`;
    }
    return s;
  }

  function fechaPe(fechaStr) {
    if (!fechaStr) return '';
    const norm = normalizarFecha(fechaStr);
    const parts = norm.split('-');
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

  function showToast(mensaje, tipo = 'info') {
    if (!dom.toastContainerCliente) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    dom.toastContainerCliente.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // 5. Persistencia y Carga de Datos
  // =========================================================================
  function loadStorage() {
    // 1. Cargar eventos compartidos
    try {
      const rawEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (rawEvents) {
        eventsData = JSON.parse(rawEvents);
      } else {
        eventsData = JSON.parse(JSON.stringify(INITIAL_EVENTS));
        saveEventsStorage();
      }
    } catch (e) {
      console.warn('Error leyendo eventos de localStorage:', e);
      eventsData = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    }

    // 2. Cargar solicitudes compartidas del cliente
    try {
      const rawSol = localStorage.getItem(STORAGE_KEYS.SOLICITUDES);
      if (rawSol) {
        solicitudesData = JSON.parse(rawSol);
      } else {
        solicitudesData = [];
      }
    } catch (e) {
      console.warn('Error leyendo solicitudes de localStorage:', e);
      solicitudesData = [];
    }
  }

  function saveEventsStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventsData));
    } catch (e) {
      console.warn('Error guardando eventos en localStorage:', e);
    }
  }

  function saveSolicitudesStorage() {
    // Guarda las solicitudes de forma segura y lanza excepción si falla (p.ej. cuota excedida)
    localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudesData));
  }

  function getEventosDelCliente() {
    return eventsData.filter(ev => {
      if (ev.clientId === CLIENTE_ACTUAL.id) return true;
      if (ev.client && ev.client.trim().toLowerCase() === CLIENTE_ACTUAL.razonSocial.toLowerCase()) return true;
      return false;
    });
  }

  function getCurrentEvent() {
    return eventsData.find(e => e.id === currentEventId) || eventsData[0];
  }

  function getSolicitudPendienteEvento(eventId) {
    return solicitudesData.find(s => s.eventId === eventId && s.status === 'Pendiente de revisión');
  }

  // =========================================================================
  // 6. Flatpickr para Calendarios y Selectores de Hora
  // =========================================================================
  function initFlatpickrDatePickers() {
    if (!window.flatpickr) return;
    const dateFieldIds = ['eventDate', 'montajeDate', 'desmontajeDate', 'ensayoDate'];

    dateFieldIds.forEach(id => {
      const input = $(id);
      if (!input) return;

      fpDateInstances[id] = window.flatpickr(input, {
        locale: 'es',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        allowInput: true,
        disableMobile: true,
        animate: false,
        position: 'auto',
        onChange: function () {
          validarCampoFecha(id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        },
        onClose: function () {
          validarCampoFecha(id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        }
      });

      const wrap = $(`wrap_${id}`);
      if (wrap) {
        const icon = wrap.querySelector('.icono-calendario');
        if (icon) {
          icon.addEventListener('click', () => {
            if (!input.disabled && fpDateInstances[id]) {
              fpDateInstances[id].open();
            }
          });
        }
      }

      input.addEventListener('input', () => {
        validarCampoFecha(id);
        actualizarResumenHorario();
        actualizarEstadoDiferencias();
      });
    });
  }

  function setDateFieldValue(fieldId, dateStr) {
    const input = $(fieldId);
    if (!input) return;

    const cleanVal = dateStr ? dateStr.trim() : '';
    input.value = cleanVal;

    const fp = fpDateInstances[fieldId];
    if (fp) {
      if (cleanVal && /^\d{4}-\d{2}-\d{2}$/.test(cleanVal)) {
        fp.setDate(cleanVal, false, 'Y-m-d');
      } else {
        fp.clear();
      }
    }
    validarCampoFecha(fieldId);
  }

  function initFlatpickrTimePickers() {
    if (!window.flatpickr) return;

    const timeConfigs = [
      { id: 'eventStartTime', defaultTime: '10:00' },
      { id: 'eventEndTime', defaultTime: '13:00' },
      { id: 'montajeStartTime', defaultTime: '09:00' },
      { id: 'montajeEndTime', defaultTime: '10:00' },
      { id: 'desmontajeStartTime', defaultTime: '13:00' },
      { id: 'desmontajeEndTime', defaultTime: '14:00' },
      { id: 'ensayoStartTime', defaultTime: '08:00' },
      { id: 'ensayoEndTime', defaultTime: '09:00' }
    ];

    timeConfigs.forEach(cfg => {
      const input = $(cfg.id);
      if (!input) return;

      fpInstances[cfg.id] = window.flatpickr(input, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        minuteIncrement: 1,
        minTime: '06:00',
        maxTime: '22:00',
        disableMobile: true,
        allowInput: true,
        onReady: function (selectedDates, dateStr, instance) {
          injectCustomTimeElements(instance);
        },
        onOpen: function (selectedDates, dateStr, instance) {
          injectCustomTimeElements(instance);
        },
        onChange: function () {
          validarCampoHora(cfg.id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        },
        onClose: function () {
          validarCampoHora(cfg.id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        }
      });

      const wrap = $(`wrap_${cfg.id}`);
      if (wrap) {
        const icon = wrap.querySelector('.icono-reloj');
        if (icon) {
          icon.addEventListener('click', () => {
            if (!input.disabled && fpInstances[cfg.id]) {
              fpInstances[cfg.id].open();
            }
          });
        }
      }

      input.addEventListener('blur', function (e) {
        const val = input.value.trim();
        if (!val) {
          validarCampoHora(cfg.id);
          return;
        }
        const isValidFormat = /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
        const m = timeToMinutes(val);
        const inRange = isValidFormat && m >= REGULAR_HOURS.START_MINUTES && m <= REGULAR_HOURS.END_MINUTES;
        if (!isValidFormat || !inRange) {
          e.stopImmediatePropagation();
        }
        validarCampoHora(cfg.id);
        actualizarResumenHorario();
        actualizarEstadoDiferencias();
      }, true);

      input.addEventListener('input', function () {
        validarCampoHora(cfg.id);
        actualizarResumenHorario();
        actualizarEstadoDiferencias();
      });
    });
  }

  function setTimeFieldValue(fieldId, timeStr) {
    const input = $(fieldId);
    if (!input) return;

    const cleanVal = timeStr ? timeStr.trim() : '';
    input.value = cleanVal;

    const fp = fpInstances[fieldId];
    if (fp) {
      if (cleanVal && /^([01]\d|2[0-3]):[0-5]\d$/.test(cleanVal)) {
        fp.setDate(cleanVal, false);
      } else {
        fp.clear();
      }
    }
    validarCampoHora(fieldId);
  }

  function injectCustomTimeElements(instance) {
    const calendarContainer = instance.calendarContainer;
    if (!calendarContainer) return;

    const timeWrapper = calendarContainer.querySelector('.flatpickr-time');
    if (timeWrapper && !timeWrapper.querySelector('.time-input-labels')) {
      const labelsDiv = document.createElement('div');
      labelsDiv.className = 'time-input-labels';
      labelsDiv.innerHTML = '<span>Hora</span><span>Minutos</span>';
      timeWrapper.insertBefore(labelsDiv, timeWrapper.firstChild);
    }

    if (!calendarContainer.querySelector('.flatpickr-action-bar')) {
      const actionBar = document.createElement('div');
      actionBar.className = 'flatpickr-action-bar';
      const readyBtn = document.createElement('button');
      readyBtn.type = 'button';
      readyBtn.className = 'flatpickr-ready-btn';
      readyBtn.textContent = 'Listo';
      readyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        instance.close();
      });
      actionBar.appendChild(readyBtn);
      calendarContainer.appendChild(actionBar);
    }
  }

  // =========================================================================
  // 7. Validaciones de Formulario
  // =========================================================================
  function validarCampoFecha(fieldId) {
    const input = $(fieldId);
    if (!input) return null;

    if (fieldId === 'montajeDate' && (!dom.chkMontaje || !dom.chkMontaje.checked)) {
      limpiarErrorCampo(fieldId);
      return null;
    }
    if (fieldId === 'desmontajeDate' && (!dom.chkDesmontaje || !dom.chkDesmontaje.checked)) {
      limpiarErrorCampo(fieldId);
      return null;
    }
    if (fieldId === 'ensayoDate' && (!dom.chkEnsayo || !dom.chkEnsayo.checked)) {
      limpiarErrorCampo(fieldId);
      return null;
    }

    const val = input.value.trim();
    const errId = 'err' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
    const errElem = $(errId);

    if (!val) {
      input.classList.add('input-error');
      if (errElem) errElem.textContent = 'Fecha obligatoria';
      return 'Fecha obligatoria';
    }

    const norm = normalizarFecha(val);
    if (!norm || !/^\d{4}-\d{2}-\d{2}$/.test(norm)) {
      input.classList.add('input-error');
      if (errElem) errElem.textContent = 'Formato inválido (dd/mm/aaaa)';
      return 'Formato inválido';
    }

    limpiarErrorCampo(fieldId);
    return null;
  }

  function validarCampoHora(fieldId) {
    const input = $(fieldId);
    if (!input) return null;

    if ((fieldId === 'montajeStartTime' || fieldId === 'montajeEndTime') && (!dom.chkMontaje || !dom.chkMontaje.checked)) {
      limpiarErrorCampo(fieldId);
      return null;
    }
    if ((fieldId === 'desmontajeStartTime' || fieldId === 'desmontajeEndTime') && (!dom.chkDesmontaje || !dom.chkDesmontaje.checked)) {
      limpiarErrorCampo(fieldId);
      return null;
    }
    if ((fieldId === 'ensayoStartTime' || fieldId === 'ensayoEndTime') && (!dom.chkEnsayo || !dom.chkEnsayo.checked)) {
      limpiarErrorCampo(fieldId);
      return null;
    }

    const val = input.value.trim();
    const errId = 'err' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
    const errElem = $(errId);

    if (!val) {
      input.classList.add('input-error');
      if (errElem) errElem.textContent = 'Hora requerida';
      return 'Hora requerida';
    }

    const m = timeToMinutes(val);
    if (m < 0) {
      input.classList.add('input-error');
      if (errElem) errElem.textContent = 'Formato HH:mm inválido';
      return 'Formato inválido';
    }

    if (m < REGULAR_HOURS.START_MINUTES || m > REGULAR_HOURS.END_MINUTES) {
      input.classList.add('input-error');
      if (errElem) errElem.textContent = 'Fuera de rango (06:00 a 22:00)';
      return 'Fuera de rango';
    }

    limpiarErrorCampo(fieldId);
    return null;
  }

  function limpiarErrorCampo(fieldId) {
    const input = $(fieldId);
    if (input) input.classList.remove('input-error');
    const errId = 'err' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
    const errElem = $(errId);
    if (errElem) errElem.textContent = '';
  }

  function validarFormularioPaso2() {
    let primerError = null;

    const nombre = dom.eventName.value.trim();
    if (!nombre) {
      dom.eventName.classList.add('input-error');
      const err = $('errEventName'); if (err) err.textContent = 'El nombre del evento es obligatorio';
      if (!primerError) primerError = 'El nombre del evento es obligatorio';
    } else {
      dom.eventName.classList.remove('input-error');
      const err = $('errEventName'); if (err) err.textContent = '';
    }

    const contacto = dom.eventContact.value.trim();
    if (!contacto) {
      dom.eventContact.classList.add('input-error');
      const err = $('errEventContact'); if (err) err.textContent = 'La persona de contacto es obligatoria';
      if (!primerError) primerError = 'La persona de contacto es obligatoria';
    } else {
      dom.eventContact.classList.remove('input-error');
      const err = $('errEventContact'); if (err) err.textContent = '';
    }

    // Validar Motivo de la solicitud (OBLIGATORIO)
    const motivo = dom.requestReason ? dom.requestReason.value.trim() : '';
    if (!motivo) {
      if (dom.requestReason) dom.requestReason.classList.add('input-error');
      if (dom.errRequestReason) dom.errRequestReason.textContent = 'Debe indicar el motivo de la solicitud de modificación';
      if (!primerError) primerError = 'Debe indicar el motivo de la solicitud de modificación';
    } else {
      if (dom.requestReason) dom.requestReason.classList.remove('input-error');
      if (dom.errRequestReason) dom.errRequestReason.textContent = '';
    }

    // Fechas y horas
    const camposValidar = ['eventDate', 'eventStartTime', 'eventEndTime'];
    if (dom.chkMontaje.checked) camposValidar.push('montajeDate', 'montajeStartTime', 'montajeEndTime');
    if (dom.chkDesmontaje.checked) camposValidar.push('desmontajeDate', 'desmontajeStartTime', 'desmontajeEndTime');
    if (dom.chkEnsayo.checked) camposValidar.push('ensayoDate', 'ensayoStartTime', 'ensayoEndTime');

    camposValidar.forEach(fid => {
      const e = fid.includes('Date') ? validarCampoFecha(fid) : validarCampoHora(fid);
      if (e && !primerError) primerError = e;
    });

    if (primerError) return primerError;

    // Validar coherencia temporal del evento
    const f = getValoresFormulario();
    const evStart = timeToMinutes(f.startTime);
    const evEnd = timeToMinutes(f.endTime);

    if (evStart >= evEnd) {
      dom.eventStartTime.classList.add('input-error');
      dom.eventEndTime.classList.add('input-error');
      return 'La hora de inicio del evento debe ser anterior a la hora de fin.';
    }

    // Montaje
    if (f.hasMontaje) {
      const mStart = timeToMinutes(f.montajeStart);
      const mEnd = timeToMinutes(f.montajeEnd);
      if (mStart >= mEnd) return 'El inicio del montaje debe ser anterior a su fin.';
      if (f.montajeDate === f.date && mEnd > evStart) {
        return 'El montaje no puede finalizar después del inicio del evento.';
      }
    }

    // Desmontaje
    if (f.hasDesmontaje) {
      const dStart = timeToMinutes(f.desmontajeStart);
      const dEnd = timeToMinutes(f.desmontajeEnd);
      if (dStart >= dEnd) return 'El inicio del desmontaje debe ser anterior a su fin.';
      if (f.desmontajeDate === f.date && dStart < evEnd) {
        return 'El desmontaje no puede iniciar antes del fin del evento.';
      }
    }

    // Ensayo
    if (f.hasEnsayo) {
      const eStart = timeToMinutes(f.ensayoStart);
      const eEnd = timeToMinutes(f.ensayoEnd);
      if (eStart >= eEnd) return 'El inicio del ensayo debe ser anterior a su fin.';
      if (f.ensayoDate === f.date) {
        if (eEnd > evStart) {
          return 'El ensayo debe culminar antes de la hora de inicio del evento.';
        }
        if (f.hasMontaje && f.montajeDate === f.date) {
          const mStart = timeToMinutes(f.montajeStart);
          const mEnd = timeToMinutes(f.montajeEnd);
          if (!(eEnd <= mStart || eStart >= mEnd)) {
            return 'El ensayo no puede cruzarse con el montaje del evento.';
          }
        }
      }
    }

    // Validar que exista AL MENOS UN CAMBIO EFECTIVO en los datos del evento
    const diffs = calcularDiferencias();
    if (diffs.length === 0) {
      return 'No se han detectado modificaciones en los datos ni horarios del evento. Debe proponer al menos un cambio antes de continuar.';
    }

    // Comprobación preliminar de disponibilidad (conflicto local sin datos ajenos)
    const conflicto = comprobarConflictoPreliminar(f);
    if (conflicto) {
      return conflicto;
    }

    return null;
  }

  function comprobarConflictoPreliminar(f) {
    const fEvStart = timeToMinutes(f.startTime);
    const fEvEnd = timeToMinutes(f.endTime);

    // Calcular límites totales del bloque solicitado en la fecha principal
    let bloqueInicio = fEvStart;
    let bloqueFin = fEvEnd;

    if (f.hasMontaje && f.montajeDate === f.date) {
      bloqueInicio = Math.min(bloqueInicio, timeToMinutes(f.montajeStart));
    }
    if (f.hasDesmontaje && f.desmontajeDate === f.date) {
      bloqueFin = Math.max(bloqueFin, timeToMinutes(f.desmontajeEnd));
    }
    if (f.hasEnsayo && f.ensayoDate === f.date) {
      bloqueInicio = Math.min(bloqueInicio, timeToMinutes(f.ensayoStart));
    }

    // Revisar otros eventos confirmados (excluyendo la reserva actual)
    for (const ev of eventsData) {
      if (ev.id === currentEventId) continue;
      if (ev.date !== f.date) continue;

      let otroIni = timeToMinutes(ev.startTime);
      let otroFin = timeToMinutes(ev.endTime);

      if (ev.hasMontaje && (ev.montajeDate || ev.date) === f.date) {
        otroIni = Math.min(otroIni, timeToMinutes(ev.montajeStart));
      }
      if (ev.hasDesmontaje && (ev.desmontajeDate || ev.date) === f.date) {
        otroFin = Math.max(otroFin, timeToMinutes(ev.desmontajeEnd));
      }
      if (ev.hasEnsayo && ev.ensayoDate === f.date) {
        otroIni = Math.min(otroIni, timeToMinutes(ev.ensayoStart));
      }

      // Comprobar traslape
      if (bloqueInicio < otroFin && bloqueFin > otroIni) {
        // Mensaje genérico y respetuoso: NO revelar el nombre ni cliente del otro evento
        return 'El auditorio ya cuenta con una reserva programada en este horario. Por favor, seleccione otro horario antes de enviar la solicitud.';
      }
    }

    // Revisar bloqueos institucionales
    for (const blk of INSTITUTIONAL_BLOCKS) {
      if (blk.date !== f.date) continue;
      const bIni = timeToMinutes(blk.startTime);
      const bFin = timeToMinutes(blk.endTime);
      if (bloqueInicio < bFin && bloqueFin > bIni) {
        return 'El auditorio se encuentra reservado para mantenimiento institucional en ese horario. Por favor, seleccione otro horario.';
      }
    }

    return null;
  }

  // =========================================================================
  // 8. Navegación en Cuatro Pasos del Cliente
  // =========================================================================
  function irPasoCliente(n) {
    if (pasoActual === 2 && n > 2) {
      const err = validarFormularioPaso2();
      if (err) {
        dom.errorPaso2Cliente.textContent = err;
        return;
      }
      dom.errorPaso2Cliente.textContent = '';
    }

    pasoActual = n;

    for (let i = 1; i <= 4; i++) {
      const sec = $('cs' + i);
      if (sec) sec.classList.toggle('oculto', i !== n);
    }

    for (let i = 1; i <= 4; i++) {
      const p = $('cp' + i);
      if (p) {
        p.classList.toggle('activo', i === n);
        p.classList.toggle('hecho', i < n);
      }
    }

    if (n === 1) {
      renderPaso1Eventos();
    } else if (n === 2) {
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    } else if (n === 3) {
      prepararPaso3Revision();
    } else if (n === 4) {
      prepararPaso4Confirmacion();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.irPasoCliente = irPasoCliente;

  function volverPaso1ConConfirmacion() {
    if (hayCambiosPendientes()) {
      abrirModalDescartarCliente('Tiene cambios propuestos en el formulario que aún no se han enviado. ¿Desea descartarlos y volver a la lista de eventos?');
    } else {
      irPasoCliente(1);
    }
  }
  window.volverPaso1ConConfirmacion = volverPaso1ConConfirmacion;

  // =========================================================================
  // 9. Paso 1: Mis Eventos y Solicitudes
  // =========================================================================
  function renderPaso1Eventos() {
    const eventos = getEventosDelCliente();
    const cont = dom.listaEventosCliente;
    if (!cont) return;

    if (eventos.length === 0) {
      cont.innerHTML = `
        <div class="aviso aviso-info">
          No cuenta con eventos registrados bajo el cliente <strong>${escapeHtml(CLIENTE_ACTUAL.razonSocial)}</strong>.
        </div>
      `;
      return;
    }

    cont.innerHTML = eventos.map(ev => {
      const solPendiente = getSolicitudPendienteEvento(ev.id);
      const tieneSol = !!solPendiente;

      const techInfo = [];
      if (ev.hasMontaje) techInfo.push(`Montaje: ${ev.montajeStart} - ${ev.montajeEnd || ev.startTime}`);
      if (ev.hasDesmontaje) techInfo.push(`Desmontaje: ${ev.desmontajeStart || ev.endTime} - ${ev.desmontajeEnd}`);
      if (ev.hasEnsayo) techInfo.push(`Ensayo: ${ev.ensayoStart} - ${ev.ensayoEnd}`);
      const techStr = techInfo.length > 0 ? techInfo.join(' &bull; ') : 'Sin tiempos técnicos adicionales';

      return `
        <div class="tarjeta-evento-cliente">
          <div class="tarjeta-evento-cabecera">
            <div>
              <span class="codigo-pill">${escapeHtml(ev.code)}</span>
              <h3 style="margin-top: 4px;">${escapeHtml(ev.name)}</h3>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <span class="badge-confirmado">Evento ${escapeHtml(ev.status)}</span>
              ${tieneSol ? `<span class="badge-solicitud-pendiente" title="Tiene una solicitud en trámite">Modificación en trámite (${escapeHtml(solPendiente.id)})</span>` : ''}
            </div>
          </div>

          <div class="tarjeta-evento-detalles">
            <div class="tarjeta-evento-detalles-item">
              <small>Espacio asignado</small>
              <strong>${escapeHtml(ev.space || 'Auditorio Showtech')}</strong>
            </div>
            <div class="tarjeta-evento-detalles-item">
              <small>Fecha confirmada</small>
              <strong>${fechaPe(ev.date)}</strong>
            </div>
            <div class="tarjeta-evento-detalles-item">
              <small>Horario del evento</small>
              <strong>${ev.startTime} - ${ev.endTime}</strong>
            </div>
            <div class="tarjeta-evento-detalles-item">
              <small>Tiempos técnicos</small>
              <span>${techStr}</span>
            </div>
          </div>

          <div class="tarjeta-evento-pie">
            <div>
              ${tieneSol
                ? `<small style="color:var(--gris);">* Ya tiene una solicitud en revisión registrada el ${escapeHtml(solPendiente.displayDate || '')}.</small>`
                : `<small style="color:var(--gris);">* Puede solicitar cambios de fecha, horarios, tiempos técnicos o requerimientos.</small>`
              }
            </div>
            <div style="display:flex; gap:8px;">
              ${tieneSol
                ? `<button type="button" class="btn btn-sec" onclick="window.verDetalleSolicitud('${escapeHtml(solPendiente.id)}')">
                     Ver solicitud en trámite
                   </button>
                   <button type="button" class="btn btn-primario" disabled title="No se permite una segunda solicitud mientras una esté en revisión">
                     Solicitar modificación
                   </button>`
                : `<button type="button" class="btn btn-primario" onclick="window.iniciarSolicitudModificacion('${escapeHtml(ev.id)}')">
                     Solicitar modificación &rarr;
                   </button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderSolicitudesCliente();
  }

  function renderBadgeEstadoSolicitud(status) {
    if (status === 'Pendiente de revisión') {
      return `<span class="badge-solicitud-pendiente">${escapeHtml(status)}</span>`;
    }
    if (status === 'Retirada por el cliente') {
      return `<span class="badge-solicitud-retirada">${escapeHtml(status)}</span>`;
    }
    if (status === 'Aprobada') {
      return `<span class="badge-confirmado">Aprobada</span>`;
    }
    return `<span class="badge-solicitud-rechazada">${escapeHtml(status)}</span>`;
  }

  function renderSolicitudesCliente() {
    const cont = dom.contenedorSolicitudesCliente;
    if (!cont) return;

    // Filtrar solicitudes del cliente actual
    const misSolicitudes = solicitudesData.filter(s => s.clientId === CLIENTE_ACTUAL.id || s.clientName === CLIENTE_ACTUAL.razonSocial);

    if (misSolicitudes.length === 0) {
      cont.innerHTML = `
        <p class="ayuda" style="margin-top: 8px;">Aún no ha enviado solicitudes de modificación para sus eventos.</p>
      `;
      return;
    }

    cont.innerHTML = `
      <div class="tabla-wrap">
        <table class="tabla-solicitudes">
          <thead>
            <tr>
              <th>Código</th>
              <th>Evento</th>
              <th>Fecha de envío</th>
              <th>Cambios solicitados</th>
              <th>Estado</th>
              <th class="num-der">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${misSolicitudes.map(s => {
              const cantCambios = Array.isArray(s.proposedChanges) ? s.proposedChanges.length : 0;
              return `
                <tr>
                  <td><span class="badge-solicitud-codigo">${escapeHtml(s.id)}</span></td>
                  <td><strong>${escapeHtml(s.eventCode)}</strong> &bull; ${escapeHtml(s.eventName)}</td>
                  <td>${escapeHtml(s.displayDate || s.timestamp)}</td>
                  <td>${cantCambios} campo(s) propuesto(s)</td>
                  <td>${renderBadgeEstadoSolicitud(s.status)}</td>
                  <td class="num-der">
                    <button type="button" class="btn btn-sec" style="padding:4px 8px; font-size:12px;" onclick="window.verDetalleSolicitud('${escapeHtml(s.id)}')">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  window.iniciarSolicitudModificacion = function (eventId) {
    const solExistente = getSolicitudPendienteEvento(eventId);
    if (solExistente) {
      showToast('Ya cuenta con una solicitud pendiente para este evento. Puede consultar su estado.', 'info');
      verDetalleSolicitud(solExistente.id);
      return;
    }
    cargarEventoEnFormulario(eventId);
    irPasoCliente(2);
  };

  // =========================================================================
  // 10. Paso 2: Formulario de Propuesta de Cambios
  // =========================================================================
  function cargarEventoEnFormulario(eventId) {
    currentEventId = eventId;
    const ev = getCurrentEvent();
    if (!ev) return;

    originalSnapshot = JSON.parse(JSON.stringify(ev));

    // Datos de solo lectura
    dom.eventCode.value = ev.code || ev.id;
    dom.eventSpace.value = ev.space || 'Auditorio Showtech';
    dom.eventClient.value = ev.client || CLIENTE_ACTUAL.razonSocial;
    dom.badgeEventoClientePaso2.textContent = `${ev.code} • Confirmado`;

    // Campos editables
    dom.eventName.value = ev.name || '';
    dom.eventContact.value = ev.contact || '';
    dom.eventPhone.value = ev.phone || '';
    dom.eventEmail.value = ev.email || '';
    dom.eventNotes.value = ev.notes || '';

    // Fecha y horas del evento
    setDateFieldValue('eventDate', ev.date || '');
    setTimeFieldValue('eventStartTime', ev.startTime || '');
    setTimeFieldValue('eventEndTime', ev.endTime || '');

    // Montaje
    dom.chkMontaje.checked = !!ev.hasMontaje;
    dom.fieldsMontaje.classList.toggle('oculto', !ev.hasMontaje);
    if (dom.panelMontaje) dom.panelMontaje.classList.toggle('desactivada', !ev.hasMontaje);
    dom.montajeDate.disabled = !ev.hasMontaje;
    dom.montajeStartTime.disabled = !ev.hasMontaje;
    dom.montajeEndTime.disabled = !ev.hasMontaje;
    setDateFieldValue('montajeDate', ev.montajeDate || ev.date || '');
    setTimeFieldValue('montajeStartTime', ev.montajeStart || '');
    setTimeFieldValue('montajeEndTime', ev.montajeEnd || ev.startTime || '');

    // Desmontaje
    dom.chkDesmontaje.checked = !!ev.hasDesmontaje;
    dom.fieldsDesmontaje.classList.toggle('oculto', !ev.hasDesmontaje);
    if (dom.panelDesmontaje) dom.panelDesmontaje.classList.toggle('desactivada', !ev.hasDesmontaje);
    dom.desmontajeDate.disabled = !ev.hasDesmontaje;
    dom.desmontajeStartTime.disabled = !ev.hasDesmontaje;
    dom.desmontajeEndTime.disabled = !ev.hasDesmontaje;
    setDateFieldValue('desmontajeDate', ev.desmontajeDate || ev.date || '');
    setTimeFieldValue('desmontajeStartTime', ev.desmontajeStart || ev.endTime || '');
    setTimeFieldValue('desmontajeEndTime', ev.desmontajeEnd || '');

    // Ensayo
    dom.chkEnsayo.checked = !!ev.hasEnsayo;
    dom.fieldsEnsayo.classList.toggle('oculto', !ev.hasEnsayo);
    if (dom.panelEnsayo) dom.panelEnsayo.classList.toggle('desactivada', !ev.hasEnsayo);
    dom.ensayoDate.disabled = !ev.hasEnsayo;
    dom.ensayoStartTime.disabled = !ev.hasEnsayo;
    dom.ensayoEndTime.disabled = !ev.hasEnsayo;
    setDateFieldValue('ensayoDate', ev.ensayoDate || '');
    setTimeFieldValue('ensayoStartTime', ev.ensayoStart || '');
    setTimeFieldValue('ensayoEndTime', ev.ensayoEnd || '');

    // Motivo
    if (dom.requestReason) dom.requestReason.value = '';
    if (dom.errRequestReason) dom.errRequestReason.textContent = '';
    if (dom.errorPaso2Cliente) dom.errorPaso2Cliente.textContent = '';

    actualizarResumenHorario();
    actualizarEstadoDiferencias();
  }

  function getValoresFormulario() {
    return {
      code: dom.eventCode.value.trim(),
      space: dom.eventSpace.value.trim(),
      client: dom.eventClient.value.trim(),
      name: dom.eventName.value.trim(),
      contact: dom.eventContact.value.trim(),
      phone: dom.eventPhone.value.trim(),
      email: dom.eventEmail.value.trim(),
      notes: dom.eventNotes.value.trim(),

      date: normalizarFecha(dom.eventDate.value),
      startTime: normalizarHora(dom.eventStartTime.value),
      endTime: normalizarHora(dom.eventEndTime.value),

      hasMontaje: dom.chkMontaje.checked,
      montajeDate: dom.chkMontaje.checked ? normalizarFecha(dom.montajeDate.value) : '',
      montajeStart: dom.chkMontaje.checked ? normalizarHora(dom.montajeStartTime.value) : '',
      montajeEnd: dom.chkMontaje.checked ? normalizarHora(dom.montajeEndTime.value) : '',

      hasDesmontaje: dom.chkDesmontaje.checked,
      desmontajeDate: dom.chkDesmontaje.checked ? normalizarFecha(dom.desmontajeDate.value) : '',
      desmontajeStart: dom.chkDesmontaje.checked ? normalizarHora(dom.desmontajeStartTime.value) : '',
      desmontajeEnd: dom.chkDesmontaje.checked ? normalizarHora(dom.desmontajeEndTime.value) : '',

      hasEnsayo: dom.chkEnsayo.checked,
      ensayoDate: dom.chkEnsayo.checked ? normalizarFecha(dom.ensayoDate.value) : '',
      ensayoStart: dom.chkEnsayo.checked ? normalizarHora(dom.ensayoStartTime.value) : '',
      ensayoEnd: dom.chkEnsayo.checked ? normalizarHora(dom.ensayoEndTime.value) : ''
    };
  }

  function calcularDiferencias() {
    if (!originalSnapshot) return [];
    const actual = getValoresFormulario();
    const diffs = [];

    const camposGenerales = [
      { key: 'name', label: 'Nombre del evento' },
      { key: 'contact', label: 'Persona de contacto' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'email', label: 'Correo electrónico' },
      { key: 'notes', label: 'Observaciones y requerimientos' },
      { key: 'date', label: 'Fecha del evento', esFecha: true },
      { key: 'startTime', label: 'Hora de inicio del evento' },
      { key: 'endTime', label: 'Hora de fin del evento' }
    ];

    camposGenerales.forEach(c => {
      let origVal = originalSnapshot[c.key] || '';
      let actVal = actual[c.key] || '';
      if (c.esFecha) {
        origVal = normalizarFecha(origVal);
        actVal = normalizarFecha(actVal);
      } else if (c.key === 'startTime' || c.key === 'endTime') {
        origVal = normalizarHora(origVal);
        actVal = normalizarHora(actVal);
      }
      if (origVal !== actVal) {
        diffs.push({
          campo: c.label,
          anterior: c.esFecha ? fechaPe(origVal) : (origVal || '(vacío)'),
          nuevo: c.esFecha ? fechaPe(actVal) : (actVal || '(vacío)')
        });
      }
    });

    // Montaje
    const origMontDate = normalizarFecha(originalSnapshot.montajeDate || originalSnapshot.date);
    const origMontStart = normalizarHora(originalSnapshot.montajeStart);
    const origMontEnd = normalizarHora(originalSnapshot.montajeEnd || originalSnapshot.startTime);
    const origMontStr = originalSnapshot.hasMontaje
      ? `${fechaPe(origMontDate)} (${origMontStart} - ${origMontEnd})`
      : 'No requiere';
    const actMontDate = normalizarFecha(actual.montajeDate);
    const actMontStart = normalizarHora(actual.montajeStart);
    const actMontEnd = normalizarHora(actual.montajeEnd);
    const actMontStr = actual.hasMontaje
      ? `${fechaPe(actMontDate)} (${actMontStart} - ${actMontEnd})`
      : 'No requiere';
    if (origMontStr !== actMontStr) {
      diffs.push({ campo: 'Montaje técnico previo', anterior: origMontStr, nuevo: actMontStr });
    }

    // Desmontaje
    const origDesmDate = normalizarFecha(originalSnapshot.desmontajeDate || originalSnapshot.date);
    const origDesmStart = normalizarHora(originalSnapshot.desmontajeStart || originalSnapshot.endTime);
    const origDesmEnd = normalizarHora(originalSnapshot.desmontajeEnd);
    const origDesmStr = originalSnapshot.hasDesmontaje
      ? `${fechaPe(origDesmDate)} (${origDesmStart} - ${origDesmEnd})`
      : 'No requiere';
    const actDesmDate = normalizarFecha(actual.desmontajeDate);
    const actDesmStart = normalizarHora(actual.desmontajeStart);
    const actDesmEnd = normalizarHora(actual.desmontajeEnd);
    const actDesmStr = actual.hasDesmontaje
      ? `${fechaPe(actDesmDate)} (${actDesmStart} - ${actDesmEnd})`
      : 'No requiere';
    if (origDesmStr !== actDesmStr) {
      diffs.push({ campo: 'Desmontaje técnico posterior', anterior: origDesmStr, nuevo: actDesmStr });
    }

    // Ensayo
    const origEnsDate = normalizarFecha(originalSnapshot.ensayoDate);
    const origEnsStart = normalizarHora(originalSnapshot.ensayoStart);
    const origEnsEnd = normalizarHora(originalSnapshot.ensayoEnd);
    const origEnsStr = originalSnapshot.hasEnsayo
      ? `${fechaPe(origEnsDate)} (${origEnsStart} - ${origEnsEnd})`
      : 'No requiere';
    const actEnsDate = normalizarFecha(actual.ensayoDate);
    const actEnsStart = normalizarHora(actual.ensayoStart);
    const actEnsEnd = normalizarHora(actual.ensayoEnd);
    const actEnsStr = actual.hasEnsayo
      ? `${fechaPe(actEnsDate)} (${actEnsStart} - ${actEnsEnd})`
      : 'No requiere';
    if (origEnsStr !== actEnsStr) {
      diffs.push({ campo: 'Ensayo técnico previo', anterior: origEnsStr, nuevo: actEnsStr });
    }

    return diffs;
  }

  function hayCambiosPendientes() {
    if (!originalSnapshot) return false;
    return calcularDiferencias().length > 0;
  }

  function actualizarEstadoDiferencias() {
    if (!originalSnapshot) return;
    const actual = getValoresFormulario();

    const origDate = normalizarFecha(originalSnapshot.date);
    const actDate = actual.date;
    const origStart = normalizarHora(originalSnapshot.startTime);
    const actStart = actual.startTime;
    const origEnd = normalizarHora(originalSnapshot.endTime);
    const actEnd = actual.endTime;

    // Badges datos generales
    dom.modBadgeEventName.classList.toggle('visible', actual.name !== (originalSnapshot.name || ''));
    dom.modBadgeEventContact.classList.toggle('visible', actual.contact !== (originalSnapshot.contact || ''));
    dom.modBadgeEventPhone.classList.toggle('visible', actual.phone !== (originalSnapshot.phone || ''));
    dom.modBadgeEventEmail.classList.toggle('visible', actual.email !== (originalSnapshot.email || ''));
    dom.modBadgeEventNotes.classList.toggle('visible', actual.notes !== (originalSnapshot.notes || ''));

    // Evento Principal
    dom.modBadgeEventDate.classList.toggle('visible', actDate !== origDate);
    dom.modBadgeEventStartTime.classList.toggle('visible', actStart !== origStart);
    dom.modBadgeEventEndTime.classList.toggle('visible', actEnd !== origEnd);

    // Montaje
    const origMontDate = normalizarFecha(originalSnapshot.montajeDate || originalSnapshot.date);
    const origMontStart = normalizarHora(originalSnapshot.montajeStart);
    const origMontEnd = normalizarHora(originalSnapshot.montajeEnd || originalSnapshot.startTime);
    dom.modBadgeMontajeDate.classList.toggle('visible', actual.hasMontaje && actual.montajeDate !== origMontDate);
    dom.modBadgeMontajeStart.classList.toggle('visible', actual.hasMontaje && actual.montajeStart !== origMontStart);
    dom.modBadgeMontajeEnd.classList.toggle('visible', actual.hasMontaje && actual.montajeEnd !== origMontEnd);

    // Desmontaje
    const origDesmDate = normalizarFecha(originalSnapshot.desmontajeDate || originalSnapshot.date);
    const origDesmStart = normalizarHora(originalSnapshot.desmontajeStart || originalSnapshot.endTime);
    const origDesmEnd = normalizarHora(originalSnapshot.desmontajeEnd);
    dom.modBadgeDesmontajeDate.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeDate !== origDesmDate);
    dom.modBadgeDesmontajeStart.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeStart !== origDesmStart);
    dom.modBadgeDesmontajeEnd.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeEnd !== origDesmEnd);

    // Ensayo
    const origHasEns = !!originalSnapshot.hasEnsayo;
    const actHasEns = !!actual.hasEnsayo;
    const ensayoRecienAnadido = actHasEns && !origHasEns;
    const ensayoYaExistia = actHasEns && origHasEns;

    if (dom.modBadgeEnsayoAdded) {
      dom.modBadgeEnsayoAdded.classList.toggle('visible', ensayoRecienAnadido);
    }

    if (ensayoRecienAnadido) {
      // Ensayo recién añadido: no marcar campos individuales
      dom.modBadgeEnsayoDate.classList.remove('visible');
      dom.modBadgeEnsayoStart.classList.remove('visible');
      dom.modBadgeEnsayoEnd.classList.remove('visible');
      dom.ensayoStartTime.classList.remove('campo-modificado');
      dom.ensayoEndTime.classList.remove('campo-modificado');
    } else if (ensayoYaExistia) {
      const origEnsDate = normalizarFecha(originalSnapshot.ensayoDate);
      const origEnsStart = normalizarHora(originalSnapshot.ensayoStart);
      const origEnsEnd = normalizarHora(originalSnapshot.ensayoEnd);

      const dateChanged = actual.ensayoDate !== origEnsDate;
      const startChanged = actual.ensayoStart !== origEnsStart;
      const endChanged = actual.ensayoEnd !== origEnsEnd;

      dom.modBadgeEnsayoDate.classList.toggle('visible', dateChanged);
      dom.modBadgeEnsayoStart.classList.toggle('visible', startChanged);
      dom.modBadgeEnsayoEnd.classList.toggle('visible', endChanged);

      dom.ensayoStartTime.classList.toggle('campo-modificado', startChanged);
      dom.ensayoEndTime.classList.toggle('campo-modificado', endChanged);
    } else {
      dom.modBadgeEnsayoDate.classList.remove('visible');
      dom.modBadgeEnsayoStart.classList.remove('visible');
      dom.modBadgeEnsayoEnd.classList.remove('visible');
      dom.ensayoStartTime.classList.remove('campo-modificado');
      dom.ensayoEndTime.classList.remove('campo-modificado');
    }

    // Resaltado visual en selectores
    dom.eventStartTime.classList.toggle('campo-modificado', actStart !== origStart);
    dom.eventEndTime.classList.toggle('campo-modificado', actEnd !== origEnd);
    dom.montajeStartTime.classList.toggle('campo-modificado', actual.hasMontaje && actual.montajeStart !== origMontStart);
    dom.montajeEndTime.classList.toggle('campo-modificado', actual.hasMontaje && actual.montajeEnd !== origMontEnd);
    dom.desmontajeStartTime.classList.toggle('campo-modificado', actual.hasDesmontaje && actual.desmontajeStart !== origDesmStart);
    dom.desmontajeEndTime.classList.toggle('campo-modificado', actual.hasDesmontaje && actual.desmontajeEnd !== origDesmEnd);
  }

  function actualizarResumenHorario() {
    const f = getValoresFormulario();
    const cont = dom.resumenHorarioItemsCliente;
    if (!cont) return;

    const items = [];

    if (f.hasEnsayo && f.ensayoStart && f.ensayoEnd) {
      const durEns = formatDuracionMin(timeToMinutes(f.ensayoEnd) - timeToMinutes(f.ensayoStart));
      items.push(`
        <span class="resumen-horario-pill pill-ensayo">
          <strong>Ensayo:</strong> ${f.ensayoStart} a ${f.ensayoEnd} (${durEns})
        </span>
      `);
    }

    if (f.hasMontaje && f.montajeStart && f.montajeEnd) {
      const durMont = formatDuracionMin(timeToMinutes(f.montajeEnd) - timeToMinutes(f.montajeStart));
      items.push(`
        <span class="resumen-horario-pill pill-montaje">
          <strong>Montaje:</strong> ${f.montajeStart} a ${f.montajeEnd} (${durMont})
        </span>
      `);
    }

    if (f.startTime && f.endTime) {
      const durEvt = formatDuracionMin(timeToMinutes(f.endTime) - timeToMinutes(f.startTime));
      items.push(`
        <span class="resumen-horario-pill pill-evento">
          <strong>Evento:</strong> ${f.startTime} a ${f.endTime} (${durEvt})
        </span>
      `);
    }

    if (f.hasDesmontaje && f.desmontajeStart && f.desmontajeEnd) {
      const durDesm = formatDuracionMin(timeToMinutes(f.desmontajeEnd) - timeToMinutes(f.desmontajeStart));
      items.push(`
        <span class="resumen-horario-pill pill-desmontaje">
          <strong>Desmontaje:</strong> ${f.desmontajeStart} a ${f.desmontajeEnd} (${durDesm})
        </span>
      `);
    }

    cont.innerHTML = items.join('');
  }

  // =========================================================================
  // 11. Paso 3: Revisión de la Solicitud
  // =========================================================================
  function generarListaCamposComparativos() {
    if (!originalSnapshot) return [];
    const act = getValoresFormulario();
    const orig = originalSnapshot;

    const origMontDate = normalizarFecha(orig.montajeDate || orig.date);
    const origMontStart = normalizarHora(orig.montajeStart);
    const origMontEnd = normalizarHora(orig.montajeEnd || orig.startTime);
    const actMontDate = normalizarFecha(act.montajeDate);
    const actMontStart = normalizarHora(act.montajeStart);
    const actMontEnd = normalizarHora(act.montajeEnd);

    const origMont = orig.hasMontaje
      ? `${fechaPe(origMontDate)} &bull; ${origMontStart} - ${origMontEnd}`
      : 'No requiere';
    const actMont = act.hasMontaje
      ? `${fechaPe(actMontDate)} &bull; ${actMontStart} - ${actMontEnd}`
      : 'No requiere';

    const origDesmDate = normalizarFecha(orig.desmontajeDate || orig.date);
    const origDesmStart = normalizarHora(orig.desmontajeStart || orig.endTime);
    const origDesmEnd = normalizarHora(orig.desmontajeEnd);
    const actDesmDate = normalizarFecha(act.desmontajeDate);
    const actDesmStart = normalizarHora(act.desmontajeStart);
    const actDesmEnd = normalizarHora(act.desmontajeEnd);

    const origDesm = orig.hasDesmontaje
      ? `${fechaPe(origDesmDate)} &bull; ${origDesmStart} - ${origDesmEnd}`
      : 'No requiere';
    const actDesm = act.hasDesmontaje
      ? `${fechaPe(actDesmDate)} &bull; ${actDesmStart} - ${actDesmEnd}`
      : 'No requiere';

    const origEnsDate = normalizarFecha(orig.ensayoDate);
    const origEnsStart = normalizarHora(orig.ensayoStart);
    const origEnsEnd = normalizarHora(orig.ensayoEnd);
    const actEnsDate = normalizarFecha(act.ensayoDate);
    const actEnsStart = normalizarHora(act.ensayoStart);
    const actEnsEnd = normalizarHora(act.ensayoEnd);

    const origEns = orig.hasEnsayo
      ? `${fechaPe(origEnsDate)} &bull; ${origEnsStart} - ${origEnsEnd}`
      : 'No requiere';
    const actEns = act.hasEnsayo
      ? `${fechaPe(actEnsDate)} &bull; ${actEnsStart} - ${actEnsEnd}`
      : 'No requiere';

    const origDateNorm = normalizarFecha(orig.date);
    const actDateNorm = normalizarFecha(act.date);
    const origStartNorm = normalizarHora(orig.startTime);
    const actStartNorm = normalizarHora(act.startTime);
    const origEndNorm = normalizarHora(orig.endTime);
    const actEndNorm = normalizarHora(act.endTime);

    return [
      { campo: 'Nombre del evento', actual: orig.name, propuesto: act.name, modificado: orig.name !== act.name },
      { campo: 'Persona de contacto', actual: orig.contact, propuesto: act.contact, modificado: orig.contact !== act.contact },
      { campo: 'Teléfono', actual: orig.phone || '(sin teléfono)', propuesto: act.phone || '(sin teléfono)', modificado: (orig.phone || '') !== (act.phone || '') },
      { campo: 'Correo electrónico', actual: orig.email || '(sin correo)', propuesto: act.email || '(sin correo)', modificado: (orig.email || '') !== (act.email || '') },
      { campo: 'Observaciones y requerimientos', actual: orig.notes || '(sin observaciones)', propuesto: act.notes || '(sin observaciones)', modificado: (orig.notes || '') !== (act.notes || '') },
      { campo: 'Fecha del evento', actual: fechaPe(origDateNorm), propuesto: fechaPe(actDateNorm), modificado: origDateNorm !== actDateNorm },
      { campo: 'Horario del evento', actual: `${origStartNorm} - ${origEndNorm}`, propuesto: `${actStartNorm} - ${actEndNorm}`, modificado: (origStartNorm !== actStartNorm || origEndNorm !== actEndNorm) },
      { campo: 'Montaje técnico previo', actual: origMont, propuesto: actMont, modificado: origMont !== actMont },
      { campo: 'Desmontaje técnico posterior', actual: origDesm, propuesto: actDesm, modificado: origDesm !== actDesm },
      { campo: 'Ensayo técnico previo', actual: origEns, propuesto: actEns, modificado: origEns !== actEns }
    ];
  }

  function prepararPaso3Revision() {
    const items = generarListaCamposComparativos();
    const cont = dom.diffTableContainerCliente;
    if (!cont) return;

    cont.innerHTML = `
      <table class="comparativo-tabla">
        <thead>
          <tr>
            <th class="col-campo">Campo del evento</th>
            <th class="col-actual">Datos actuales (vigentes)</th>
            <th class="col-propuesto">Cambios solicitados</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const esMod = !!item.modificado;
            return `
              <tr class="${esMod ? 'fila-modificada' : ''}">
                <td class="col-campo">${escapeHtml(item.campo)}</td>
                <td class="col-actual">${item.actual}</td>
                <td class="col-propuesto ${esMod ? 'modificado' : ''}">
                  ${item.propuesto}
                  ${esMod ? '<span class="pill-mod-inline">Modificado</span>' : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Motivo registrado
    const motivo = dom.requestReason ? dom.requestReason.value.trim() : '';
    if (dom.motivoReviewTexto) {
      dom.motivoReviewTexto.textContent = motivo || '(No especificado)';
    }

    if (dom.errorPaso3Cliente) {
      dom.errorPaso3Cliente.textContent = '';
    }

    if (dom.btnEnviarSolicitud) {
      dom.btnEnviarSolicitud.disabled = false;
      dom.btnEnviarSolicitud.textContent = 'Enviar solicitud de modificación →';
    }
  }

  // =========================================================================
  // 12. Enviar Solicitud y Confirmación (Paso 4)
  // =========================================================================
  function ejecutarEnvioSolicitud() {
    if (isSubmitting) return;

    // 1. Validar que no haya una solicitud pendiente para este mismo evento
    const solExistente = getSolicitudPendienteEvento(currentEventId);
    if (solExistente) {
      showToast('Ya existe una solicitud pendiente de revisión para este evento.', 'error');
      if (dom.errorPaso3Cliente) {
        dom.errorPaso3Cliente.textContent = `Ya cuenta con la solicitud ${solExistente.id} en revisión. No es posible registrar una segunda solicitud en paralelo.`;
      }
      return;
    }

    // 2. Validar cambios efectivos y motivo
    const diffs = calcularDiferencias();
    if (diffs.length === 0) {
      if (dom.errorPaso3Cliente) dom.errorPaso3Cliente.textContent = 'No hay modificaciones detectadas para enviar.';
      return;
    }

    const motivo = dom.requestReason ? dom.requestReason.value.trim() : '';
    if (!motivo) {
      if (dom.errorPaso3Cliente) dom.errorPaso3Cliente.textContent = 'Debe indicar el motivo de la solicitud.';
      return;
    }

    // Prevención de doble clic
    isSubmitting = true;
    if (dom.btnEnviarSolicitud) {
      dom.btnEnviarSolicitud.disabled = true;
      dom.btnEnviarSolicitud.textContent = 'Enviando solicitud...';
    }

    const ev = getCurrentEvent();
    const proposedData = getValoresFormulario();

    // Generar correlativo único de solicitud
    const numRandom = Math.floor(100 + Math.random() * 900);
    const corrId = `SOL-${new Date().getFullYear()}-${numRandom}`;
    const timestamp = new Date().toISOString();
    const displayDate = new Date().toLocaleString('es-PE');

    const nuevaSolicitud = {
      id: corrId,
      clientId: CLIENTE_ACTUAL.id,
      clientName: CLIENTE_ACTUAL.razonSocial,
      eventId: ev.id,
      eventCode: ev.code,
      eventName: ev.name,
      timestamp: timestamp,
      displayDate: displayDate,
      originalSnapshot: JSON.parse(JSON.stringify(originalSnapshot)),
      proposedChanges: diffs,
      proposedData: JSON.parse(JSON.stringify(proposedData)),
      reason: motivo,
      status: 'Pendiente de revisión'
    };

    // Intentar persistir en localStorage compartido
    try {
      solicitudesData.unshift(nuevaSolicitud);
      saveSolicitudesStorage();
    } catch (e) {
      // Manejo de fallo de almacenamiento: conservar formulario y advertir
      console.error('Error al guardar solicitud en storage:', e);
      solicitudesData.shift(); // revertir memoria
      isSubmitting = false;
      if (dom.btnEnviarSolicitud) {
        dom.btnEnviarSolicitud.disabled = false;
        dom.btnEnviarSolicitud.textContent = 'Enviar solicitud de modificación →';
      }
      if (dom.errorPaso3Cliente) {
        dom.errorPaso3Cliente.textContent = 'Ocurrió un error al guardar la solicitud en su navegador (almacenamiento lleno o deshabilitado). Sus datos siguen intactos; intente de nuevo.';
      }
      showToast('Error al persistir la solicitud en almacenamiento local.', 'error');
      return;
    }

    isSubmitting = false;
    ultimaSolicitudConfirmada = nuevaSolicitud;

    showToast('¡Solicitud de modificación enviada correctamente!', 'ok');
    irPasoCliente(4);
  }

  function prepararPaso4Confirmacion() {
    const s = ultimaSolicitudConfirmada;
    if (!s) return;

    const grid = dom.confirmacionMetaGrid;
    if (!grid) return;

    grid.innerHTML = `
      <div class="confirmacion-meta-item">
        <small>Código de solicitud</small>
        <strong>${escapeHtml(s.id)}</strong>
      </div>
      <div class="confirmacion-meta-item">
        <small>Evento</small>
        <strong>${escapeHtml(s.eventCode)} - ${escapeHtml(s.eventName)}</strong>
      </div>
      <div class="confirmacion-meta-item">
        <small>Fecha y hora de envío</small>
        <strong>${escapeHtml(s.displayDate)}</strong>
      </div>
      <div class="confirmacion-meta-item">
        <small>Estado</small>
        <span class="badge-solicitud-pendiente">${escapeHtml(s.status)}</span>
      </div>
      <div class="confirmacion-meta-item" style="grid-column: 1 / -1;">
        <small>Motivo indicado</small>
        <span>${escapeHtml(s.reason)}</span>
      </div>
    `;
  }

  // =========================================================================
  // 13. Modales: Consultar Solicitud, Retirar Solicitud y Descartar
  // =========================================================================
  let solicitudSeleccionadaId = null;
  let isWithdrawing = false;

  function verDetalleSolicitud(solId) {
    const s = solicitudesData.find(item => item.id === solId);
    if (!s) return;

    solicitudSeleccionadaId = s.id;
    const body = dom.modalDetalleBody;
    if (!body) return;

    const changes = Array.isArray(s.proposedChanges) ? s.proposedChanges : [];

    let mensajeEstadoHtml = '';
    if (s.status === 'Pendiente de revisión') {
      mensajeEstadoHtml = `
        <div class="aviso aviso-info" style="margin-bottom: 14px;">
          Esta solicitud está <strong>Pendiente de revisión</strong> por el asesor comercial. Su reserva actual permanece activa y sin modificaciones hasta que se evalúe y confirme.
        </div>
      `;
    } else if (s.status === 'Retirada por el cliente') {
      mensajeEstadoHtml = `
        <div class="aviso aviso-info" style="margin-bottom: 14px; background:#f4f5f8; border-color:#d0d7e6; color:#374151;">
          Esta solicitud fue <strong>retirada por el cliente</strong>${s.withdrawnDisplayDate ? ` el ${escapeHtml(s.withdrawnDisplayDate)}` : ''}. Su reserva original se mantiene vigente y sin cambios. Puede formular una nueva solicitud cuando lo requiera.
        </div>
      `;
    } else if (s.status === 'Aprobada') {
      mensajeEstadoHtml = `
        <div class="aviso aviso-ok" style="margin-bottom: 14px;">
          Esta solicitud fue <strong>Aprobada</strong> y sus cambios ya fueron aplicados al evento. Cualquier modificación posterior requiere una nueva solicitud.
        </div>
      `;
    } else if (s.status === 'Rechazada') {
      mensajeEstadoHtml = `
        <div class="aviso aviso-error" style="margin-bottom: 14px;">
          Esta solicitud fue <strong>Rechazada</strong> por el asesor comercial. Su reserva original permanece vigente.
        </div>
      `;
    }

    body.innerHTML = `
      ${mensajeEstadoHtml}

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; background:var(--fondo); padding:12px; border-radius:6px; margin-bottom:16px;">
        <div>
          <small style="color:var(--gris); display:block;">Código de solicitud</small>
          <strong style="color:var(--primario); font-family:monospace; font-size:14px;">${escapeHtml(s.id)}</strong>
        </div>
        <div>
          <small style="color:var(--gris); display:block;">Evento asociado</small>
          <strong>${escapeHtml(s.eventCode)} - ${escapeHtml(s.eventName)}</strong>
        </div>
        <div>
          <small style="color:var(--gris); display:block;">Fecha de envío</small>
          <strong>${escapeHtml(s.displayDate || s.timestamp)}</strong>
        </div>
        <div>
          <small style="color:var(--gris); display:block;">Estado actual</small>
          ${renderBadgeEstadoSolicitud(s.status)}
        </div>
        ${s.withdrawnDisplayDate ? `
          <div>
            <small style="color:var(--gris); display:block;">Fecha de retiro</small>
            <strong style="color:var(--gris);">${escapeHtml(s.withdrawnDisplayDate)}</strong>
          </div>
        ` : ''}
      </div>

      <div class="motivo-box-review" style="margin-top:0;">
        <strong>Motivo de la solicitud:</strong>
        <p>${escapeHtml(s.reason)}</p>
      </div>

      <h4 style="font-size:14px; color:var(--primario); margin: 16px 0 8px;">Cambios solicitados en la propuesta:</h4>
      <div class="tabla-wrap">
        <table class="comparativo-tabla">
          <thead>
            <tr>
              <th class="col-campo">Campo</th>
              <th class="col-actual">Dato anterior</th>
              <th class="col-propuesto">Dato solicitado</th>
            </tr>
          </thead>
          <tbody>
            ${changes.map(ch => `
              <tr class="fila-modificada">
                <td class="col-campo">${escapeHtml(ch.campo)}</td>
                <td class="col-actual">${escapeHtml(ch.anterior)}</td>
                <td class="col-propuesto modificado">
                  ${escapeHtml(ch.nuevo)}
                  <span class="pill-mod-inline">Modificado</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Botón de retiro: SOLO cuando la solicitud pertenece al cliente actual Y está "Pendiente de revisión"
    const esRetirable = (s.clientId === CLIENTE_ACTUAL.id || s.clientName === CLIENTE_ACTUAL.razonSocial) && (s.status === 'Pendiente de revisión');
    if (dom.btnRetirarSolicitudModal) {
      dom.btnRetirarSolicitudModal.classList.toggle('oculto', !esRetirable);
      dom.btnRetirarSolicitudModal.disabled = false;
    }

    abrirModalDetalle();
  }
  window.verDetalleSolicitud = verDetalleSolicitud;

  function abrirModalDetalle() {
    if (dom.modalDetalleSolicitud) {
      dom.modalDetalleSolicitud.classList.remove('oculto');
    }
  }

  function cerrarModalDetalle() {
    if (dom.modalDetalleSolicitud) {
      dom.modalDetalleSolicitud.classList.add('oculto');
    }
    solicitudSeleccionadaId = null;
  }

  function abrirModalConfirmarRetiro() {
    if (!solicitudSeleccionadaId) return;
    const s = solicitudesData.find(item => item.id === solicitudSeleccionadaId);
    if (!s || (s.clientId !== CLIENTE_ACTUAL.id && s.clientName !== CLIENTE_ACTUAL.razonSocial) || s.status !== 'Pendiente de revisión') {
      showToast('Solo es posible retirar solicitudes pendientes que pertenezcan a su cuenta.', 'error');
      return;
    }
    if (dom.modalConfirmarRetiro) {
      dom.modalConfirmarRetiro.classList.remove('oculto');
      if (dom.btnConfirmarRetiroSolicitud) {
        dom.btnConfirmarRetiroSolicitud.disabled = false;
        dom.btnConfirmarRetiroSolicitud.textContent = 'Sí, retirar solicitud';
      }
    }
  }

  function cerrarModalConfirmarRetiro() {
    if (dom.modalConfirmarRetiro) {
      dom.modalConfirmarRetiro.classList.add('oculto');
    }
  }

  function ejecutarRetiroSolicitud() {
    if (isWithdrawing) return;
    if (!solicitudSeleccionadaId) return;

    const s = solicitudesData.find(item => item.id === solicitudSeleccionadaId);
    if (!s || (s.clientId !== CLIENTE_ACTUAL.id && s.clientName !== CLIENTE_ACTUAL.razonSocial) || s.status !== 'Pendiente de revisión') {
      showToast('La solicitud no se encuentra en estado pendiente o no pertenece a su cuenta.', 'error');
      cerrarModalConfirmarRetiro();
      return;
    }

    isWithdrawing = true;
    if (dom.btnConfirmarRetiroSolicitud) {
      dom.btnConfirmarRetiroSolicitud.disabled = true;
      dom.btnConfirmarRetiroSolicitud.textContent = 'Retirando...';
    }

    const previousStatus = s.status;
    const timestampRetiro = new Date().toISOString();
    const displayDateRetiro = new Date().toLocaleString('es-PE');

    s.status = 'Retirada por el cliente';
    s.withdrawnAt = timestampRetiro;
    s.withdrawnDisplayDate = displayDateRetiro;

    try {
      saveSolicitudesStorage();
    } catch (err) {
      console.error('Error al persistir retiro en storage:', err);
      // Revertir estado ante fallo
      s.status = previousStatus;
      delete s.withdrawnAt;
      delete s.withdrawnDisplayDate;
      isWithdrawing = false;
      if (dom.btnConfirmarRetiroSolicitud) {
        dom.btnConfirmarRetiroSolicitud.disabled = false;
        dom.btnConfirmarRetiroSolicitud.textContent = 'Sí, retirar solicitud';
      }
      showToast('Error al persistir el retiro en almacenamiento local.', 'error');
      return;
    }

    isWithdrawing = false;
    cerrarModalConfirmarRetiro();

    // Notificación y actualización de interfaz
    showToast('Solicitud retirada. Tu reserva se mantiene sin cambios', 'ok');
    verDetalleSolicitud(s.id);
    renderPaso1Eventos();
  }

  function abrirModalDescartarCliente(mensaje) {
    const msg = $('discardClientMessage');
    if (msg && mensaje) msg.textContent = mensaje;
    if (dom.modalDescartarCliente) {
      dom.modalDescartarCliente.classList.remove('oculto');
    }
  }

  function cerrarModalDescartarCliente() {
    if (dom.modalDescartarCliente) {
      dom.modalDescartarCliente.classList.add('oculto');
    }
  }

  function confirmarDescarteCliente() {
    cerrarModalDescartarCliente();
    cargarEventoEnFormulario(currentEventId);
    showToast('Cambios propuestos descartados. Valores actuales restaurados.', 'info');
    irPasoCliente(1);
  }

  // =========================================================================
  // 14. Enlace de Eventos y Listeners
  // =========================================================================
  function bindEvents() {
    // Checkboxes técnicos
    dom.chkMontaje.addEventListener('change', () => {
      const activo = dom.chkMontaje.checked;
      dom.fieldsMontaje.classList.toggle('oculto', !activo);
      if (dom.panelMontaje) dom.panelMontaje.classList.toggle('desactivada', !activo);
      dom.montajeDate.disabled = !activo;
      dom.montajeStartTime.disabled = !activo;
      dom.montajeEndTime.disabled = !activo;

      if (!activo) {
        limpiarErrorCampo('montajeDate');
        limpiarErrorCampo('montajeStartTime');
        limpiarErrorCampo('montajeEndTime');
      } else {
        if (!dom.montajeDate.value) setDateFieldValue('montajeDate', dom.eventDate.value);
        if (!dom.montajeStartTime.value && dom.eventStartTime.value) {
          const m = Math.max(REGULAR_HOURS.START_MINUTES, timeToMinutes(dom.eventStartTime.value) - 60);
          setTimeFieldValue('montajeStartTime', minutesToTime(m));
        }
        if (!dom.montajeEndTime.value && dom.eventStartTime.value) {
          setTimeFieldValue('montajeEndTime', dom.eventStartTime.value);
        }
      }
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    dom.chkDesmontaje.addEventListener('change', () => {
      const activo = dom.chkDesmontaje.checked;
      dom.fieldsDesmontaje.classList.toggle('oculto', !activo);
      if (dom.panelDesmontaje) dom.panelDesmontaje.classList.toggle('desactivada', !activo);
      dom.desmontajeDate.disabled = !activo;
      dom.desmontajeStartTime.disabled = !activo;
      dom.desmontajeEndTime.disabled = !activo;

      if (!activo) {
        limpiarErrorCampo('desmontajeDate');
        limpiarErrorCampo('desmontajeStartTime');
        limpiarErrorCampo('desmontajeEndTime');
      } else {
        if (!dom.desmontajeDate.value) setDateFieldValue('desmontajeDate', dom.eventDate.value);
        if (!dom.desmontajeStartTime.value && dom.eventEndTime.value) setTimeFieldValue('desmontajeStartTime', dom.eventEndTime.value);
        if (!dom.desmontajeEndTime.value && dom.eventEndTime.value) {
          const m = Math.min(REGULAR_HOURS.END_MINUTES, timeToMinutes(dom.eventEndTime.value) + 60);
          setTimeFieldValue('desmontajeEndTime', minutesToTime(m));
        }
      }
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    dom.chkEnsayo.addEventListener('change', () => {
      const activo = dom.chkEnsayo.checked;
      dom.fieldsEnsayo.classList.toggle('oculto', !activo);
      if (dom.panelEnsayo) dom.panelEnsayo.classList.toggle('desactivada', !activo);
      dom.ensayoDate.disabled = !activo;
      dom.ensayoStartTime.disabled = !activo;
      dom.ensayoEndTime.disabled = !activo;

      if (!activo) {
        limpiarErrorCampo('ensayoDate');
        limpiarErrorCampo('ensayoStartTime');
        limpiarErrorCampo('ensayoEndTime');
      } else {
        if (!dom.ensayoDate.value) {
          setDateFieldValue('ensayoDate', dom.eventDate.value || (originalSnapshot ? originalSnapshot.date : ''));
        }
        if (!dom.ensayoStartTime.value) {
          setTimeFieldValue('ensayoStartTime', '08:00');
        }
        if (!dom.ensayoEndTime.value) {
          setTimeFieldValue('ensayoEndTime', '09:00');
        }
      }
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    // Inputs que modifican fechas u horarios
    const scheduleInputs = [
      dom.eventDate, dom.eventStartTime, dom.eventEndTime,
      dom.montajeDate, dom.montajeStartTime, dom.montajeEndTime,
      dom.desmontajeDate, dom.desmontajeStartTime, dom.desmontajeEndTime,
      dom.ensayoDate, dom.ensayoStartTime, dom.ensayoEndTime
    ];
    scheduleInputs.forEach(input => {
      if (input) {
        ['input', 'change'].forEach(evt => {
          input.addEventListener(evt, () => {
            actualizarResumenHorario();
            actualizarEstadoDiferencias();
          });
        });
      }
    });

    // Inputs de datos generales
    const generalInputs = [
      dom.eventName, dom.eventContact, dom.eventPhone, dom.eventEmail, dom.eventNotes
    ];
    generalInputs.forEach(input => {
      if (input) {
        ['input', 'change'].forEach(evt => {
          input.addEventListener(evt, () => {
            actualizarEstadoDiferencias();
          });
        });
      }
    });

    // Motivo
    if (dom.requestReason) {
      dom.requestReason.addEventListener('input', () => {
        if (dom.requestReason.value.trim() && dom.errRequestReason) {
          dom.errRequestReason.textContent = '';
          dom.requestReason.classList.remove('input-error');
        }
      });
    }

    // Botones del Paso 2
    dom.btnAvanzarPaso3Cliente.addEventListener('click', () => {
      const err = validarFormularioPaso2();
      if (err) {
        dom.errorPaso2Cliente.textContent = err;
        showToast(err, 'error');
        return;
      }
      dom.errorPaso2Cliente.textContent = '';
      irPasoCliente(3);
    });

    dom.btnDescartarPaso2Cliente.addEventListener('click', () => {
      if (hayCambiosPendientes()) {
        abrirModalDescartarCliente('¿Desea descartar todas las modificaciones realizadas en este formulario?');
      } else {
        showToast('No hay cambios pendientes por descartar.', 'info');
      }
    });

    // Botones del Paso 3
    dom.btnEnviarSolicitud.addEventListener('click', ejecutarEnvioSolicitud);

    // Botones del Paso 4
    if (dom.btnVerDetalleSolicitudConfirmada) {
      dom.btnVerDetalleSolicitudConfirmada.addEventListener('click', () => {
        if (ultimaSolicitudConfirmada) {
          verDetalleSolicitud(ultimaSolicitudConfirmada.id);
        }
      });
    }

    // Modales
    dom.btnCloseModalDetalle.addEventListener('click', cerrarModalDetalle);
    dom.btnCerrarModalDetalle.addEventListener('click', cerrarModalDetalle);

    if (dom.btnRetirarSolicitudModal) {
      dom.btnRetirarSolicitudModal.addEventListener('click', abrirModalConfirmarRetiro);
    }
    if (dom.btnCloseModalRetiro) {
      dom.btnCloseModalRetiro.addEventListener('click', cerrarModalConfirmarRetiro);
    }
    if (dom.btnCancelarRetiro) {
      dom.btnCancelarRetiro.addEventListener('click', cerrarModalConfirmarRetiro);
    }
    if (dom.btnConfirmarRetiroSolicitud) {
      dom.btnConfirmarRetiroSolicitud.addEventListener('click', ejecutarRetiroSolicitud);
    }

    // Cerrar modales con tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dom.modalConfirmarRetiro && !dom.modalConfirmarRetiro.classList.contains('oculto')) {
          cerrarModalConfirmarRetiro();
        } else if (dom.modalDetalleSolicitud && !dom.modalDetalleSolicitud.classList.contains('oculto')) {
          cerrarModalDetalle();
        } else if (dom.modalDescartarCliente && !dom.modalDescartarCliente.classList.contains('oculto')) {
          cerrarModalDescartarCliente();
        }
      }
    });

    dom.btnCloseDiscardClientModal.addEventListener('click', cerrarModalDescartarCliente);
    dom.btnStayOnClientForm.addEventListener('click', cerrarModalDescartarCliente);
    dom.btnConfirmDiscardClient.addEventListener('click', confirmarDescarteCliente);
  }

  // =========================================================================
  // 15. Arranque Inicial
  // =========================================================================
  function iniciar() {
    loadStorage();
    initFlatpickrDatePickers();
    initFlatpickrTimePickers();
    bindEvents();
    renderPaso1Eventos();
    irPasoCliente(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
