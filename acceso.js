/**
 * ============================================================================
 * SHOWTECH SOLUTIONS - PROTOTIPO DE ACCESO Y VERIFICACIÓN POR CORREO
 * Archivo: acceso.js
 * Propósito: Lógica de interacción para inicio de sesión, verificación
 *            exclusiva por correo (asesor/cliente) e inicio de sesión real
 *            con Google mediante Firebase Authentication (SDK modular v10).
 * ============================================================================
 */

import { auth, googleProvider, signInWithPopup } from './firebase-init.js';

// ----------------------------------------------------------------------------
// 1. Constantes y Cuentas Ficticias de Demostración
// ----------------------------------------------------------------------------
const CUENTAS_DEMO = {
  asesor: {
    email: 'asesor@showtech.com',
    password: 'Asesor2026!',
    nombre: 'Asesor(a) comercial',
    rol: 'asesor',
    rolEtiqueta: 'Asesor',
    destino: 'index.html',
    emailEnmascarado: 'as***@showtech.com'
  },
  cliente: {
    email: 'cliente@horizonte.com',
    password: 'Cliente2026!',
    nombre: 'Promoción Horizonte 2026',
    rol: 'cliente',
    rolEtiqueta: 'Cliente',
    destino: 'cliente.html',
    emailEnmascarado: 'cl***@horizonte.com'
  }
};

const DEMO_SESSION_KEY = 'showtech_demo_session';
const RECORDATORIO_ASESOR_KEY = 'showtech_recordatorio_verificacion_asesor';
const ZONA_HORARIA_PERU = 'America/Lima';
const TIEMPO_EXPIRACION_SEGUNDOS = 60;
const TIEMPO_REENVIO_SEGUNDOS = 30;

// ----------------------------------------------------------------------------
// 1.1 Utilidades de Fecha/Hora (America/Lima) y Recordatorio Diario del Asesor
// ----------------------------------------------------------------------------
function obtenerAhora() {
  if (typeof window !== 'undefined' && window.__SHOWTECH_RELOJ_CONTROLABLE__ instanceof Date) {
    return new Date(window.__SHOWTECH_RELOJ_CONTROLABLE__.getTime());
  }
  return new Date();
}

function obtenerFechaCalendarioLima(fechaRef) {
  const fecha = fechaRef || obtenerAhora();
  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA_PERU,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const partes = formateador.formatToParts(fecha);
  const anio = partes.find(p => p.type === 'year').value;
  const mes = partes.find(p => p.type === 'month').value;
  const dia = partes.find(p => p.type === 'day').value;
  return `${anio}-${mes}-${dia}`;
}

function obtenerRecordatorioValido(emailCuenta) {
  if (!emailCuenta || typeof emailCuenta !== 'string') return null;

  try {
    const raw = localStorage.getItem(RECORDATORIO_ASESOR_KEY);
    if (!raw) return null;

    const registro = JSON.parse(raw);
    if (!registro || typeof registro !== 'object') return null;

    // Identificador estable de la cuenta ("de otra cuenta debe exigir verificación")
    if (typeof registro.cuentaId !== 'string' ||
        registro.cuentaId.toLowerCase().trim() !== emailCuenta.toLowerCase().trim()) {
      return null;
    }

    // Formato estricto de fecha en Perú (YYYY-MM-DD)
    if (typeof registro.diaPeru !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(registro.diaPeru)) {
      return null;
    }

    // Marca temporal ISO válida
    if (typeof registro.fechaVerificacionIso !== 'string') {
      return null;
    }
    const fechaVerif = new Date(registro.fechaVerificacionIso);
    if (isNaN(fechaVerif.getTime())) {
      return null;
    }

    // Recalcular el día actual de Perú en este preciso instante
    const ahora = obtenerAhora();
    const diaActualPeru = obtenerFechaCalendarioLima(ahora);

    // Un registro de fecha futura debe exigir verificación
    if (registro.diaPeru > diaActualPeru || fechaVerif.getTime() > ahora.getTime() + 1000) {
      return null;
    }

    // Un registro de un día anterior debe exigir verificación
    if (registro.diaPeru !== diaActualPeru) {
      return null;
    }

    // Consistencia interna: la fecha ISO guardada debe corresponder al día de Perú guardado
    if (obtenerFechaCalendarioLima(fechaVerif) !== registro.diaPeru) {
      return null;
    }

    return registro;
  } catch (e) {
    // Si localStorage falla o está corrupto, exigir verificación
    return null;
  }
}

