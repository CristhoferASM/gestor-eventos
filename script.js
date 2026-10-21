/**
 * ==========================================================================
 * SHOWTECH SOLUTIONS - GESTOR DE EVENTOS
 * Módulo: Modificar datos del evento
 * Tecnologías: JavaScript Puro (ES6+), HTML5, CSS3, Flatpickr, jsPDF
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

  // Datos iniciales de demostración con bloques técnicos completos
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
    tarjetasEventosMovil: $('tarjetasEventosMovil'),
    contadorEventos: $('contadorEventos'),
    bannerTextoEvento: $('bannerTextoEvento'),
    avisoPaso1: $('avisoPaso1'),

    // Paso 2 (Formulario General)
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

    // Fecha y Horario del Evento
    eventDate: $('eventDate'),
    eventStartTime: $('eventStartTime'),
    eventEndTime: $('eventEndTime'),

    // Montaje Técnico (Fecha, Inicio, Fin)
    chkMontaje: $('chkMontaje'),
    fieldsMontaje: $('fieldsMontaje'),
    montajeDate: $('montajeDate'),
    montajeStartTime: $('montajeStartTime'),
    montajeEndTime: $('montajeEndTime'),

    // Desmontaje Técnico (Fecha, Inicio, Fin)
    chkDesmontaje: $('chkDesmontaje'),
    fieldsDesmontaje: $('fieldsDesmontaje'),
    desmontajeDate: $('desmontajeDate'),
    desmontajeStartTime: $('desmontajeStartTime'),
    desmontajeEndTime: $('desmontajeEndTime'),

    // Ensayo Técnico (Fecha, Inicio, Fin)
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
    durationSummaryContainer: $('durationSummaryContainer'),
    btnToggleFicha: $('btnToggleFicha'),
    textoBtnFicha: $('textoBtnFicha'),
    contenedorFichaCompleta: $('contenedorFichaCompleta'),
    comprobante: $('comprobante'),
    comprobanteFinal: $('comprobanteFinal'),
    modificationReason: $('modificationReason'),
    errorPaso4: $('errorPaso4'),
    btnDescartarFinal: $('btnDescartarFinal'),
    btnConfirmSave: $('btnConfirmSave'),
    avisoFinal: $('avisoFinal'),
    btnDescargarPdf: $('btnDescargarPdf'),

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

  function formatDuracionMin(minsTotales) {
    if (isNaN(minsTotales) || minsTotales <= 0) return '0 min';
    const h = Math.floor(minsTotales / 60);
    const m = minsTotales % 60;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
  }

  function fechaPe(fechaStr) {
    if (!fechaStr) return '';
    const norm = normalizarFecha(fechaStr);
    const parts = norm.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return fechaStr;
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
    if (!dom.toastContainer) return;
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
  // 5. Configuración de Selectores de Fecha con Flatpickr (Español)
  // =========================================================================
  const DATE_FIELD_CONFIGS = [
    { id: 'eventDate', label: 'Fecha del evento', errId: 'errEventDate' },
    { id: 'montajeDate', label: 'Fecha de montaje', errId: 'errMontajeDate' },
    { id: 'desmontajeDate', label: 'Fecha de desmontaje', errId: 'errDesmontajeDate' },
    { id: 'ensayoDate', label: 'Fecha de ensayo', errId: 'errEnsayoDate' }
  ];

  const fpDateInstances = {};

  function initFlatpickrDatePickers() {
    if (typeof window.flatpickr !== 'function') {
      console.warn('Flatpickr no está disponible.');
      return;
    }

    const esLocale = (window.flatpickr.l10ns && window.flatpickr.l10ns.es)
      ? window.flatpickr.l10ns.es
      : 'es';

    DATE_FIELD_CONFIGS.forEach(cfg => {
      const input = $(cfg.id);
      if (!input) return;

      if (fpDateInstances[cfg.id]) {
        try { fpDateInstances[cfg.id].destroy(); } catch (e) {}
      }

      fpDateInstances[cfg.id] = window.flatpickr(input, {
        locale: esLocale,
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        disableMobile: true,
        allowInput: true,
        onChange: function () {
          isAvailabilityVerified = false;
          validarCampoFecha(cfg.id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        },
        onClose: function () {
          isAvailabilityVerified = false;
          validarCampoFecha(cfg.id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        }
      });

      // Abrir selector al pulsar el icono de calendario
      const wrap = $(`wrap_${cfg.id}`);
      if (wrap) {
        const icon = wrap.querySelector('.icono-calendario');
        if (icon) {
          icon.addEventListener('click', () => {
            if (!input.disabled && fpDateInstances[cfg.id]) {
              fpDateInstances[cfg.id].open();
            }
          });
        }
      }

      // Sincronización manual en teclado
      input.addEventListener('input', function () {
        isAvailabilityVerified = false;
        validarCampoFecha(cfg.id);
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

  function validarCampoFecha(fieldId) {
    const input = $(fieldId);
    if (!input) return null;

    const cfg = DATE_FIELD_CONFIGS.find(c => c.id === fieldId);
    const errSpan = cfg ? $(cfg.errId) : null;

    if (fieldId === 'montajeDate' && (!dom.chkMontaje || !dom.chkMontaje.checked)) {
      if (errSpan) errSpan.textContent = '';
      input.classList.remove('input-error');
      return null;
    }
    if (fieldId === 'desmontajeDate' && (!dom.chkDesmontaje || !dom.chkDesmontaje.checked)) {
      if (errSpan) errSpan.textContent = '';
      input.classList.remove('input-error');
      return null;
    }
    if (fieldId === 'ensayoDate' && (!dom.chkEnsayo || !dom.chkEnsayo.checked)) {
      if (errSpan) errSpan.textContent = '';
      input.classList.remove('input-error');
      return null;
    }

    const val = input.value.trim();
    let errorMsg = null;

    if (!val) {
      errorMsg = 'Debe especificar esta fecha.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      errorMsg = 'Formato no válido (dd/mm/aaaa).';
    }

    if (errSpan) errSpan.textContent = errorMsg || '';
    if (errorMsg) input.classList.add('input-error');
    else input.classList.remove('input-error');

    return errorMsg;
  }

  // =========================================================================
  // 6. Configuración de Selectores de Hora Rediseñados (Flatpickr)
  // =========================================================================
  const TIME_FIELD_CONFIGS = [
    { id: 'eventStartTime', label: 'Hora de inicio del evento', errId: 'errEventStartTime' },
    { id: 'eventEndTime', label: 'Hora de fin del evento', errId: 'errEventEndTime' },
    { id: 'montajeStartTime', label: 'Hora inicio de montaje', errId: 'errMontajeStart' },
    { id: 'montajeEndTime', label: 'Hora fin de montaje', errId: 'errMontajeEnd' },
    { id: 'desmontajeStartTime', label: 'Hora inicio de desmontaje', errId: 'errDesmontajeStart' },
    { id: 'desmontajeEndTime', label: 'Hora fin de desmontaje', errId: 'errDesmontajeEnd' },
    { id: 'ensayoStartTime', label: 'Hora inicio de ensayo', errId: 'errEnsayoStart' },
    { id: 'ensayoEndTime', label: 'Hora fin de ensayo', errId: 'errEnsayoEnd' }
  ];

  const fpInstances = {};

  function injectCustomTimeElements(instance) {
    const container = instance.calendarContainer;
    if (!container) return;

    // Encabezado con etiquetas claras "Hora" y "Minutos"
    if (!container.querySelector('.flatpickr-time-header')) {
      const header = document.createElement('div');
      header.className = 'flatpickr-time-header';
      header.innerHTML = `<span>Hora</span><span class="flatpickr-time-separator-label">:</span><span>Minutos</span>`;
      const timeElem = container.querySelector('.flatpickr-time');
      if (timeElem) {
        container.insertBefore(header, timeElem);
      }
    }

    // Pie de panel con acción clara "Listo"
    if (!container.querySelector('.flatpickr-time-footer')) {
      const footer = document.createElement('div');
      footer.className = 'flatpickr-time-footer';
      const btnListo = document.createElement('button');
      btnListo.type = 'button';
      btnListo.className = 'btn-fp-listo';
      btnListo.textContent = 'Listo';
      btnListo.addEventListener('click', function (e) {
        e.stopPropagation();
        instance.close();
      });
      footer.appendChild(btnListo);
      container.appendChild(footer);
    }
  }

  function initFlatpickrTimePickers() {
    if (typeof window.flatpickr !== 'function') {
      console.warn('Flatpickr no está disponible.');
      return;
    }

    TIME_FIELD_CONFIGS.forEach(cfg => {
      const input = $(cfg.id);
      if (!input) return;

      if (fpInstances[cfg.id]) {
        try { fpInstances[cfg.id].destroy(); } catch (e) {}
      }

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
          isAvailabilityVerified = false;
          validarCampoHora(cfg.id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        },
        onClose: function () {
          isAvailabilityVerified = false;
          validarCampoHora(cfg.id);
          actualizarResumenHorario();
          actualizarEstadoDiferencias();
        }
      });

      // Abrir selector al pulsar el icono de reloj
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

      // Interceptar blur en fase de captura para impedir corrección silenciosa
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
        isAvailabilityVerified = false;
        actualizarResumenHorario();
        actualizarEstadoDiferencias();
      }, true);

      // Interceptar Enter en fase de captura
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val) {
            const isValidFormat = /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
            const m = timeToMinutes(val);
            const inRange = isValidFormat && m >= REGULAR_HOURS.START_MINUTES && m <= REGULAR_HOURS.END_MINUTES;
            if (!isValidFormat || !inRange) {
              e.stopImmediatePropagation();
              e.preventDefault();
              validarCampoHora(cfg.id);
              isAvailabilityVerified = false;
              actualizarResumenHorario();
              actualizarEstadoDiferencias();
            }
          }
        }
      }, true);

      // Entrada manual directa
      input.addEventListener('input', function () {
        isAvailabilityVerified = false;
        validarCampoHora(cfg.id);
        actualizarResumenHorario();
        actualizarEstadoDiferencias();
      });
    });
  }

  function validarCampoHora(fieldId) {
    const input = $(fieldId);
    if (!input) return null;

    const cfg = TIME_FIELD_CONFIGS.find(c => c.id === fieldId);
    const errSpan = cfg ? $(cfg.errId) : null;

    // Si el bloque técnico está desactivado, omitir validación
    if ((fieldId === 'montajeStartTime' || fieldId === 'montajeEndTime') && (!dom.chkMontaje || !dom.chkMontaje.checked)) {
      if (errSpan) errSpan.textContent = '';
      input.classList.remove('input-error');
      return null;
    }
    if ((fieldId === 'desmontajeStartTime' || fieldId === 'desmontajeEndTime') && (!dom.chkDesmontaje || !dom.chkDesmontaje.checked)) {
      if (errSpan) errSpan.textContent = '';
      input.classList.remove('input-error');
      return null;
    }
    if ((fieldId === 'ensayoStartTime' || fieldId === 'ensayoEndTime') && (!dom.chkEnsayo || !dom.chkEnsayo.checked)) {
      if (errSpan) errSpan.textContent = '';
      input.classList.remove('input-error');
      return null;
    }

    const val = input.value.trim();
    let errorMsg = null;

    if (!val) {
      errorMsg = 'Debe especificar este horario.';
    } else {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(val)) {
        errorMsg = 'Formato no válido. Use HH:mm (ej. 09:30).';
      } else {
        const m = timeToMinutes(val);
        if (m < REGULAR_HOURS.START_MINUTES || m > REGULAR_HOURS.END_MINUTES) {
          errorMsg = 'Horario fuera del rango permitido (06:00 a 22:00).';
        }
      }
    }

    if (errSpan) {
      errSpan.textContent = errorMsg || '';
    }
    if (errorMsg) {
      input.classList.add('input-error');
    } else {
      input.classList.remove('input-error');
    }

    return errorMsg;
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

  function toggleFichaCompleta(forzarCerrar = false) {
    const contenedor = dom.contenedorFichaCompleta;
    const btn = dom.btnToggleFicha;
    const texto = dom.textoBtnFicha;
    if (!contenedor || !btn) return;

    const estaAbierto = !contenedor.classList.contains('oculto');
    const abrir = forzarCerrar ? false : !estaAbierto;

    if (abrir) {
      contenedor.classList.remove('oculto');
      btn.setAttribute('aria-expanded', 'true');
      if (texto) texto.textContent = 'Ocultar ficha del evento';
    } else {
      contenedor.classList.add('oculto');
      btn.setAttribute('aria-expanded', 'false');
      if (texto) texto.textContent = 'Ver ficha completa del evento';
    }
  }

  // =========================================================================
  // 7. Inicialización y Persistencia (localStorage)
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
  // 8. Navegación en Cuatro Pasos
  // =========================================================================
  function irPaso(n) {
    if (pasoActual === 2 && n > 2) {
      const validationError = validarFormularioPaso2();
      if (validationError) {
        dom.errorPaso2.textContent = validationError;
        return;
      }
      dom.errorPaso2.textContent = '';
    }

    if (n === 4) {
      if (hayCambiosDeHorario() && !isAvailabilityVerified) {
        showToast('Debe validar la disponibilidad de los nuevos horarios antes de revisar y confirmar.', 'error');
        irPaso(3);
        return;
      }
    }

    pasoActual = n;

    for (let i = 1; i <= 4; i++) {
      const sec = $('s' + i);
      if (sec) sec.classList.toggle('oculto', i !== n);
    }

    for (let i = 1; i <= 4; i++) {
      const p = $('p' + i);
      if (p) {
        p.classList.toggle('activo', i === n);
        p.classList.toggle('hecho', i < n);
      }
    }

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
  }
  window.irPaso = irPaso;

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
  // 9. Paso 1: Selección de Eventos y Búsqueda
  // =========================================================================
  function formatearTiemposTecnicosCompacto(ev) {
    const items = [];
    if (ev.hasMontaje) {
      const fMont = ev.montajeDate ? fechaPe(ev.montajeDate) : fechaPe(ev.date);
      items.push(`<span><strong>Montaje:</strong> ${fMont} (${ev.montajeStart} - ${ev.montajeEnd || ev.startTime})</span>`);
    }
    if (ev.hasDesmontaje) {
      const fDesm = ev.desmontajeDate ? fechaPe(ev.desmontajeDate) : fechaPe(ev.date);
      items.push(`<span><strong>Desmontaje:</strong> ${fDesm} (${ev.desmontajeStart || ev.endTime} - ${ev.desmontajeEnd})</span>`);
    }
    if (ev.hasEnsayo) {
      items.push(`<span><strong>Ensayo:</strong> ${fechaPe(ev.ensayoDate)} (${ev.ensayoStart} - ${ev.ensayoEnd})</span>`);
    }
    if (items.length === 0) return '<span style="color:var(--gris);">Sin adicionales</span>';
    return `<div class="tecnicos-compacto">${items.join('')}</div>`;
  }

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
      if (dom.tarjetasEventosMovil) {
        dom.tarjetasEventosMovil.innerHTML = '<div class="vacio">No se encontraron eventos coincidentes con el criterio de búsqueda.</div>';
      }
      return;
    }

    // 1. Render para escritorio
    dom.tablaEventos.innerHTML = filtrados.map(ev => {
      const esActivo = ev.id === currentEventId;
      const tecHtml = formatearTiemposTecnicosCompacto(ev);

      let claseEtiqueta = 'et-confirmado';
      if (ev.status === 'Con adelanto') claseEtiqueta = 'et-adelanto';
      if (ev.status === 'Pagado') claseEtiqueta = 'et-pagado';

      return `
        <tr class="${esActivo ? 'fila-activa' : ''}">
          <td class="col-codigo"><strong>${escapeHtml(ev.code)}</strong></td>
          <td class="col-cliente">${escapeHtml(ev.client)}</td>
          <td class="col-evento">${escapeHtml(ev.name)}</td>
          <td class="col-fecha">${fechaPe(ev.date)}</td>
          <td class="col-horario">${ev.startTime} - ${ev.endTime}</td>
          <td class="col-tecnicos">${tecHtml}</td>
          <td class="col-estado"><span class="etiqueta ${claseEtiqueta}">${escapeHtml(ev.status)}</span></td>
          <td class="col-accion num-der">
            <button type="button" class="btn btn-chico ${esActivo ? 'btn-sec' : 'btn-primario'}" onclick="window.seleccionarEvento('${ev.id}')">
              ${esActivo ? 'Editando' : 'Seleccionar'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // 2. Render para móvil
    if (dom.tarjetasEventosMovil) {
      dom.tarjetasEventosMovil.innerHTML = filtrados.map(ev => {
        const esActivo = ev.id === currentEventId;
        const tecHtml = formatearTiemposTecnicosCompacto(ev);

        let claseEtiqueta = 'et-confirmado';
        if (ev.status === 'Con adelanto') claseEtiqueta = 'et-adelanto';
        if (ev.status === 'Pagado') claseEtiqueta = 'et-pagado';

        return `
          <div class="tarjeta-evento-item ${esActivo ? 'activa' : ''}">
            <div class="tarjeta-evento-header">
              <span class="tarjeta-evento-codigo">${escapeHtml(ev.code)}</span>
              <span class="etiqueta ${claseEtiqueta}">${escapeHtml(ev.status)}</span>
            </div>
            <div class="tarjeta-evento-titulo">${escapeHtml(ev.name)}</div>
            <div class="tarjeta-evento-cliente"><strong>Cliente:</strong> ${escapeHtml(ev.client)}</div>
            
            <div class="tarjeta-evento-datos">
              <div>
                <small>Fecha</small>
                <strong>${fechaPe(ev.date)}</strong>
              </div>
              <div>
                <small>Horario</small>
                <strong>${ev.startTime} - ${ev.endTime}</strong>
              </div>
              <div class="tarjeta-evento-dato-completo">
                <small>Tiempos técnicos</small>
                ${tecHtml}
              </div>
            </div>

            <button type="button" class="btn ${esActivo ? 'btn-sec' : 'btn-primario'}" onclick="window.seleccionarEvento('${ev.id}')">
              ${esActivo ? 'Evento cargado (Editando)' : 'Seleccionar evento'}
            </button>
          </div>
        `;
      }).join('');
    }
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

    // Poblar fecha y horarios del evento
    setDateFieldValue('eventDate', ev.date || '');
    setTimeFieldValue('eventStartTime', ev.startTime || '');
    setTimeFieldValue('eventEndTime', ev.endTime || '');

    // Montaje independiente (Fecha, Inicio, Fin)
    dom.chkMontaje.checked = !!ev.hasMontaje;
    dom.fieldsMontaje.classList.toggle('oculto', !ev.hasMontaje);
    const panelMont = $('panelMontaje');
    if (panelMont) panelMont.classList.toggle('desactivada', !ev.hasMontaje);
    dom.montajeDate.disabled = !ev.hasMontaje;
    dom.montajeStartTime.disabled = !ev.hasMontaje;
    dom.montajeEndTime.disabled = !ev.hasMontaje;
    setDateFieldValue('montajeDate', ev.montajeDate || ev.date || '');
    setTimeFieldValue('montajeStartTime', ev.montajeStart || '');
    setTimeFieldValue('montajeEndTime', ev.montajeEnd || ev.startTime || '');

    // Desmontaje independiente (Fecha, Inicio, Fin)
    dom.chkDesmontaje.checked = !!ev.hasDesmontaje;
    dom.fieldsDesmontaje.classList.toggle('oculto', !ev.hasDesmontaje);
    const panelDesm = $('panelDesmontaje');
    if (panelDesm) panelDesm.classList.toggle('desactivada', !ev.hasDesmontaje);
    dom.desmontajeDate.disabled = !ev.hasDesmontaje;
    dom.desmontajeStartTime.disabled = !ev.hasDesmontaje;
    dom.desmontajeEndTime.disabled = !ev.hasDesmontaje;
    setDateFieldValue('desmontajeDate', ev.desmontajeDate || ev.date || '');
    setTimeFieldValue('desmontajeStartTime', ev.desmontajeStart || ev.endTime || '');
    setTimeFieldValue('desmontajeEndTime', ev.desmontajeEnd || '');

    // Ensayo independiente (Fecha, Inicio, Fin)
    dom.chkEnsayo.checked = !!ev.hasEnsayo;
    dom.fieldsEnsayo.classList.toggle('oculto', !ev.hasEnsayo);
    const panelEns = $('panelEnsayo');
    if (panelEns) panelEns.classList.toggle('desactivada', !ev.hasEnsayo);
    dom.ensayoDate.disabled = !ev.hasEnsayo;
    dom.ensayoStartTime.disabled = !ev.hasEnsayo;
    dom.ensayoEndTime.disabled = !ev.hasEnsayo;
    setDateFieldValue('ensayoDate', ev.ensayoDate || '');
    setTimeFieldValue('ensayoStartTime', ev.ensayoStart || '');
    setTimeFieldValue('ensayoEndTime', ev.ensayoEnd || '');

    // Badges y feedback
    dom.badgeEventoPaso2.textContent = `${ev.code} • ${ev.status}`;
    dom.errorPaso2.textContent = '';
    if (dom.modificationReason) dom.modificationReason.value = '';

    actualizarResumenHorario();
    actualizarEstadoDiferencias();
    renderHistorial();
  }

  // =========================================================================
  // 10. Paso 2: Modificación de Datos y Lógica de Tiempos Técnicos
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

  function hayCambiosPendientes() {
    if (!originalSnapshot) return false;
    return calcularDiferencias().length > 0;
  }

  function hayCambiosDeHorario() {
    if (!originalSnapshot) return false;
    const actual = getValoresFormulario();

    const origDate = normalizarFecha(originalSnapshot.date);
    const actDate = actual.date;
    const origStart = normalizarHora(originalSnapshot.startTime);
    const actStart = actual.startTime;
    const origEnd = normalizarHora(originalSnapshot.endTime);
    const actEnd = actual.endTime;

    const dateChanged = actDate !== origDate;
    const startChanged = actStart !== origStart;
    const endChanged = actEnd !== origEnd;

    // Montaje
    const origHasMont = !!originalSnapshot.hasMontaje;
    const actHasMont = !!actual.hasMontaje;
    const montChanged = (origHasMont !== actHasMont) || (actHasMont && (
      actual.montajeDate !== normalizarFecha(originalSnapshot.montajeDate || originalSnapshot.date) ||
      actual.montajeStart !== normalizarHora(originalSnapshot.montajeStart) ||
      actual.montajeEnd !== normalizarHora(originalSnapshot.montajeEnd || originalSnapshot.startTime)
    ));

    // Desmontaje
    const origHasDesm = !!originalSnapshot.hasDesmontaje;
    const actHasDesm = !!actual.hasDesmontaje;
    const desmChanged = (origHasDesm !== actHasDesm) || (actHasDesm && (
      actual.desmontajeDate !== normalizarFecha(originalSnapshot.desmontajeDate || originalSnapshot.date) ||
      actual.desmontajeStart !== normalizarHora(originalSnapshot.desmontajeStart || originalSnapshot.endTime) ||
      actual.desmontajeEnd !== normalizarHora(originalSnapshot.desmontajeEnd)
    ));

    // Ensayo
    const origHasEns = !!originalSnapshot.hasEnsayo;
    const actHasEns = !!actual.hasEnsayo;
    const ensChanged = (origHasEns !== actHasEns) || (actHasEns && origHasEns && (
      actual.ensayoDate !== normalizarFecha(originalSnapshot.ensayoDate) ||
      actual.ensayoStart !== normalizarHora(originalSnapshot.ensayoStart) ||
      actual.ensayoEnd !== normalizarHora(originalSnapshot.ensayoEnd)
    ));

    return dateChanged || startChanged || endChanged || montChanged || desmChanged || ensChanged;
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

    // Actualizar pills de modificado en campos generales
    dom.modBadgeEventName.classList.toggle('visible', actual.name !== (originalSnapshot.name || ''));
    dom.modBadgeEventClient.classList.toggle('visible', actual.client !== (originalSnapshot.client || ''));
    dom.modBadgeEventContact.classList.toggle('visible', actual.contact !== (originalSnapshot.contact || ''));
    dom.modBadgeEventPhone.classList.toggle('visible', actual.phone !== (originalSnapshot.phone || ''));
    dom.modBadgeEventEmail.classList.toggle('visible', actual.email !== (originalSnapshot.email || ''));
    dom.modBadgeRequestedBy.classList.toggle('visible', actual.requestedBy !== (originalSnapshot.requestedBy || ''));
    dom.modBadgeEventNotes.classList.toggle('visible', actual.notes !== (originalSnapshot.notes || ''));

    // Evento Principal
    dom.modBadgeEventDate.classList.toggle('visible', actDate !== origDate);
    dom.modBadgeEventStartTime.classList.toggle('visible', actStart !== origStart);
    dom.modBadgeEventEndTime.classList.toggle('visible', actEnd !== origEnd);

    // Montaje Técnico
    const origMontDate = normalizarFecha(originalSnapshot.montajeDate || originalSnapshot.date);
    const origMontStart = normalizarHora(originalSnapshot.montajeStart);
    const origMontEnd = normalizarHora(originalSnapshot.montajeEnd || originalSnapshot.startTime);

    dom.modBadgeMontajeDate.classList.toggle('visible', actual.hasMontaje && actual.montajeDate !== origMontDate);
    dom.modBadgeMontajeStart.classList.toggle('visible', actual.hasMontaje && actual.montajeStart !== origMontStart);
    dom.modBadgeMontajeEnd.classList.toggle('visible', actual.hasMontaje && actual.montajeEnd !== origMontEnd);

    // Desmontaje Técnico
    const origDesmDate = normalizarFecha(originalSnapshot.desmontajeDate || originalSnapshot.date);
    const origDesmStart = normalizarHora(originalSnapshot.desmontajeStart || originalSnapshot.endTime);
    const origDesmEnd = normalizarHora(originalSnapshot.desmontajeEnd);

    dom.modBadgeDesmontajeDate.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeDate !== origDesmDate);
    dom.modBadgeDesmontajeStart.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeStart !== origDesmStart);
    dom.modBadgeDesmontajeEnd.classList.toggle('visible', actual.hasDesmontaje && actual.desmontajeEnd !== origDesmEnd);

    // Ensayo Técnico:
    // - Si el usuario activa un ensayo que antes no existía (no guardado), mostrar sólo "Ensayo añadido" en la cabecera.
    // - Si modifica un ensayo ya guardado, marcar únicamente los campos individuales que realmente cambien.
    // - Si se restaura el valor original o se desactiva, eliminar la marca.
    const origHasEns = !!originalSnapshot.hasEnsayo;
    const actHasEns = !!actual.hasEnsayo;
    const ensayoRecienAnadido = actHasEns && !origHasEns;
    const ensayoYaExistia = actHasEns && origHasEns;

    if (dom.modBadgeEnsayoAdded) {
      dom.modBadgeEnsayoAdded.classList.toggle('visible', ensayoRecienAnadido);
    }

    if (ensayoRecienAnadido) {
      // Ensayo nuevo añadido: solo se muestra "Ensayo añadido" en la cabecera
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
      // Ensayo desactivado
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
    const franjas = [];

    // Ensayo técnico previo
    if (f.hasEnsayo && f.ensayoDate && f.ensayoStart && f.ensayoEnd) {
      const sM = timeToMinutes(f.ensayoStart);
      const eM = timeToMinutes(f.ensayoEnd);
      if (sM !== null && eM !== null && eM > sM) {
        franjas.push({
          tipo: 'ensayo',
          label: `Ensayo: ${fechaPe(f.ensayoDate)} (${f.ensayoStart} - ${f.ensayoEnd})`,
          date: f.ensayoDate,
          startM: sM
        });
      }
    }

    // Montaje técnico
    if (f.hasMontaje && f.montajeDate && f.montajeStart && f.montajeEnd) {
      const sM = timeToMinutes(f.montajeStart);
      const eM = timeToMinutes(f.montajeEnd);
      if (sM !== null && eM !== null && eM > sM) {
        franjas.push({
          tipo: 'montaje',
          label: `Montaje: ${fechaPe(f.montajeDate)} (${f.montajeStart} - ${f.montajeEnd})`,
          date: f.montajeDate,
          startM: sM
        });
      }
    }

    // Evento principal
    if (f.date && f.startTime && f.endTime) {
      const sM = timeToMinutes(f.startTime);
      const eM = timeToMinutes(f.endTime);
      if (sM !== null && eM !== null && eM > sM) {
        franjas.push({
          tipo: 'evento',
          label: `Evento: ${fechaPe(f.date)} (${f.startTime} - ${f.endTime})`,
          date: f.date,
          startM: sM
        });
      }
    }

    // Desmontaje técnico
    if (f.hasDesmontaje && f.desmontajeDate && f.desmontajeStart && f.desmontajeEnd) {
      const sM = timeToMinutes(f.desmontajeStart);
      const eM = timeToMinutes(f.desmontajeEnd);
      if (sM !== null && eM !== null && eM > sM) {
        franjas.push({
          tipo: 'desmontaje',
          label: `Desmontaje: ${fechaPe(f.desmontajeDate)} (${f.desmontajeStart} - ${f.desmontajeEnd})`,
          date: f.desmontajeDate,
          startM: sM
        });
      }
    }

    // Ordenar cronológicamente por fecha y hora de inicio
    franjas.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startM - b.startM;
    });

    if (franjas.length === 0) {
      dom.resumenHorarioItems.innerHTML = '<span style="color:var(--gris); font-size:13px;">Ingrese los horarios para visualizar el cronograma propuesto.</span>';
    } else {
      dom.resumenHorarioItems.innerHTML = franjas
        .map(item => `<span class="timeline-pill ${item.tipo}">${item.label}</span>`)
        .join('');
    }
  }

  function validarFormularioPaso2() {
    const f = getValoresFormulario();

    if (!f.name) return 'El nombre de la convocatoria o evento es obligatorio.';
    if (!f.client) return 'El cliente (nombre o razón social) es obligatorio.';
    if (!f.contact) return 'La persona de contacto es obligatoria.';
    if (!f.date) return 'Debe ingresar la fecha del evento.';

    // Validar hora de inicio y fin del evento
    const errStart = validarCampoHora('eventStartTime');
    if (errStart) return `Hora de inicio: ${errStart}`;
    const errEnd = validarCampoHora('eventEndTime');
    if (errEnd) return `Hora de fin: ${errEnd}`;

    if (!f.startTime || !f.endTime) return 'Debe especificar la hora de inicio y de fin del evento.';

    const startM = timeToMinutes(f.startTime);
    const endM = timeToMinutes(f.endTime);

    if (startM < REGULAR_HOURS.START_MINUTES || endM > REGULAR_HOURS.END_MINUTES) {
      return 'El horario del evento debe estar dentro del rango permitido (06:00 a 22:00).';
    }
    if (endM <= startM) {
      return 'La hora de fin del evento debe ser mayor a la hora de inicio.';
    }

    // Montaje técnico
    if (f.hasMontaje) {
      if (!f.montajeDate) return 'Ingrese la fecha de montaje previo.';
      const errMontS = validarCampoHora('montajeStartTime');
      if (errMontS) return `Hora inicio de montaje: ${errMontS}`;
      const errMontE = validarCampoHora('montajeEndTime');
      if (errMontE) return `Hora fin de montaje: ${errMontE}`;

      const montStartM = timeToMinutes(f.montajeStart);
      const montEndM = timeToMinutes(f.montajeEnd);

      if (montStartM < REGULAR_HOURS.START_MINUTES || montEndM > REGULAR_HOURS.END_MINUTES) {
        return 'El horario de montaje debe estar dentro del rango permitido (06:00 a 22:00).';
      }
      if (montEndM <= montStartM) {
        return 'La hora de fin del montaje debe ser mayor a su hora de inicio.';
      }
      if (f.montajeDate === f.date && montEndM > startM) {
        return `El fin del montaje (${f.montajeEnd}) no puede superar el inicio del evento (${f.startTime}).`;
      }
      if (f.montajeDate > f.date) {
        return 'La fecha de montaje no puede ser posterior a la fecha del evento.';
      }
    }

    // Desmontaje técnico
    if (f.hasDesmontaje) {
      if (!f.desmontajeDate) return 'Ingrese la fecha de desmontaje posterior.';
      const errDesS = validarCampoHora('desmontajeStartTime');
      if (errDesS) return `Hora inicio de desmontaje: ${errDesS}`;
      const errDesE = validarCampoHora('desmontajeEndTime');
      if (errDesE) return `Hora fin de desmontaje: ${errDesE}`;

      const desStartM = timeToMinutes(f.desmontajeStart);
      const desEndM = timeToMinutes(f.desmontajeEnd);

      if (desStartM < REGULAR_HOURS.START_MINUTES || desEndM > REGULAR_HOURS.END_MINUTES) {
        return 'El horario de desmontaje debe estar dentro del rango permitido (06:00 a 22:00).';
      }
      if (desEndM <= desStartM) {
        return 'La hora de fin del desmontaje debe ser mayor a su hora de inicio.';
      }
      if (f.desmontajeDate === f.date && desStartM < endM) {
        return `El inicio del desmontaje (${f.desmontajeStart}) no puede ser anterior al fin del evento (${f.endTime}).`;
      }
      if (f.desmontajeDate < f.date) {
        return 'La fecha de desmontaje no puede ser anterior a la fecha del evento.';
      }
    }

    // Ensayo técnico
    if (f.hasEnsayo) {
      if (!f.ensayoDate) return 'Ingrese la fecha del ensayo técnico previo.';
      const errEnsS = validarCampoHora('ensayoStartTime');
      if (errEnsS) return `Hora inicio de ensayo: ${errEnsS}`;
      const errEnsE = validarCampoHora('ensayoEndTime');
      if (errEnsE) return `Hora fin de ensayo: ${errEnsE}`;

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
      if (f.ensayoDate === f.date) {
        const limiteM = (f.hasMontaje && f.montajeDate === f.date) ? timeToMinutes(f.montajeStart) : startM;
        if (ensEndM > limiteM) {
          return `El ensayo debe finalizar antes del ${f.hasMontaje ? 'montaje previo' : 'evento'} (${minutesToTime(limiteM)}).`;
        }
      }
    }

    return null;
  }

  // =========================================================================
  // 11. Paso 3: Validación de Disponibilidad y Cruces de Horario
  // =========================================================================
  function intervalsOverlap(startA, endA, startB, endB) {
    return startA < endB && endA > startB;
  }

  function comprobarDisponibilidadCompleta() {
    const f = getValoresFormulario();
    const conflictos = [];

    // Intervalos propuestos activos para el evento en edición
    const misIntervalos = [
      {
        nombre: 'Evento Principal',
        date: f.date,
        startM: timeToMinutes(f.startTime),
        endM: timeToMinutes(f.endTime)
      }
    ];

    if (f.hasMontaje && f.montajeDate && f.montajeStart && f.montajeEnd) {
      misIntervalos.push({
        nombre: 'Montaje Técnico',
        date: f.montajeDate,
        startM: timeToMinutes(f.montajeStart),
        endM: timeToMinutes(f.montajeEnd)
      });
    }

    if (f.hasDesmontaje && f.desmontajeDate && f.desmontajeStart && f.desmontajeEnd) {
      misIntervalos.push({
        nombre: 'Desmontaje Técnico',
        date: f.desmontajeDate,
        startM: timeToMinutes(f.desmontajeStart),
        endM: timeToMinutes(f.desmontajeEnd)
      });
    }

    if (f.hasEnsayo && f.ensayoDate && f.ensayoStart && f.ensayoEnd) {
      misIntervalos.push({
        nombre: 'Ensayo Técnico',
        date: f.ensayoDate,
        startM: timeToMinutes(f.ensayoStart),
        endM: timeToMinutes(f.ensayoEnd)
      });
    }

    // 1. Evaluar contra otros eventos registrados (excluyendo el evento en edición)
    eventsData.forEach(ev => {
      if (ev.id === currentEventId) return;

      const franjasOtro = [
        {
          origen: `${ev.code}: ${ev.name} (${ev.client})`,
          tipo: 'Evento Principal',
          date: ev.date,
          startM: timeToMinutes(ev.startTime),
          endM: timeToMinutes(ev.endTime)
        }
      ];

      if (ev.hasMontaje) {
        franjasOtro.push({
          origen: `${ev.code}: Montaje de ${ev.name}`,
          tipo: 'Montaje Técnico',
          date: ev.montajeDate || ev.date,
          startM: timeToMinutes(ev.montajeStart),
          endM: timeToMinutes(ev.montajeEnd || ev.startTime)
        });
      }

      if (ev.hasDesmontaje) {
        franjasOtro.push({
          origen: `${ev.code}: Desmontaje de ${ev.name}`,
          tipo: 'Desmontaje Técnico',
          date: ev.desmontajeDate || ev.date,
          startM: timeToMinutes(ev.desmontajeStart || ev.endTime),
          endM: timeToMinutes(ev.desmontajeEnd)
        });
      }

      if (ev.hasEnsayo && ev.ensayoDate) {
        franjasOtro.push({
          origen: `${ev.code}: Ensayo técnico de ${ev.name}`,
          tipo: 'Ensayo Técnico',
          date: ev.ensayoDate,
          startM: timeToMinutes(ev.ensayoStart),
          endM: timeToMinutes(ev.ensayoEnd)
        });
      }

      // Comparación cruzada de intervalos
      misIntervalos.forEach(mio => {
        franjasOtro.forEach(otro => {
          if (mio.date === otro.date && intervalsOverlap(mio.startM, mio.endM, otro.startM, otro.endM)) {
            conflictos.push({
              origen: otro.origen,
              fecha: otro.date,
              franja: `${minutesToTime(otro.startM)} - ${minutesToTime(otro.endM)}`,
              motivo: `Cruce con ${mio.nombre} (${minutesToTime(mio.startM)} - ${minutesToTime(mio.endM)})`
            });
          }
        });
      });
    });

    // 2. Evaluar contra bloqueos institucionales
    INSTITUTIONAL_BLOCKS.forEach(blk => {
      const blkStartM = timeToMinutes(blk.startTime);
      const blkEndM = timeToMinutes(blk.endTime);

      misIntervalos.forEach(mio => {
        if (mio.date === blk.date && intervalsOverlap(mio.startM, mio.endM, blkStartM, blkEndM)) {
          conflictos.push({
            origen: `${blk.id}: ${blk.title}`,
            fecha: blk.date,
            franja: `${blk.startTime} - ${blk.endTime}`,
            motivo: `Cruce de ${mio.nombre} con bloqueo institucional de auditorio`
          });
        }
      });
    });

    return conflictos;
  }

  function generarSugerenciasHorarios() {
    const f = getValoresFormulario();
    const durMontaje = f.hasMontaje ? (timeToMinutes(f.montajeEnd) - timeToMinutes(f.montajeStart)) : 0;
    const durEvento = timeToMinutes(f.endTime) - timeToMinutes(f.startTime);
    const durDesmontaje = f.hasDesmontaje ? (timeToMinutes(f.desmontajeEnd) - timeToMinutes(f.desmontajeStart)) : 0;
    const durTotal = durMontaje + durEvento + durDesmontaje;

    const alternativas = [];
    const step = 30;

    for (let t = REGULAR_HOURS.START_MINUTES; t + durTotal <= REGULAR_HOURS.END_MINUTES; t += step) {
      const cMainStart = t;
      const cMainEnd = t + durTotal;

      const cMontStart = f.hasMontaje ? minutesToTime(t) : null;
      const cMontEnd = f.hasMontaje ? minutesToTime(t + durMontaje) : null;
      const cEvtStart = minutesToTime(t + durMontaje);
      const cEvtEnd = minutesToTime(t + durMontaje + durEvento);
      const cDesStart = f.hasDesmontaje ? minutesToTime(t + durMontaje + durEvento) : null;
      const cDesEnd = f.hasDesmontaje ? minutesToTime(cMainEnd) : null;

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

      if (!choca) {
        alternativas.push({
          inicio: cEvtStart,
          fin: cEvtEnd,
          montajeStart: cMontStart,
          montajeEnd: cMontEnd,
          desmontajeStart: cDesStart,
          desmontajeEnd: cDesEnd,
          duracionTotal: durTotal
        });
      }

      if (alternativas.length >= 3) break;
    }

    return alternativas;
  }

  function prepararPaso3Validacion() {
    const f = getValoresFormulario();

    const montageHtml = f.hasMontaje
      ? `${fechaPe(f.montajeDate)} (${f.montajeStart} - ${f.montajeEnd})`
      : 'No requiere';
    const desmontajeHtml = f.hasDesmontaje
      ? `${fechaPe(f.desmontajeDate)} (${f.desmontajeStart} - ${f.desmontajeEnd})`
      : 'No requiere';
    const ensayoHtml = f.hasEnsayo
      ? `${fechaPe(f.ensayoDate)} (${f.ensayoStart} - ${f.ensayoEnd})`
      : 'No requiere';

    dom.detalleHorarioValidar.innerHTML = `
      <div class="dato"><small>Auditorio</small><strong>Auditorio Showtech</strong></div>
      <div class="dato"><small>Fecha del evento</small><strong>${fechaPe(f.date)}</strong></div>
      <div class="dato"><small>Montaje previo</small><strong>${montageHtml}</strong></div>
      <div class="dato"><small>Horario del evento</small><strong>${f.startTime} - ${f.endTime}</strong></div>
      <div class="dato"><small>Desmontaje posterior</small><strong>${desmontajeHtml}</strong></div>
      <div class="dato"><small>Ensayo técnico</small><strong>${ensayoHtml}</strong></div>
    `;

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
      isAvailabilityVerified = true;
      dom.availabilityFeedback.className = 'aviso aviso-ok';
      dom.feedbackTitle.textContent = '✓ Disponibilidad verificada en Auditorio Showtech';
      dom.feedbackMessage.textContent = 'La franja solicitada y sus tiempos técnicos no presentan conflictos con otros eventos ni bloqueos institucionales.';
      dom.feedbackDetails.classList.add('oculto');
      dom.scheduleSuggestionsContainer.classList.add('oculto');
      dom.btnContinuarPaso4.disabled = false;
      showToast('Disponibilidad verificada sin conflictos.', 'ok');
    } else {
      isAvailabilityVerified = false;
      dom.availabilityFeedback.className = 'aviso aviso-error';
      dom.feedbackTitle.textContent = `⚠ Conflicto detectado (${conflictos.length} cruce(s))`;
      dom.feedbackMessage.textContent = 'El auditorio se encuentra ocupado en los horarios solicitados por las siguientes reservas:';
      dom.feedbackDetails.classList.remove('oculto');
      dom.feedbackDetails.innerHTML = conflictos.map(c => `
        <li><strong>${escapeHtml(c.origen)}</strong> (${fechaPe(c.fecha)} de ${c.franja}): ${escapeHtml(c.motivo)}</li>
      `).join('');

      dom.btnContinuarPaso4.disabled = true;

      lastConflictAlternatives = generarSugerenciasHorarios();
      if (lastConflictAlternatives.length > 0) {
        dom.scheduleSuggestionsContainer.classList.remove('oculto');
        dom.suggestionsList.innerHTML = lastConflictAlternatives.map((alt, idx) => `
          <div class="sugerencia-card">
            <div>
              <div class="sug-horario">Evento: ${alt.inicio} - ${alt.fin}</div>
              <div class="sug-detalle">
                ${alt.montajeStart ? `Montaje: ${alt.montajeStart} - ${alt.montajeEnd} &bull; ` : ''}
                ${alt.desmontajeEnd ? `Desmontaje: ${alt.desmontajeStart} - ${alt.desmontajeEnd}` : ''}
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

    setTimeFieldValue('eventStartTime', alt.inicio);
    setTimeFieldValue('eventEndTime', alt.fin);
    if (alt.montajeStart) setTimeFieldValue('montajeStartTime', alt.montajeStart);
    if (alt.montajeEnd) setTimeFieldValue('montajeEndTime', alt.montajeEnd);
    if (alt.desmontajeStart) setTimeFieldValue('desmontajeStartTime', alt.desmontajeStart);
    if (alt.desmontajeEnd) setTimeFieldValue('desmontajeEndTime', alt.desmontajeEnd);

    actualizarResumenHorario();
    actualizarEstadoDiferencias();
    prepararPaso3Validacion();
    ejecutarVerificacionDisponibilidad();
    showToast('Horario alternativo aplicado al formulario.', 'ok');
  };

  // =========================================================================
  // 12. Paso 4: Comparativo en Dos Columnas, Importe y PDF
  // =========================================================================
  function calcularDiferencias() {
    if (!originalSnapshot) return [];
    const actual = getValoresFormulario();
    const diffs = [];

    const camposGenerales = [
      { key: 'name', label: 'Nombre del evento' },
      { key: 'client', label: 'Cliente (Razón Social)' },
      { key: 'contact', label: 'Persona de contacto' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'email', label: 'Correo electrónico' },
      { key: 'requestedBy', label: 'Modificación solicitada por' },
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
      { campo: 'Cliente (Razón Social)', actual: orig.client, propuesto: act.client, modificado: orig.client !== act.client },
      { campo: 'Persona de contacto', actual: orig.contact, propuesto: act.contact, modificado: orig.contact !== act.contact },
      { campo: 'Teléfono', actual: orig.phone || '(sin teléfono)', propuesto: act.phone || '(sin teléfono)', modificado: (orig.phone || '') !== (act.phone || '') },
      { campo: 'Correo electrónico', actual: orig.email || '(sin correo)', propuesto: act.email || '(sin correo)', modificado: (orig.email || '') !== (act.email || '') },
      { campo: 'Modificación solicitada por', actual: orig.requestedBy, propuesto: act.requestedBy, modificado: orig.requestedBy !== act.requestedBy },
      { campo: 'Observaciones / Requerimientos', actual: orig.notes || '(sin observaciones)', propuesto: act.notes || '(sin observaciones)', modificado: (orig.notes || '') !== (act.notes || '') },
      { campo: 'Fecha del evento', actual: fechaPe(origDateNorm), propuesto: fechaPe(actDateNorm), modificado: origDateNorm !== actDateNorm },
      { campo: 'Horario del evento', actual: `${origStartNorm} - ${origEndNorm}`, propuesto: `${actStartNorm} - ${actEndNorm}`, modificado: (origStartNorm !== actStartNorm || origEndNorm !== actEndNorm) },
      { campo: 'Montaje técnico previo', actual: origMont, propuesto: actMont, modificado: origMont !== actMont },
      { campo: 'Desmontaje técnico posterior', actual: origDesm, propuesto: actDesm, modificado: origDesm !== actDesm },
      { campo: 'Ensayo técnico previo', actual: origEns, propuesto: actEns, modificado: origEns !== actEns }
    ];
  }

  function armarComprobanteHtml(finalizado = false, correlativo = '') {
    const f = getValoresFormulario();
    const ev = getCurrentEvent();
    const fila = (a, b) => `<div class="comp-fila"><span>${escapeHtml(a)}</span><span>${escapeHtml(b)}</span></div>`;

    const tiemposArr = [];
    if (f.hasMontaje) tiemposArr.push(`Montaje: ${fechaPe(f.montajeDate)} (${f.montajeStart} - ${f.montajeEnd})`);
    tiemposArr.push(`Evento: ${fechaPe(f.date)} (${f.startTime} - ${f.endTime})`);
    if (f.hasDesmontaje) tiemposArr.push(`Desmontaje: ${fechaPe(f.desmontajeDate)} (${f.desmontajeStart} - ${f.desmontajeEnd})`);

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
        <span style="color:var(--ok)">✓ Disponibilidad verificada</span>
      </div>
    `;
  }

  function prepararPaso4Revision() {
    dom.vistaRevision.classList.remove('oculto');
    dom.vistaExito.classList.add('oculto');
    dom.errorPaso4.textContent = '';
    dom.avisoFinal.innerHTML = '';

    toggleFichaCompleta(true);

    const diffs = calcularDiferencias();
    const itemsComparativos = generarListaCamposComparativos();
    const f = getValoresFormulario();

    // 1. Resumen de Horas e Importe Adicional (Vista Asesor Comercial)
    const durOrigMin = (timeToMinutes(originalSnapshot.endTime) - timeToMinutes(originalSnapshot.startTime));
    const durActMin = (timeToMinutes(f.endTime) - timeToMinutes(f.startTime));
    const diffMin = durActMin - durOrigMin;

    let diffClase = '';
    let diffTexto = 'Sin variación';
    let diffExplicacion = 'Misma duración del evento principal.';

    if (diffMin > 0) {
      diffClase = 'diff-mas';
      diffTexto = `+${formatDuracionMin(diffMin)}`;
      diffExplicacion = 'Mayor permanencia en sala respecto al registro original.';
    } else if (diffMin < 0) {
      diffClase = 'diff-menos';
      diffTexto = `-${formatDuracionMin(Math.abs(diffMin))}`;
      diffExplicacion = 'Menor permanencia en sala respecto al registro original.';
    }

    const ev = getCurrentEvent();
    const tarifaConfigurada = (ev && typeof ev.hourlyRate === 'number' && ev.hourlyRate > 0)
      ? ev.hourlyRate
      : (ev && typeof ev.tarifaHora === 'number' && ev.tarifaHora > 0)
        ? ev.tarifaHora
        : (ev && typeof ev.tarifaAdicionalHora === 'number' && ev.tarifaAdicionalHora > 0)
          ? ev.tarifaAdicionalHora
          : null;

    let horasAdicionalesValor = '0';
    let horasAdicionalesSub = 'Sin ampliación de horario';
    let tarifaItemHtml = '';
    let importeAdicionalValor = 'No aplica';
    let importeClase = 'importe-no-aplica';
    let importeSub = 'No genera cobro adicional';

    if (diffMin <= 0) {
      horasAdicionalesValor = '0';
      horasAdicionalesSub = 'Sin ampliación de horario';
      importeAdicionalValor = 'No aplica';
      importeClase = 'importe-no-aplica';
      importeSub = 'No genera cobro adicional';
    } else {
      horasAdicionalesValor = `+${formatDuracionMin(diffMin)}`;
      horasAdicionalesSub = 'Tiempo adicional en sala';

      if (tarifaConfigurada !== null) {
        const horasDecimales = diffMin / 60;
        const importeCalculado = (horasDecimales * tarifaConfigurada).toFixed(2);
        tarifaItemHtml = `
          <div class="item-duracion item-comercial">
            <small>Tarifa aplicada:</small>
            <strong class="comercial-valor">S/ ${tarifaConfigurada.toFixed(2)} / h</strong>
            <span class="comercial-sub">Tarifa horaria configurada</span>
          </div>
        `;
        importeAdicionalValor = `S/ ${importeCalculado}`;
        importeClase = 'importe-calculado';
        importeSub = `Cálculo: ${formatDuracionMin(diffMin)} × S/ ${tarifaConfigurada.toFixed(2)}/h`;
      } else {
        importeAdicionalValor = 'Pendiente de cotización';
        importeClase = 'importe-pendiente';
        importeSub = 'Requiere fijar tarifa comercial';
      }
    }

    if (dom.durationSummaryContainer) {
      dom.durationSummaryContainer.innerHTML = `
        <div class="resumen-duracion-box">
          <div class="resumen-duracion-cab">
            <span class="resumen-duracion-titulo">Resumen de Horas e Importe Adicional</span>
            <span class="badge-tecnico badge-evento">Asesor Comercial</span>
          </div>

          <div class="grid-duracion">
            <div class="item-duracion">
              <small>Duración anterior</small>
              <strong>${formatDuracionMin(durOrigMin)}</strong>
              <span>(${originalSnapshot.startTime} - ${originalSnapshot.endTime})</span>
            </div>
            <div class="item-duracion">
              <small>Duración propuesta</small>
              <strong>${formatDuracionMin(durActMin)}</strong>
              <span>(${f.startTime} - ${f.endTime})</span>
            </div>
            <div class="item-duracion">
              <small>Diferencia de tiempo</small>
              <strong class="${diffClase}">${diffTexto}</strong>
              <span>${diffExplicacion}</span>
            </div>
          </div>

          <div class="resumen-comercial-grid">
            <div class="item-duracion item-comercial">
              <small>Horas adicionales:</small>
              <strong class="comercial-valor ${diffMin > 0 ? 'diff-mas' : ''}">${horasAdicionalesValor}</strong>
              <span class="comercial-sub">${horasAdicionalesSub}</span>
            </div>
            ${tarifaItemHtml}
            <div class="item-duracion item-comercial">
              <small>Importe adicional:</small>
              <strong class="comercial-valor ${importeClase}">${importeAdicionalValor}</strong>
              <span class="comercial-sub">${importeSub}</span>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Tabla Comparativa en Dos Columnas
    if (diffs.length === 0) {
      dom.diffTableContainer.innerHTML = `
        <div class="aviso aviso-info" style="margin-bottom:0;">
          No hay cambios pendientes para guardar.
        </div>
      `;
      dom.btnConfirmSave.disabled = true;
      dom.btnConfirmSave.setAttribute('title', 'No hay cambios pendientes para guardar');
    } else {
      dom.btnConfirmSave.disabled = false;
      dom.btnConfirmSave.removeAttribute('title');

      dom.diffTableContainer.innerHTML = `
        <div class="comparativo-wrap">
          <table class="comparativo-tabla">
            <thead>
              <tr>
                <th class="col-campo">Campo del evento</th>
                <th class="col-actual">Datos actuales</th>
                <th class="col-propuesto">Cambios propuestos</th>
              </tr>
            </thead>
            <tbody>
              ${itemsComparativos.map(item => {
                const esModificado = (item.modificado !== undefined ? item.modificado : item.actual !== item.propuesto);
                return `
                  <tr class="${esModificado ? 'fila-modificada' : ''}">
                    <td class="col-campo">
                      ${escapeHtml(item.campo)}
                    </td>
                    <td class="col-actual">
                      ${item.actual}
                    </td>
                    <td class="col-propuesto ${esModificado ? 'modificado' : ''}">
                      ${item.propuesto}
                      ${esModificado ? '<span class="pill-mod-inline">Modificado</span>' : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    dom.comprobante.innerHTML = armarComprobanteHtml(false);
  }

  function ejecutarGuardadoDefinitivo() {
    const diffs = calcularDiferencias();
    if (diffs.length === 0) {
      dom.errorPaso4.textContent = 'No hay cambios pendientes para guardar.';
      dom.btnConfirmSave.disabled = true;
      showToast('No hay cambios pendientes para guardar.', 'error');
      return;
    }

    const f = getValoresFormulario();

    if (hayCambiosDeHorario()) {
      const conflictos = comprobarDisponibilidadCompleta();
      if (conflictos.length > 0) {
        dom.errorPaso4.textContent = 'No se puede guardar: se detectó un conflicto de horario antes de la confirmación definitiva. Los datos originales se conservan.';
        showToast('Conflicto detectado antes del guardado. Operación cancelada.', 'error');
        return;
      }
    }

    const idx = eventsData.findIndex(e => e.id === currentEventId);
    if (idx === -1) {
      dom.errorPaso4.textContent = 'Error: no se encontró el evento a actualizar.';
      return;
    }

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
      montajeDate: f.montajeDate,
      montajeStart: f.montajeStart,
      montajeEnd: f.montajeEnd,
      hasDesmontaje: f.hasDesmontaje,
      desmontajeDate: f.desmontajeDate,
      desmontajeStart: f.desmontajeStart,
      desmontajeEnd: f.desmontajeEnd,
      hasEnsayo: f.hasEnsayo,
      ensayoDate: f.ensayoDate,
      ensayoStart: f.ensayoStart,
      ensayoEnd: f.ensayoEnd,
      lastModified: new Date().toISOString()
    };

    eventsData[idx] = eventoActualizado;
    saveEventsStorage();

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

    originalSnapshot = JSON.parse(JSON.stringify(eventoActualizado));
    isAvailabilityVerified = true;
    actualizarEstadoDiferencias();

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

  // =========================================================================
  // 13. Descarga de Resumen en PDF para el Cliente (jsPDF)
  // =========================================================================
  function descargarResumenPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast('La librería jsPDF no está disponible en este momento.', 'error');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const ev = getCurrentEvent();
    if (!ev) return;

    const diffs = calcularDiferencias();
    const fechaEmision = new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // 1. Franja Superior Showtech
    doc.setFillColor(31, 78, 156);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 26, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('SHOWTECH SOLUTIONS S.A.C.', 15, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('RUC: 20613979051  |  Gestión Operativa de Auditorio', 15, 18);
    doc.text('RESUMEN DE MODIFICACIÓN DE EVENTO', 195, 12, { align: 'right' });
    doc.text(`Emisión: ${fechaEmision}`, 195, 18, { align: 'right' });

    let y = 37;

    // 2. Ficha Resumen del Evento y Cliente
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 32, 2, 2, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);

    doc.setFont('helvetica', 'bold');
    doc.text('Código de evento:', 20, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.code}`, 52, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 20, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.name}`.slice(0, 42), 52, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Lugar asignado:', 20, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.space || 'Auditorio Showtech'}`, 52, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', 20, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.status || 'Confirmado'}`, 52, y + 28);

    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 110, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.client}`.slice(0, 38), 130, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Contacto:', 110, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.contact || '-'}`.slice(0, 38), 130, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Teléfono/Email:', 110, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.phone || '-'} / ${ev.email || '-'}`.slice(0, 35), 135, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.text('Solicitado por:', 110, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ev.requestedBy || 'Cliente'}`, 135, y + 28);

    y += 40;

    // 3. Fechas y Horarios Confirmados
    doc.setTextColor(31, 78, 156);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CRONOGRAMA Y TIEMPOS TÉCNICOS CONFIRMADOS', 15, y);

    y += 4;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Bloque técnico', 18, y + 5);
    doc.text('Fecha programada', 65, y + 5);
    doc.text('Horario confirmado', 120, y + 5);
    doc.text('Estado', 170, y + 5);

    y += 7;
    const bloques = [
      {
        tipo: 'Evento Principal',
        fecha: fechaPe(ev.date),
        horario: `${ev.startTime} - ${ev.endTime}`,
        estado: 'Confirmado'
      },
      {
        tipo: 'Montaje Técnico',
        fecha: ev.hasMontaje ? fechaPe(ev.montajeDate || ev.date) : '-',
        horario: ev.hasMontaje ? `${ev.montajeStart} - ${ev.montajeEnd || ev.startTime}` : 'No solicitado',
        estado: ev.hasMontaje ? 'Programado' : 'No aplica'
      },
      {
        tipo: 'Desmontaje Técnico',
        fecha: ev.hasDesmontaje ? fechaPe(ev.desmontajeDate || ev.date) : '-',
        horario: ev.hasDesmontaje ? `${ev.desmontajeStart || ev.endTime} - ${ev.desmontajeEnd}` : 'No solicitado',
        estado: ev.hasDesmontaje ? 'Programado' : 'No aplica'
      },
      {
        tipo: 'Ensayo Técnico',
        fecha: ev.hasEnsayo ? fechaPe(ev.ensayoDate) : '-',
        horario: ev.hasEnsayo ? `${ev.ensayoStart} - ${ev.ensayoEnd}` : 'No solicitado',
        estado: ev.hasEnsayo ? 'Programado' : 'No aplica'
      }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    bloques.forEach(b => {
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y + 6, 195, y + 6);
      doc.setTextColor(15, 23, 42);
      doc.text(b.tipo, 18, y + 4.5);
      doc.text(b.fecha, 65, y + 4.5);
      doc.text(b.horario, 120, y + 4.5);
      doc.setTextColor(b.estado === 'No aplica' ? 148 : 31, b.estado === 'No aplica' ? 163 : 78, b.estado === 'No aplica' ? 184 : 156);
      doc.text(b.estado, 170, y + 4.5);
      y += 7;
    });

    y += 5;

    // 4. Modificaciones Acordadas (Sin notas internas de auditoría)
    doc.setTextColor(31, 78, 156);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('MODIFICACIONES ACORDADAS RESPECTO AL REGISTRO PREVIO', 15, y);

    y += 4;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto / Campo', 18, y + 5);
    doc.text('Valor anterior', 75, y + 5);
    doc.text('Valor nuevo propuesto', 135, y + 5);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    if (diffs.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.text('No se registraron cambios sobre los datos previos.', 18, y + 4.5);
      y += 7;
    } else {
      diffs.forEach(d => {
        doc.setDrawColor(226, 232, 240);
        doc.line(15, y + 6, 195, y + 6);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`${d.campo}`.slice(0, 30), 18, y + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${d.anterior}`.slice(0, 32), 75, y + 4.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${d.nuevo}`.slice(0, 32), 135, y + 4.5);
        y += 6.5;
      });
    }

    y += 4;

    // 5. Resumen de Horas e Importe Adicional (Vista Asesor Comercial)
    const durOrigPdfMin = originalSnapshot ? (timeToMinutes(originalSnapshot.endTime) - timeToMinutes(originalSnapshot.startTime)) : (timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime));
    const durActPdfMin = (timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime));
    const diffPdfMin = durActPdfMin - durOrigPdfMin;
    const tarifaConfigPdf = (typeof ev.hourlyRate === 'number' && ev.hourlyRate > 0)
      ? ev.hourlyRate
      : (typeof ev.tarifaHora === 'number' && ev.tarifaHora > 0)
        ? ev.tarifaHora
        : (typeof ev.tarifaAdicionalHora === 'number' && ev.tarifaAdicionalHora > 0)
          ? ev.tarifaAdicionalHora
          : null;

    let horasAdicPdf = '0';
    let importeAdicPdf = 'No aplica';
    let detalleTarifaPdf = '';

    if (diffPdfMin > 0) {
      horasAdicPdf = `+${formatDuracionMin(diffPdfMin)}`;
      if (tarifaConfigPdf !== null) {
        const impCalc = ((diffPdfMin / 60) * tarifaConfigPdf).toFixed(2);
        detalleTarifaPdf = `Tarifa aplicada: S/ ${tarifaConfigPdf.toFixed(2)}/h   |   `;
        importeAdicPdf = `S/ ${impCalc}`;
      } else {
        importeAdicPdf = 'Pendiente de cotización';
      }
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 22, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 22, 2, 2, 'S');

    doc.setTextColor(31, 78, 156);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('RESUMEN DE HORAS E IMPORTE ADICIONAL', 20, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Horario propuesto en sala: ${ev.startTime} a ${ev.endTime} (${formatDuracionMin(durActPdfMin)})`, 20, y + 12);

    doc.setFont('helvetica', 'bold');
    const labelLine = `Horas adicionales: ${horasAdicPdf}   |   ${detalleTarifaPdf}Importe adicional: `;
    doc.text(labelLine, 20, y + 18);
    doc.setTextColor(diffPdfMin > 0 && tarifaConfigPdf !== null ? 31 : (diffPdfMin > 0 ? 180 : 71), diffPdfMin > 0 && tarifaConfigPdf !== null ? 78 : (diffPdfMin > 0 ? 83 : 85), diffPdfMin > 0 && tarifaConfigPdf !== null ? 156 : (diffPdfMin > 0 ? 9 : 105));
    const labelW = doc.getTextWidth(labelLine);
    doc.text(importeAdicPdf, 20 + labelW, y + 18);

    // 6. Pie de Página Formal para el Cliente
    y = 270;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento formal informativo generado para el cliente. Los pagos registrados previamente se mantienen sin modificaciones.', 15, y + 5);
    doc.text('SHOWTECH SOLUTIONS S.A.C.  |  www.showtech.pe  |  Auditorio y Soluciones Audiovisuales', 15, y + 9);
    doc.text('Página 1 de 1', 195, y + 9, { align: 'right' });

    doc.save(`Showtech_Resumen_Modificacion_${ev.code}.pdf`);
    showToast('Resumen en PDF descargado correctamente.', 'ok');
  }

  window.reiniciar = function (pasoDestino) {
    cargarEvento(currentEventId);
    irPaso(pasoDestino);
  };

  // =========================================================================
  // 14. Historial de Auditoría
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
  // 15. Modales (Descartar y Restablecer Demo)
  // =========================================================================
  function abrirModalDescartar(mensaje) {
    const msgElem = $('discardModalMessage');
    if (msgElem && mensaje) {
      msgElem.textContent = mensaje;
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
  // 16. Vinculación de Event Listeners
  // =========================================================================
  function bindEvents() {
    // Búsqueda en Paso 1
    if (dom.buscar) {
      dom.buscar.addEventListener('input', renderTablaEventos);
    }

    // Toggles de tiempos técnicos independientes en Paso 2
    dom.chkMontaje.addEventListener('change', () => {
      const activo = dom.chkMontaje.checked;
      dom.fieldsMontaje.classList.toggle('oculto', !activo);
      const panelMont = $('panelMontaje');
      if (panelMont) panelMont.classList.toggle('desactivada', !activo);
      dom.montajeDate.disabled = !activo;
      dom.montajeStartTime.disabled = !activo;
      dom.montajeEndTime.disabled = !activo;

      if (!activo) {
        dom.montajeDate.classList.remove('input-error');
        dom.montajeStartTime.classList.remove('input-error');
        dom.montajeEndTime.classList.remove('input-error');
        const errD = $('errMontajeDate'); if (errD) errD.textContent = '';
        const errS = $('errMontajeStart'); if (errS) errS.textContent = '';
        const errE = $('errMontajeEnd'); if (errE) errE.textContent = '';
      } else {
        if (!dom.montajeDate.value) setDateFieldValue('montajeDate', dom.eventDate.value);
        if (!dom.montajeEndTime.value && dom.eventStartTime.value) setTimeFieldValue('montajeEndTime', dom.eventStartTime.value);
        if (!dom.montajeStartTime.value && dom.eventStartTime.value) {
          const m = Math.max(REGULAR_HOURS.START_MINUTES, timeToMinutes(dom.eventStartTime.value) - 60);
          setTimeFieldValue('montajeStartTime', minutesToTime(m));
        }
      }
      isAvailabilityVerified = false;
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    dom.chkDesmontaje.addEventListener('change', () => {
      const activo = dom.chkDesmontaje.checked;
      dom.fieldsDesmontaje.classList.toggle('oculto', !activo);
      const panelDesm = $('panelDesmontaje');
      if (panelDesm) panelDesm.classList.toggle('desactivada', !activo);
      dom.desmontajeDate.disabled = !activo;
      dom.desmontajeStartTime.disabled = !activo;
      dom.desmontajeEndTime.disabled = !activo;

      if (!activo) {
        dom.desmontajeDate.classList.remove('input-error');
        dom.desmontajeStartTime.classList.remove('input-error');
        dom.desmontajeEndTime.classList.remove('input-error');
        const errD = $('errDesmontajeDate'); if (errD) errD.textContent = '';
        const errS = $('errDesmontajeStart'); if (errS) errS.textContent = '';
        const errE = $('errDesmontajeEnd'); if (errE) errE.textContent = '';
      } else {
        if (!dom.desmontajeDate.value) setDateFieldValue('desmontajeDate', dom.eventDate.value);
        if (!dom.desmontajeStartTime.value && dom.eventEndTime.value) setTimeFieldValue('desmontajeStartTime', dom.eventEndTime.value);
        if (!dom.desmontajeEndTime.value && dom.eventEndTime.value) {
          const m = Math.min(REGULAR_HOURS.END_MINUTES, timeToMinutes(dom.eventEndTime.value) + 60);
          setTimeFieldValue('desmontajeEndTime', minutesToTime(m));
        }
      }
      isAvailabilityVerified = false;
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    dom.chkEnsayo.addEventListener('change', () => {
      const activo = dom.chkEnsayo.checked;
      dom.fieldsEnsayo.classList.toggle('oculto', !activo);
      const panelEns = $('panelEnsayo');
      if (panelEns) panelEns.classList.toggle('desactivada', !activo);
      dom.ensayoDate.disabled = !activo;
      dom.ensayoStartTime.disabled = !activo;
      dom.ensayoEndTime.disabled = !activo;

      if (!activo) {
        dom.ensayoDate.classList.remove('input-error');
        dom.ensayoStartTime.classList.remove('input-error');
        dom.ensayoEndTime.classList.remove('input-error');
        const errD = $('errEnsayoDate'); if (errD) errD.textContent = '';
        const errS = $('errEnsayoStart'); if (errS) errS.textContent = '';
        const errE = $('errEnsayoEnd'); if (errE) errE.textContent = '';
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
      isAvailabilityVerified = false;
      actualizarResumenHorario();
      actualizarEstadoDiferencias();
    });

    // Inputs que modifican fechas u horarios -> invalidan verificación previa
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
            isAvailabilityVerified = false;
            actualizarResumenHorario();
            actualizarEstadoDiferencias();
          });
        });
      }
    });

    // Sincronizar fechas por defecto si cambia fecha del evento
    dom.eventDate.addEventListener('change', () => {
      if (dom.chkMontaje.checked && (!dom.montajeDate.value || dom.montajeDate.value === originalSnapshot.date)) {
        setDateFieldValue('montajeDate', dom.eventDate.value);
      }
      if (dom.chkDesmontaje.checked && (!dom.desmontajeDate.value || dom.desmontajeDate.value === originalSnapshot.date)) {
        setDateFieldValue('desmontajeDate', dom.eventDate.value);
      }
      if (dom.chkEnsayo.checked && (!dom.ensayoDate.value || dom.ensayoDate.value === originalSnapshot.date)) {
        setDateFieldValue('ensayoDate', dom.eventDate.value);
      }
    });

    // Inputs de datos generales -> actualizan badges sin invalidar horario
    const generalInputs = [
      dom.eventName, dom.eventClient, dom.eventContact,
      dom.eventPhone, dom.eventEmail, dom.requestedBy, dom.eventNotes
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

    if (dom.modificationReason) {
      dom.modificationReason.addEventListener('input', () => {
        const diffs = calcularDiferencias();
        dom.btnConfirmSave.disabled = (diffs.length === 0);
        if (diffs.length === 0) {
          dom.btnConfirmSave.setAttribute('title', 'No hay cambios pendientes para guardar');
        } else {
          dom.btnConfirmSave.removeAttribute('title');
        }
      });
    }

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
    if (dom.btnToggleFicha) {
      dom.btnToggleFicha.addEventListener('click', () => toggleFichaCompleta());
    }

    dom.btnConfirmSave.addEventListener('click', ejecutarGuardadoDefinitivo);
    dom.btnDescartarFinal.addEventListener('click', () => {
      if (hayCambiosPendientes()) {
        abrirModalDescartar('¿Desea descartar las modificaciones y cancelar el guardado?');
      } else {
        showToast('No hay cambios pendientes.', 'info');
      }
    });

    // Botón de descarga de PDF para el cliente
    if (dom.btnDescargarPdf) {
      dom.btnDescargarPdf.addEventListener('click', descargarResumenPdf);
    }

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
  // 17. Arranque inicial
  // =========================================================================
  function iniciar() {
    loadStorage();
    initFlatpickrDatePickers();
    initFlatpickrTimePickers();
    bindEvents();
    cargarEvento('EVT-001');
    const hashMatch = window.location.hash ? window.location.hash.match(/paso-?(\d+)/i) : null;
    const pasoInicial = hashMatch ? parseInt(hashMatch[1], 10) : 1;
    irPaso(pasoInicial >= 1 && pasoInicial <= 4 ? pasoInicial : 1);

    if (window.location.hash.includes('ensayo=1')) {
      const chkE = document.getElementById('chkEnsayo');
      if (chkE && !chkE.checked) {
        chkE.checked = true;
        chkE.dispatchEvent(new Event('change'));
      }
    }
    if (window.location.hash.includes('desmontaje=0')) {
      const chkD = document.getElementById('chkDesmontaje');
      if (chkD && chkD.checked) {
        chkD.checked = false;
        chkD.dispatchEvent(new Event('change'));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