function guardarRecordatorioAsesor(emailCuenta) {
  const ahora = obtenerAhora();
  const diaPeru = obtenerFechaCalendarioLima(ahora);
  const registro = {
    cuentaId: emailCuenta.toLowerCase().trim(),
    diaPeru: diaPeru,
    fechaVerificacionIso: ahora.toISOString()
  };

  try {
    localStorage.setItem(RECORDATORIO_ASESOR_KEY, JSON.stringify(registro));
    return true;
  } catch (e) {
    console.warn('No se pudo guardar el recordatorio en localStorage:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 2. Estado del Prototipo de Acceso
// ----------------------------------------------------------------------------
const estado = {
  pasoActual: 1, // 1: Login, 2: Verificación por correo
  cuentaSeleccionada: null,
  codigoActual: null,
  codigoVisible: false,
  codigoVencido: false,
  tiempoVigenciaRestante: TIEMPO_EXPIRACION_SEGUNDOS,
  timerVigencia: null,
  tiempoReenvioRestante: TIEMPO_REENVIO_SEGUNDOS,
  timerReenvio: null,
  proveedorSocial: null,
  ultimoBotonSocialFoco: null,
  verificando: false
};

// ----------------------------------------------------------------------------
// 3. Referencias DOM
// ----------------------------------------------------------------------------
const dom = {
  // Encabezado
  headerTextoDerecha: document.getElementById('headerTextoDerecha'),
  headerAvatarBtn: document.getElementById('headerAvatarBtn'),
  indicadorPasoSuperior: document.getElementById('indicadorPasoSuperior'),
  textoIndicadorPaso: document.getElementById('textoIndicadorPaso'),
  tarjetaAcceso: document.getElementById('tarjetaAcceso'),

  // Pantalla 1: Login
  pantallaLogin: document.getElementById('pantallaLogin'),
  formLogin: document.getElementById('formLogin'),
  inputEmail: document.getElementById('inputEmail'),
  errorEmail: document.getElementById('errorEmail'),
  inputPassword: document.getElementById('inputPassword'),
  errorPassword: document.getElementById('errorPassword'),
  btnTogglePassword: document.getElementById('btnTogglePassword'),
  iconoOjoAbierto: document.getElementById('iconoOjoAbierto'),
  iconoOjoCerrado: document.getElementById('iconoOjoCerrado'),
  linkOlvidoPassword: document.getElementById('linkOlvidoPassword'),
  alertaErrorCredenciales: document.getElementById('alertaErrorCredenciales'),
  textoErrorCredenciales: document.getElementById('textoErrorCredenciales'),
  btnIngresar: document.getElementById('btnIngresar'),
  btnSocialGoogle: document.getElementById('btnSocialGoogle'),
  btnSocialFacebook: document.getElementById('btnSocialFacebook'),
  btnAtajoAsesor: document.getElementById('btnAtajoAsesor'),
  btnAtajoCliente: document.getElementById('btnAtajoCliente'),

  // Pantalla 2: Verificación por correo
  pantallaCodigo: document.getElementById('pantallaCodigo'),
  lblEmailDestino: document.getElementById('lblEmailDestino'),
  ayudaFrecuenciaAsesor: document.getElementById('ayudaFrecuenciaAsesor'),
  instruccionMetodoTexto: document.getElementById('instruccionMetodoTexto'),
  valorCodigoPrueba: document.getElementById('valorCodigoPrueba'),
  btnToggleVerCodigo: document.getElementById('btnToggleVerCodigo'),
  btnAutollenarCodigo: document.getElementById('btnAutollenarCodigo'),
  contenedorCasillas: document.getElementById('contenedorCasillas'),
  casillas: Array.from(document.querySelectorAll('.casilla-codigo')),
  bloqueReenvioSimulado: document.getElementById('bloqueReenvioSimulado'),
  btnReenviarCodigo: document.getElementById('btnReenviarCodigo'),
  cuentaAtrasReenvio: document.getElementById('cuentaAtrasReenvio'),
  cuentaAtrasVigencia: document.getElementById('cuentaAtrasVigencia'),
  btnSimularVencido: document.getElementById('btnSimularVencido'),
  alertaErrorCodigo: document.getElementById('alertaErrorCodigo'),
  textoErrorCodigo: document.getElementById('textoErrorCodigo'),
  btnVerificarCodigo: document.getElementById('btnVerificarCodigo'),
  linkVolverLogin: document.getElementById('linkVolverLogin'),
  linkSoporte: document.getElementById('linkSoporte'),

  // Pie exterior
  piePaginaIzq: document.getElementById('piePaginaIzq'),
  piePaginaDer: document.getElementById('piePaginaDer'),

  // Modales
  modalSocial: document.getElementById('modalSocial'),
  tituloModalSocial: document.getElementById('tituloModalSocial'),
  btnCerrarModalSocial: document.getElementById('btnCerrarModalSocial'),
  btnCancelarSocial: document.getElementById('btnCancelarSocial'),
  btnContinuarSocial: document.getElementById('btnContinuarSocial'),
  itemSocialCliente: document.getElementById('itemSocialCliente'),

  modalRecuperacion: document.getElementById('modalRecuperacion'),
  btnCerrarModalRecuperacion: document.getElementById('btnCerrarModalRecuperacion'),
  btnEntendidoRecuperacion: document.getElementById('btnEntendidoRecuperacion'),

  modalSoporte: document.getElementById('modalSoporte'),
  btnCerrarModalSoporte: document.getElementById('btnCerrarModalSoporte'),
  btnEntendidoSoporte: document.getElementById('btnEntendidoSoporte')
};

// ----------------------------------------------------------------------------
// 4. Inicialización
// ----------------------------------------------------------------------------
function init() {
  vincularEventosLogin();
  vincularEventosCodigo();
  vincularEventosModales();
  mostrarPaso(1);
}

// ----------------------------------------------------------------------------
// 5. Gestión y Cambio de Pantallas / Pasos
// ----------------------------------------------------------------------------
function mostrarPaso(numPaso) {
  limpiarTemporizadores();
  estado.pasoActual = numPaso;

  // Ocultar ambas pantallas
  dom.pantallaLogin.classList.add('oculto');
  dom.pantallaCodigo.classList.add('oculto');

  if (numPaso === 1) {
    dom.pantallaLogin.classList.remove('oculto');
    dom.indicadorPasoSuperior.classList.add('oculto');
    dom.headerTextoDerecha.classList.remove('oculto');
    dom.headerAvatarBtn.classList.add('oculto');
    dom.piePaginaIzq.textContent = 'Propuesta visual · Pantalla de ingreso';
    dom.piePaginaDer.textContent = 'SHOWTECH SOLUTIONS · Gestión de eventos';
    document.title = 'Iniciar sesión - Showtech Solutions';
    limpiarErroresLogin();
    limpiarDesafioVerificacion();
    setTimeout(() => dom.inputEmail.focus(), 50);
  } 
  else if (numPaso === 2) {
    dom.pantallaCodigo.classList.remove('oculto');
    dom.indicadorPasoSuperior.classList.remove('oculto');
    dom.textoIndicadorPaso.textContent = '02 · Verificación por correo';
    dom.headerTextoDerecha.classList.add('oculto');
    dom.headerAvatarBtn.classList.remove('oculto');
    dom.piePaginaIzq.textContent = 'Propuesta visual · Verificación por correo';
    dom.piePaginaDer.textContent = 'SHOWTECH SOLUTIONS';
    document.title = 'Revisa tu correo - Showtech Solutions';

    prepararPasoCodigo();
  }
}

// ----------------------------------------------------------------------------
// 6. Lógica de Pantalla 1: Inicio de Sesión
// ----------------------------------------------------------------------------
function vincularEventosLogin() {
  // Submit del formulario
  dom.formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    procesarLogin();
  });

  // Alternar visibilidad de contraseña
  function alternarVisibilidadPassword() {
    const esPassword = dom.inputPassword.getAttribute('type') === 'password';
    const valorActual = dom.inputPassword.value;
    if (esPassword) {
      dom.inputPassword.setAttribute('type', 'text');
      dom.iconoOjoAbierto.classList.add('oculto');
      dom.iconoOjoCerrado.classList.remove('oculto');
      dom.btnTogglePassword.setAttribute('aria-label', 'Ocultar contraseña');
      dom.btnTogglePassword.setAttribute('title', 'Ocultar contraseña');
    } else {
      dom.inputPassword.setAttribute('type', 'password');
      dom.iconoOjoAbierto.classList.remove('oculto');
      dom.iconoOjoCerrado.classList.add('oculto');
      dom.btnTogglePassword.setAttribute('aria-label', 'Mostrar contraseña');
      dom.btnTogglePassword.setAttribute('title', 'Mostrar contraseña');
    }
    dom.inputPassword.value = valorActual;
  }

  dom.btnTogglePassword.addEventListener('click', (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    alternarVisibilidadPassword();
    dom.inputPassword.focus();
  });

  // Limpieza de errores al teclear
  dom.inputEmail.addEventListener('input', () => {
    dom.errorEmail.textContent = '';
    dom.inputEmail.classList.remove('input-error');
    dom.alertaErrorCredenciales.classList.add('oculto');
  });

  dom.inputPassword.addEventListener('input', () => {
    dom.errorPassword.textContent = '';
    dom.inputPassword.classList.remove('input-error');
    dom.alertaErrorCredenciales.classList.add('oculto');
  });

  // Atajos rápidos de credenciales demo
  dom.btnAtajoAsesor.addEventListener('click', () => {
    dom.inputEmail.value = CUENTAS_DEMO.asesor.email;
    dom.inputPassword.value = CUENTAS_DEMO.asesor.password;
    limpiarErroresLogin();
    dom.inputEmail.focus();
  });

  dom.btnAtajoCliente.addEventListener('click', () => {
    dom.inputEmail.value = CUENTAS_DEMO.cliente.email;
    dom.inputPassword.value = CUENTAS_DEMO.cliente.password;
    limpiarErroresLogin();
    dom.inputEmail.focus();
  });

  // Enlace: ¿Olvidaste tu contraseña?
  dom.linkOlvidoPassword.addEventListener('click', (e) => {
    e.preventDefault();
    abrirModalRecuperacion();
  });
}

function limpiarErroresLogin() {
  dom.errorEmail.textContent = '';
  dom.inputEmail.classList.remove('input-error');
  dom.errorPassword.textContent = '';
  dom.inputPassword.classList.remove('input-error');
  dom.alertaErrorCredenciales.classList.add('oculto');
}

function validarFormatoEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function procesarLogin() {
  limpiarErroresLogin();

  const emailVal = dom.inputEmail.value.trim();
  const passVal = dom.inputPassword.value;
  let hayError = false;

  // Validación campo email
  if (!emailVal) {
    dom.errorEmail.textContent = 'Ingresa tu correo electrónico.';
    dom.inputEmail.classList.add('input-error');
    hayError = true;
  } else if (!validarFormatoEmail(emailVal)) {
    dom.errorEmail.textContent = 'Ingresa un formato de correo válido (ejemplo: usuario@correo.com).';
    dom.inputEmail.classList.add('input-error');
    hayError = true;
  }

  // Validación campo password
  if (!passVal) {
    dom.errorPassword.textContent = 'Ingresa tu contraseña.';
    dom.inputPassword.classList.add('input-error');
    hayError = true;
  }

  if (hayError) return;

  // Comprobación contra cuentas autorizadas de demostración
  let cuentaEncontrada = null;
  if (emailVal.toLowerCase() === CUENTAS_DEMO.asesor.email.toLowerCase() && passVal === CUENTAS_DEMO.asesor.password) {
    cuentaEncontrada = CUENTAS_DEMO.asesor;
  } else if (emailVal.toLowerCase() === CUENTAS_DEMO.cliente.email.toLowerCase() && passVal === CUENTAS_DEMO.cliente.password) {
    cuentaEncontrada = CUENTAS_DEMO.cliente;
  }

  if (cuentaEncontrada) {
    // Si la cuenta es asesor, comprobar si ya completó la verificación hoy en America/Lima
    if (cuentaEncontrada.rol === 'asesor') {
      const recordatorio = obtenerRecordatorioValido(cuentaEncontrada.email);
      if (recordatorio) {
        // Omite la pantalla del código y crea la sesión reutilizando la verificación del día
        iniciarSesionConRecordatorio(cuentaEncontrada, recordatorio);
        return;
      }
    }

    estado.cuentaSeleccionada = cuentaEncontrada;
    mostrarPaso(2); // Pasa a la verificación por correo
  } else {
    dom.textoErrorCredenciales.textContent = 'El correo electrónico o la contraseña ingresados no coinciden con las cuentas de demostración.';
    dom.alertaErrorCredenciales.classList.remove('oculto');
  }
}

function iniciarSesionConRecordatorio(cuenta, recordatorio) {
  const ahora = obtenerAhora();
  const sesionReutilizada = {
    email: cuenta.email,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    rolEtiqueta: cuenta.rolEtiqueta,
    metodoVerificacion: 'recordatorio_diario',
    verificacionReutilizada: true,
    fechaVerificacionOriginal: recordatorio.fechaVerificacionIso,
    diaPeru: recordatorio.diaPeru,
    autenticado: true,
    timestamp: ahora.toISOString()
  };

  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sesionReutilizada));
  } catch (e) {
    console.warn('Error guardando sesión en sessionStorage:', e);
  }

  dom.btnIngresar.disabled = true;
  dom.btnIngresar.innerHTML = '<span>Ingresando...</span>';

  setTimeout(() => {
    window.location.href = cuenta.destino;
  }, 200);
}

// ----------------------------------------------------------------------------
// 7. Generador de Código de Demostración Dinámico
// ----------------------------------------------------------------------------
function generarNuevoCodigoDemo() {
  let nuevo;
  do {
    nuevo = Math.floor(100000 + Math.random() * 900000).toString();
  } while (nuevo === estado.codigoActual);
  return nuevo;
}

function alternarVisibilidadCodigoPrueba() {
  estado.codigoVisible = !estado.codigoVisible;
  actualizarVistaCodigoPrueba();
}

function actualizarVistaCodigoPrueba() {
  if (!dom.valorCodigoPrueba || !dom.btnToggleVerCodigo) return;
  if (estado.codigoVisible) {
    dom.valorCodigoPrueba.textContent = estado.codigoActual || '------';
    dom.btnToggleVerCodigo.textContent = 'Ocultar código de prueba';
    dom.btnToggleVerCodigo.setAttribute('aria-label', 'Ocultar código de prueba');
  } else {
    dom.valorCodigoPrueba.textContent = '••••••';
    dom.btnToggleVerCodigo.textContent = 'Ver código de prueba';
    dom.btnToggleVerCodigo.setAttribute('aria-label', 'Ver código de prueba');
  }
}

// ----------------------------------------------------------------------------
// 8. Lógica de Pantalla 2: Ingreso y Validación de Código de Verificación
// ----------------------------------------------------------------------------
function vincularEventosCodigo() {
  dom.casillas.forEach((casilla, idx) => {
    casilla.addEventListener('input', () => {
      const val = casilla.value.replace(/\D/g, '');
      if (val) {
        casilla.value = val.slice(-1);
        casilla.classList.remove('casilla-error');
        dom.alertaErrorCodigo.classList.add('oculto');
        if (idx < dom.casillas.length - 1) {
          dom.casillas[idx + 1].focus();
        }
      } else {
        casilla.value = '';
      }
    });

    casilla.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (casilla.value !== '') {
          casilla.value = '';
        } else if (idx > 0) {
          dom.casillas[idx - 1].focus();
          dom.casillas[idx - 1].value = '';
        }
        casilla.classList.remove('casilla-error');
        dom.alertaErrorCodigo.classList.add('oculto');
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        dom.casillas[idx - 1].focus();
      } else if (e.key === 'ArrowRight' && idx < dom.casillas.length - 1) {
        e.preventDefault();
        dom.casillas[idx + 1].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        verificarCodigo();
      }
    });

    casilla.addEventListener('paste', (e) => {
      e.preventDefault();
      const textoPegado = (e.clipboardData || window.clipboardData).getData('text') || '';
      const soloDigitos = textoPegado.replace(/\D/g, '').slice(0, 6);
      if (soloDigitos.length > 0) {
        for (let i = 0; i < dom.casillas.length; i++) {
          dom.casillas[i].value = soloDigitos[i] || '';
          dom.casillas[i].classList.remove('casilla-error');
        }
        dom.alertaErrorCodigo.classList.add('oculto');
        const focoIdx = Math.min(soloDigitos.length, dom.casillas.length - 1);
        dom.casillas[focoIdx].focus();
      }
    });
  });

  if (dom.btnToggleVerCodigo) {
    dom.btnToggleVerCodigo.addEventListener('click', () => {
      alternarVisibilidadCodigoPrueba();
    });
  }

  dom.btnAutollenarCodigo.addEventListener('click', () => {
    if (!estado.codigoActual) return;
    const digitos = estado.codigoActual.split('');
    dom.casillas.forEach((c, i) => {
      c.value = digitos[i] || '';
      c.classList.remove('casilla-error');
    });
    dom.alertaErrorCodigo.classList.add('oculto');
    dom.casillas[dom.casillas.length - 1].focus();
  });

  dom.btnSimularVencido.addEventListener('click', () => {
    estado.codigoVencido = true;
    estado.tiempoVigenciaRestante = 0;
    dom.cuentaAtrasVigencia.textContent = '0';
    mostrarErrorCodigo('El código de verificación ha expirado. Por favor solicita un nuevo código o reenvíalo.');
  });

  dom.btnReenviarCodigo.addEventListener('click', () => {
    if (dom.btnReenviarCodigo.disabled) return;
    reenviarCodigoSimulado();
  });

  dom.btnVerificarCodigo.addEventListener('click', () => {
    verificarCodigo();
  });

  dom.linkVolverLogin.addEventListener('click', (e) => {
    e.preventDefault();
    limpiarDesafioVerificacion();
    mostrarPaso(1);
  });

  dom.linkSoporte.addEventListener('click', (e) => {
    e.preventDefault();
    abrirModalSoporte();
  });
}

function prepararPasoCodigo() {
  limpiarCasillas();
  dom.alertaErrorCodigo.classList.add('oculto');
  estado.codigoVencido = false;
  estado.verificando = false;

  estado.codigoActual = generarNuevoCodigoDemo();
  estado.codigoVisible = false;
  actualizarVistaCodigoPrueba();

  if (estado.cuentaSeleccionada && estado.cuentaSeleccionada.emailEnmascarado) {
    dom.lblEmailDestino.textContent = estado.cuentaSeleccionada.emailEnmascarado;
  } else {
    dom.lblEmailDestino.textContent = 'tu correo registrado';
  }

  if (dom.ayudaFrecuenciaAsesor) {
    if (estado.cuentaSeleccionada && estado.cuentaSeleccionada.rol === 'asesor') {
      dom.ayudaFrecuenciaAsesor.classList.remove('oculto');
    } else {
      dom.ayudaFrecuenciaAsesor.classList.add('oculto');
    }
  }

  dom.btnVerificarCodigo.disabled = false;
  dom.btnVerificarCodigo.innerHTML = '<span>Verificar e ingresar</span>';

  iniciarTemporizadorVigencia();
  iniciarTemporizadorReenvio();
  setTimeout(() => dom.casillas[0].focus(), 50);
}

function limpiarCasillas() {
  dom.casillas.forEach(c => {
    c.value = '';
    c.classList.remove('casilla-error');
  });
}

function limpiarDesafioVerificacion() {
  limpiarTemporizadores();
  limpiarCasillas();
  dom.alertaErrorCodigo.classList.add('oculto');
  estado.codigoActual = null;
  estado.codigoVisible = false;
  estado.codigoVencido = false;
  estado.verificando = false;
}

function iniciarTemporizadorVigencia() {
  if (estado.timerVigencia) clearInterval(estado.timerVigencia);
  estado.tiempoVigenciaRestante = TIEMPO_EXPIRACION_SEGUNDOS;
  estado.codigoVencido = false;
  dom.cuentaAtrasVigencia.textContent = estado.tiempoVigenciaRestante.toString();

  estado.timerVigencia = setInterval(() => {
    estado.tiempoVigenciaRestante--;
    if (estado.tiempoVigenciaRestante <= 0) {
      clearInterval(estado.timerVigencia);
      estado.tiempoVigenciaRestante = 0;
      estado.codigoVencido = true;
    }
    dom.cuentaAtrasVigencia.textContent = estado.tiempoVigenciaRestante.toString();
  }, 1000);
}

function iniciarTemporizadorReenvio() {
  if (estado.timerReenvio) clearInterval(estado.timerReenvio);
  estado.tiempoReenvioRestante = TIEMPO_REENVIO_SEGUNDOS;
  dom.btnReenviarCodigo.disabled = true;
  dom.btnReenviarCodigo.innerHTML = `Reenviar código (<span id="cuentaAtrasReenvio">${estado.tiempoReenvioRestante}</span>s)`;

  estado.timerReenvio = setInterval(() => {
    estado.tiempoReenvioRestante--;
    if (estado.tiempoReenvioRestante <= 0) {
      clearInterval(estado.timerReenvio);
      dom.btnReenviarCodigo.disabled = false;
      dom.btnReenviarCodigo.innerHTML = 'Reenviar código';
    } else {
      dom.btnReenviarCodigo.disabled = true;
      dom.btnReenviarCodigo.innerHTML = `Reenviar código (<span id="cuentaAtrasReenvio">${estado.tiempoReenvioRestante}</span>s)`;
    }
  }, 1000);
}

function reenviarCodigoSimulado() {
  if (dom.btnReenviarCodigo.disabled) return;

  estado.codigoActual = generarNuevoCodigoDemo();
  actualizarVistaCodigoPrueba();
  limpiarCasillas();
  dom.alertaErrorCodigo.classList.add('oculto');
  estado.codigoVencido = false;

  iniciarTemporizadorVigencia();
  iniciarTemporizadorReenvio();

  mostrarToast('Nuevo código generado (simulación). El código anterior ha sido invalidado.', 'info');
  dom.casillas[0].focus();
}

function limpiarTemporizadores() {
  if (estado.timerVigencia) {
    clearInterval(estado.timerVigencia);
    estado.timerVigencia = null;
  }
  if (estado.timerReenvio) {
    clearInterval(estado.timerReenvio);
    estado.timerReenvio = null;
  }
}

function mostrarErrorCodigo(mensaje) {
  dom.textoErrorCodigo.textContent = mensaje;
  dom.alertaErrorCodigo.classList.remove('oculto');
  dom.casillas.forEach(c => c.classList.add('casilla-error'));
}

function verificarCodigo() {
  if (estado.verificando) return;

  dom.alertaErrorCodigo.classList.add('oculto');
  dom.casillas.forEach(c => c.classList.remove('casilla-error'));

  const codigoIngresado = dom.casillas.map(c => c.value.trim()).join('');

  if (codigoIngresado.length < 6) {
    mostrarErrorCodigo('Por favor completa los 6 dígitos del código de verificación.');
    const primerVacio = dom.casillas.find(c => !c.value.trim()) || dom.casillas[0];
    primerVacio.focus();
    return;
  }

  if (estado.codigoVencido || estado.tiempoVigenciaRestante <= 0) {
    mostrarErrorCodigo('El código de verificación ha expirado. Por favor solicita un nuevo código o reenvíalo.');
    return;
  }

  if (codigoIngresado !== estado.codigoActual) {
    mostrarErrorCodigo('El código ingresado no es válido. Verifica el código e intenta nuevamente.');
    dom.casillas[dom.casillas.length - 1].focus();
    return;
  }

  estado.verificando = true;
  finalizarAutenticacionExitosa();
}

function finalizarAutenticacionExitosa() {
  limpiarTemporizadores();

  const ahora = obtenerAhora();

  // Si la cuenta es asesor, guardar recordatorio diario en localStorage
  if (estado.cuentaSeleccionada && estado.cuentaSeleccionada.rol === 'asesor') {
    guardarRecordatorioAsesor(estado.cuentaSeleccionada.email);
  }

  const sesionDemo = {
    email: estado.cuentaSeleccionada.email,
    nombre: estado.cuentaSeleccionada.nombre,
    rol: estado.cuentaSeleccionada.rol,
    rolEtiqueta: estado.cuentaSeleccionada.rolEtiqueta,
    metodoVerificacion: 'email',
    verificacionReutilizada: false,
    autenticado: true,
    timestamp: ahora.toISOString()
  };

  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sesionDemo));
  } catch (e) {
    console.warn('Error guardando sesión en sessionStorage:', e);
  }

  dom.btnVerificarCodigo.disabled = true;
  dom.btnVerificarCodigo.innerHTML = '<span>Verificando...</span>';

  setTimeout(() => {
    window.location.href = estado.cuentaSeleccionada.destino;
  }, 300);
}

// ----------------------------------------------------------------------------
// 9. Lógica de Modales y Acceso Social
// ----------------------------------------------------------------------------
function vincularEventosModales() {
  // Botón Google: Autenticación REAL mediante Firebase Authentication
  dom.btnSocialGoogle.addEventListener('click', () => {
    iniciarAccesoGoogleReal();
  });

  // Botón Facebook: Recorrido local simulado (sin conexión a Firebase)
  dom.btnSocialFacebook.addEventListener('click', () => {
    abrirModalSocialFacebook(dom.btnSocialFacebook);
  });

  dom.btnCerrarModalSocial.addEventListener('click', cerrarModalSocialFacebook);
  dom.btnCancelarSocial.addEventListener('click', cerrarModalSocialFacebook);

  dom.btnContinuarSocial.addEventListener('click', () => {
    confirmarAccesoSocialFacebook();
  });

  if (dom.itemSocialCliente) {
    dom.itemSocialCliente.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmarAccesoSocialFacebook();
      }
    });
  }

  dom.btnCerrarModalRecuperacion.addEventListener('click', cerrarModalRecuperacion);
  dom.btnEntendidoRecuperacion.addEventListener('click', cerrarModalRecuperacion);

  dom.btnCerrarModalSoporte.addEventListener('click', cerrarModalSoporte);
  dom.btnEntendidoSoporte.addEventListener('click', cerrarModalSoporte);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!dom.modalSocial.classList.contains('oculto')) {
        cerrarModalSocialFacebook();
      } else if (!dom.modalRecuperacion.classList.contains('oculto')) {
        cerrarModalRecuperacion();
      } else if (!dom.modalSoporte.classList.contains('oculto')) {
        cerrarModalSoporte();
      }
    }
  });
}

/**
 * Inicia el flujo real de autenticación con Google mediante signInWithPopup
 * de Firebase Authentication (SDK modular v10).
 */
async function iniciarAccesoGoogleReal() {
  if (estado.verificando) return;
  estado.verificando = true;

  const htmlOriginalGoogle = dom.btnSocialGoogle.innerHTML;
  dom.btnSocialGoogle.disabled = true;
  dom.btnSocialFacebook.disabled = true;
  dom.btnIngresar.disabled = true;
  dom.btnSocialGoogle.innerHTML = `<span class="spinner-sm" aria-hidden="true"></span><span>Conectando con Google...</span>`;
  dom.alertaErrorCredenciales.classList.add('oculto');

  // Limpiar cualquier sesión previa en sessionStorage para evitar reutilización
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch (e) {}

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
      // Acceso exitoso con Google: redirigir directamente al portal del cliente
      // No pasa por verificación por correo, no genera códigos ni activa temporizadores
      window.location.href = 'cliente.html';
      return;
    }
  } catch (error) {
    // Restaurar estado de controles
    dom.btnSocialGoogle.disabled = false;
    dom.btnSocialFacebook.disabled = false;
    dom.btnIngresar.disabled = false;
    dom.btnSocialGoogle.innerHTML = htmlOriginalGoogle;
    estado.verificando = false;

    // Si el usuario cerró la ventana emergente de Google, permanecer silenciosamente en inicio.html
    if (error && error.code === 'auth/popup-closed-by-user') {
      return;
    }

    // Mapeo comprensible de errores sin exponer tokens ni datos sensibles
    let mensajeError = 'No fue posible iniciar sesión con Google. Por favor intenta nuevamente.';
    if (error && error.code) {
      switch (error.code) {
        case 'auth/popup-blocked':
          mensajeError = 'La ventana emergente de Google fue bloqueada por el navegador. Habilita las ventanas emergentes para este sitio e intenta de nuevo.';
          break;
        case 'auth/unauthorized-domain':
          mensajeError = 'Dominio no autorizado en Firebase Authentication. El dominio debe autorizarse en Firebase Console (localhost o cristhoferasm.github.io).';
          break;
        case 'auth/operation-not-allowed':
          mensajeError = 'El proveedor de inicio de sesión con Google no está habilitado en Firebase Authentication.';
          break;
        case 'auth/network-request-failed':
          mensajeError = 'Error de conexión con los servidores de autenticación. Verifica tu conexión a internet.';
          break;
        case 'auth/account-exists-with-different-credential':
          mensajeError = 'Ya existe una cuenta vinculada a este correo con otro método de acceso.';
          break;
        case 'auth/cancelled-popup-request':
          return;
        default:
          console.warn('Error en autenticación con Google:', error.code);
          break;
      }
    }

    dom.textoErrorCredenciales.textContent = mensajeError;
    dom.alertaErrorCredenciales.classList.remove('oculto');
  }
}

/**
 * Abre el diálogo de simulación local para Facebook (exclusivo para el cliente ficticio).
 */
function abrirModalSocialFacebook(botonOrigen) {
  estado.proveedorSocial = 'Facebook';
  estado.ultimoBotonSocialFoco = botonOrigen || null;
  estado.verificando = false;

  dom.tituloModalSocial.textContent = 'Continuar con Facebook';
  dom.btnContinuarSocial.disabled = false;
  dom.btnContinuarSocial.innerHTML = '<span>Continuar</span>';

  dom.modalSocial.classList.remove('oculto');
  setTimeout(() => {
    dom.btnContinuarSocial.focus();
  }, 50);
}

function cerrarModalSocialFacebook() {
  dom.modalSocial.classList.add('oculto');
  estado.proveedorSocial = null;
  estado.verificando = false;

  if (estado.ultimoBotonSocialFoco && typeof estado.ultimoBotonSocialFoco.focus === 'function') {
    estado.ultimoBotonSocialFoco.focus();
    estado.ultimoBotonSocialFoco = null;
  }
}

function confirmarAccesoSocialFacebook() {
  if (estado.verificando) return;
  estado.verificando = true;

  dom.btnContinuarSocial.disabled = true;
  dom.btnContinuarSocial.innerHTML = '<span>Ingresando...</span>';

  limpiarTemporizadores();

  const sesionClienteSocial = {
    email: CUENTAS_DEMO.cliente.email,
    nombre: CUENTAS_DEMO.cliente.nombre,
    rol: CUENTAS_DEMO.cliente.rol,
    rolEtiqueta: CUENTAS_DEMO.cliente.rolEtiqueta,
    proveedorAcceso: 'Facebook',
    metodoVerificacion: 'social',
    autenticado: true,
    timestamp: new Date().toISOString()
  };

  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sesionClienteSocial));
  } catch (e) {
    console.warn('Error guardando sesión de cliente social en sessionStorage:', e);
  }

  setTimeout(() => {
    window.location.href = CUENTAS_DEMO.cliente.destino;
  }, 200);
}

function abrirModalRecuperacion() {
  dom.modalRecuperacion.classList.remove('oculto');
}

function cerrarModalRecuperacion() {
  dom.modalRecuperacion.classList.add('oculto');
}

function abrirModalSoporte() {
  dom.modalSoporte.classList.remove('oculto');
}

function cerrarModalSoporte() {
  dom.modalSoporte.classList.add('oculto');
}

// ----------------------------------------------------------------------------
// 10. Toasts de Notificación Simulación
// ----------------------------------------------------------------------------
function mostrarToast(mensaje, tipo = 'info') {
  const toastExistente = document.querySelector('.toast-simulacion');
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement('div');
  toast.className = `toast-simulacion toast-${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Exponer helpers para pruebas controlables y diagnóstico
if (typeof window !== 'undefined') {
  window.__SHOWTECH_AUTH__ = {
    obtenerAhora,
    setRelojControlable: (fecha) => {
      window.__SHOWTECH_RELOJ_CONTROLABLE__ = fecha ? new Date(fecha) : null;
    },
    obtenerFechaCalendarioLima,
    obtenerRecordatorioValido,
    guardarRecordatorioAsesor,
    iniciarSesionConRecordatorio,
    RECORDATORIO_ASESOR_KEY,
    DEMO_SESSION_KEY,
    CUENTAS_DEMO,
    estado
  };
}

// Inicializar al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
