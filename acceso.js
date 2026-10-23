/**
 * ============================================================================
 * SHOWTECH SOLUTIONS - PROTOTIPO DE ACCESO Y VERIFICACIÓN EN DOS PASOS
 * Archivo: acceso.js
 * Propósito: Lógica de interacción para inicio de sesión simulado y 2FA
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Constantes y Cuentas Ficticias de Demostración
  // --------------------------------------------------------------------------
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

  const CODIGO_PRUEBA_VALIDO = '123456';
  const DEMO_SESSION_KEY = 'showtech_demo_session';
  const TIEMPO_EXPIRACION_SEGUNDOS = 60;
  const TIEMPO_REENVIO_SEGUNDOS = 30;

  // --------------------------------------------------------------------------
  // 2. Estado del Prototipo de Acceso
  // --------------------------------------------------------------------------
  const estado = {
    pasoActual: 1, // 1: Login, 2: Selección 2FA, 3: Código 2FA
    cuentaSeleccionada: null,
    metodo2FA: 'app', // 'app' o 'email'
    codigoVencido: false,
    tiempoVigenciaRestante: TIEMPO_EXPIRACION_SEGUNDOS,
    timerVigencia: null,
    tiempoReenvioRestante: TIEMPO_REENVIO_SEGUNDOS,
    timerReenvio: null,
    cuentaSocialTemporal: null // Para selección en modal social
  };

  // --------------------------------------------------------------------------
  // 3. Referencias DOM
  // --------------------------------------------------------------------------
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

    // Pantalla 2: Método 2FA
    pantallaMetodo: document.getElementById('pantallaMetodo'),
    lblCuentaEmail: document.getElementById('lblCuentaEmail'),
    lblCuentaRol: document.getElementById('lblCuentaRol'),
    opcionMetodoApp: document.getElementById('opcionMetodoApp'),
    opcionMetodoEmail: document.getElementById('opcionMetodoEmail'),
    btnContinuarMetodo: document.getElementById('btnContinuarMetodo'),
    linkVolverLogin: document.getElementById('linkVolverLogin'),

    // Pantalla 3: Código 2FA
    pantallaCodigo: document.getElementById('pantallaCodigo'),
    instruccionMetodoTexto: document.getElementById('instruccionMetodoTexto'),
    valorCodigoPrueba: document.getElementById('valorCodigoPrueba'),
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
    linkUsarOtroMetodo: document.getElementById('linkUsarOtroMetodo'),
    linkSoporte: document.getElementById('linkSoporte'),

    // Pie exterior
    piePaginaIzq: document.getElementById('piePaginaIzq'),
    piePaginaDer: document.getElementById('piePaginaDer'),

    // Modales
    modalSocial: document.getElementById('modalSocial'),
    tituloModalSocial: document.getElementById('tituloModalSocial'),
    avisoModalSocial: document.getElementById('avisoModalSocial'),
    btnCerrarModalSocial: document.getElementById('btnCerrarModalSocial'),
    btnCancelarSocial: document.getElementById('btnCancelarSocial'),
    btnContinuarSocial: document.getElementById('btnContinuarSocial'),
    itemSocialAsesor: document.getElementById('itemSocialAsesor'),
    itemSocialCliente: document.getElementById('itemSocialCliente'),

    modalRecuperacion: document.getElementById('modalRecuperacion'),
    btnCerrarModalRecuperacion: document.getElementById('btnCerrarModalRecuperacion'),
    btnEntendidoRecuperacion: document.getElementById('btnEntendidoRecuperacion'),

    modalSoporte: document.getElementById('modalSoporte'),
    btnCerrarModalSoporte: document.getElementById('btnCerrarModalSoporte'),
    btnEntendidoSoporte: document.getElementById('btnEntendidoSoporte')
  };

  // --------------------------------------------------------------------------
  // 4. Inicialización
  // --------------------------------------------------------------------------
  function init() {
    vincularEventosLogin();
    vincularEventosMetodo();
    vincularEventosCodigo();
    vincularEventosModales();
    mostrarPaso(1);
  }

  // --------------------------------------------------------------------------
  // 5. Gestión y Cambio de Pantallas / Pasos
  // --------------------------------------------------------------------------
  function mostrarPaso(numPaso) {
    limpiarTemporizadores();
    estado.pasoActual = numPaso;

    // Ocultar todas las pantallas
    dom.pantallaLogin.classList.add('oculto');
    dom.pantallaMetodo.classList.add('oculto');
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
      setTimeout(() => dom.inputEmail.focus(), 50);
    } 
    else if (numPaso === 2) {
      dom.pantallaMetodo.classList.remove('oculto');
      dom.indicadorPasoSuperior.classList.remove('oculto');
      dom.textoIndicadorPaso.textContent = '02 · Método de verificación';
      dom.headerTextoDerecha.classList.add('oculto');
      dom.headerAvatarBtn.classList.remove('oculto');
      dom.piePaginaIzq.textContent = 'Propuesta visual · Verificación en dos pasos';
      dom.piePaginaDer.textContent = 'SHOWTECH SOLUTIONS';
      document.title = 'Método de verificación - Showtech Solutions';

      // Actualizar datos de cuenta activa
      if (estado.cuentaSeleccionada) {
        dom.lblCuentaEmail.textContent = estado.cuentaSeleccionada.email;
        dom.lblCuentaRol.textContent = estado.cuentaSeleccionada.rolEtiqueta;
      }
      actualizarSeleccionMetodoUI();
    } 
    else if (numPaso === 3) {
      dom.pantallaCodigo.classList.remove('oculto');
      dom.indicadorPasoSuperior.classList.remove('oculto');
      dom.textoIndicadorPaso.textContent = '03 · Confirmar acceso';
      dom.headerTextoDerecha.classList.add('oculto');
      dom.headerAvatarBtn.classList.remove('oculto');
      dom.piePaginaIzq.textContent = 'Propuesta visual · Verificación en dos pasos';
      dom.piePaginaDer.textContent = 'SHOWTECH SOLUTIONS';
      document.title = 'Confirmar acceso - Showtech Solutions';

      prepararPasoCodigo();
    }
  }

  // --------------------------------------------------------------------------
  // 6. Lógica de Pantalla 1: Inicio de Sesión
  // --------------------------------------------------------------------------
  function vincularEventosLogin() {
    // Submit del formulario
    dom.formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarLogin();
    });

    // Función modular para alternar visibilidad de contraseña
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

    // Toggle para mostrar/ocultar contraseña (botón type="button" dentro del campo)
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

    // Comprobación contra cuentas ficticias
    let cuentaEncontrada = null;
    if (emailVal.toLowerCase() === CUENTAS_DEMO.asesor.email.toLowerCase() && passVal === CUENTAS_DEMO.asesor.password) {
      cuentaEncontrada = CUENTAS_DEMO.asesor;
    } else if (emailVal.toLowerCase() === CUENTAS_DEMO.cliente.email.toLowerCase() && passVal === CUENTAS_DEMO.cliente.password) {
      cuentaEncontrada = CUENTAS_DEMO.cliente;
    }

    if (cuentaEncontrada) {
      estado.cuentaSeleccionada = cuentaEncontrada;
      estado.metodo2FA = 'app'; // Predeterminado
      mostrarPaso(2);
    } else {
      dom.textoErrorCredenciales.textContent = 'El correo electrónico o la contraseña ingresados no coinciden con las cuentas de demostración.';
      dom.alertaErrorCredenciales.classList.remove('oculto');
    }
  }

  // --------------------------------------------------------------------------
  // 7. Lógica de Pantalla 2: Selección de Método 2FA
  // --------------------------------------------------------------------------
  function vincularEventosMetodo() {
    dom.opcionMetodoApp.addEventListener('click', () => {
      estado.metodo2FA = 'app';
      actualizarSeleccionMetodoUI();
    });

    dom.opcionMetodoEmail.addEventListener('click', () => {
      estado.metodo2FA = 'email';
      actualizarSeleccionMetodoUI();
    });

    // Accesibilidad por teclado para opciones 2FA
    dom.opcionMetodoApp.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        estado.metodo2FA = 'app';
        actualizarSeleccionMetodoUI();
      }
    });

    dom.opcionMetodoEmail.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        estado.metodo2FA = 'email';
        actualizarSeleccionMetodoUI();
      }
    });

    // Botón continuar
    dom.btnContinuarMetodo.addEventListener('click', () => {
      mostrarPaso(3);
    });

    // Link volver a login
    dom.linkVolverLogin.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarPaso(1);
    });
  }

  function actualizarSeleccionMetodoUI() {
    if (estado.metodo2FA === 'app') {
      dom.opcionMetodoApp.classList.add('seleccionada');
      dom.opcionMetodoApp.setAttribute('aria-checked', 'true');
      dom.opcionMetodoEmail.classList.remove('seleccionada');
      dom.opcionMetodoEmail.setAttribute('aria-checked', 'false');
    } else {
      dom.opcionMetodoApp.classList.remove('seleccionada');
      dom.opcionMetodoApp.setAttribute('aria-checked', 'false');
      dom.opcionMetodoEmail.classList.add('seleccionada');
      dom.opcionMetodoEmail.setAttribute('aria-checked', 'true');
    }
  }

  // --------------------------------------------------------------------------
  // 8. Lógica de Pantalla 3: Ingreso y Validación de Código de 6 Dígitos
  // --------------------------------------------------------------------------
  function vincularEventosCodigo() {
    // Casillas de código: teclado, borrado, navegación y pegado
    dom.casillas.forEach((casilla, idx) => {
      // Input de dígito
      casilla.addEventListener('input', (e) => {
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

      // Teclas especiales: Backspace y flechas
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

      // Soporte para pegar código de 6 dígitos
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

    // Botón Autocompletar código de prueba
    dom.btnAutollenarCodigo.addEventListener('click', () => {
      const digitos = CODIGO_PRUEBA_VALIDO.split('');
      dom.casillas.forEach((c, i) => {
        c.value = digitos[i] || '';
        c.classList.remove('casilla-error');
      });
      dom.alertaErrorCodigo.classList.add('oculto');
      dom.casillas[dom.casillas.length - 1].focus();
    });

    // Botón Simular vencimiento de código
    dom.btnSimularVencido.addEventListener('click', () => {
      estado.codigoVencido = true;
      estado.tiempoVigenciaRestante = 0;
      dom.cuentaAtrasVigencia.textContent = '0';
      mostrarErrorCodigo('El código de verificación ha expirado. Por favor solicita un nuevo código o reenvíalo.');
    });

    // Botón Reenviar código (método correo)
    dom.btnReenviarCodigo.addEventListener('click', () => {
      if (dom.btnReenviarCodigo.disabled) return;
      reenviarCodigoSimulado();
    });

    // Botón Verificar e ingresar
    dom.btnVerificarCodigo.addEventListener('click', () => {
      verificarCodigo();
    });

    // Link Usar otro método (regresa a paso 2 e invalida desafío)
    dom.linkUsarOtroMetodo.addEventListener('click', (e) => {
      e.preventDefault();
      invalidarDesafioAnterior();
      mostrarPaso(2);
    });

    // Link soporte
    dom.linkSoporte.addEventListener('click', (e) => {
      e.preventDefault();
      abrirModalSoporte();
    });
  }

  function prepararPasoCodigo() {
    limpiarCasillas();
    dom.alertaErrorCodigo.classList.add('oculto');
    estado.codigoVencido = false;

    // Configuración textual según el método seleccionado
    if (estado.metodo2FA === 'app') {
      dom.instruccionMetodoTexto.innerHTML = 'Escribe el código de 6 dígitos de tu aplicación autenticadora.';
      dom.bloqueReenvioSimulado.classList.add('oculto');
    } else {
      const emailMask = (estado.cuentaSeleccionada && estado.cuentaSeleccionada.emailEnmascarado)
        ? estado.cuentaSeleccionada.emailEnmascarado
        : 'tu correo registrado';
      dom.instruccionMetodoTexto.innerHTML = `Escribe el código de 6 dígitos enviado a tu correo registrado.<span class="email-enmascarado-badge">${emailMask}</span>`;
      dom.bloqueReenvioSimulado.classList.remove('oculto');
      iniciarTemporizadorReenvio();
    }

    iniciarTemporizadorVigencia();
    setTimeout(() => dom.casillas[0].focus(), 50);
  }

  function limpiarCasillas() {
    dom.casillas.forEach(c => {
      c.value = '';
      c.classList.remove('casilla-error');
    });
  }

  function invalidarDesafioAnterior() {
    limpiarTemporizadores();
    limpiarCasillas();
    dom.alertaErrorCodigo.classList.add('oculto');
    estado.codigoVencido = false;
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
    dom.cuentaAtrasReenvio.textContent = estado.tiempoReenvioRestante.toString();

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
    invalidarDesafioAnterior();
    iniciarTemporizadorVigencia();
    iniciarTemporizadorReenvio();
    mostrarToast('Nuevo código de prueba generado (simulación). Código vigente: 123456', 'info');
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
    dom.alertaErrorCodigo.classList.add('oculto');
    dom.casillas.forEach(c => c.classList.remove('casilla-error'));

    const codigoIngresado = dom.casillas.map(c => c.value.trim()).join('');

    // Estado: Código incompleto
    if (codigoIngresado.length < 6) {
      mostrarErrorCodigo('Por favor completa los 6 dígitos del código de verificación.');
      const primerVacio = dom.casillas.find(c => !c.value.trim()) || dom.casillas[0];
      primerVacio.focus();
      return;
    }

    // Estado: Código vencido
    if (estado.codigoVencido || estado.tiempoVigenciaRestante <= 0) {
      mostrarErrorCodigo('El código de verificación ha expirado. Por favor solicita un nuevo código o reenvíalo.');
      return;
    }

    // Estado: Código incorrecto
    if (codigoIngresado !== CODIGO_PRUEBA_VALIDO) {
      mostrarErrorCodigo('El código ingresado no es válido. Verifica el código e intenta nuevamente.');
      dom.casillas[dom.casillas.length - 1].focus();
      return;
    }

    // Código Correcto: Establecer sesión en sessionStorage y redirigir
    finalizarAutenticacionExitosa();
  }

  function finalizarAutenticacionExitosa() {
    limpiarTemporizadores();

    // Guardar estado de demostración únicamente en sessionStorage
    const sesionDemo = {
      email: estado.cuentaSeleccionada.email,
      nombre: estado.cuentaSeleccionada.nombre,
      rol: estado.cuentaSeleccionada.rol,
      rolEtiqueta: estado.cuentaSeleccionada.rolEtiqueta,
      metodo2FA: estado.metodo2FA,
      autenticado: true,
      timestamp: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sesionDemo));
    } catch (e) {
      console.warn('Error guardando sesión de demostración en sessionStorage:', e);
    }

    // Feedback visual y navegación según el rol
    dom.btnVerificarCodigo.disabled = true;
    dom.btnVerificarCodigo.innerHTML = '<span>Verificando...</span>';

    setTimeout(() => {
      window.location.href = estado.cuentaSeleccionada.destino;
    }, 300);
  }

  // --------------------------------------------------------------------------
  // 9. Lógica de Modales (Social, Pendiente y Soporte)
  // --------------------------------------------------------------------------
  function vincularEventosModales() {
    // Modal Social (Google / Facebook)
    dom.btnSocialGoogle.addEventListener('click', () => {
      abrirModalSocial('Google');
    });

    dom.btnSocialFacebook.addEventListener('click', () => {
      abrirModalSocial('Facebook');
    });

    dom.btnCerrarModalSocial.addEventListener('click', cerrarModalSocial);
    dom.btnCancelarSocial.addEventListener('click', cerrarModalSocial);

    dom.itemSocialAsesor.addEventListener('click', () => {
      seleccionarCuentaModalSocial('asesor');
    });

    dom.itemSocialCliente.addEventListener('click', () => {
      seleccionarCuentaModalSocial('cliente');
    });

    dom.btnContinuarSocial.addEventListener('click', () => {
      cerrarModalSocial();
      const cuenta = (estado.cuentaSocialTemporal === 'cliente') 
        ? CUENTAS_DEMO.cliente 
        : CUENTAS_DEMO.asesor;
      estado.cuentaSeleccionada = cuenta;
      estado.metodo2FA = 'app';
      mostrarPaso(2);
    });

    // Modal Recuperación de Contraseña
    dom.btnCerrarModalRecuperacion.addEventListener('click', cerrarModalRecuperacion);
    dom.btnEntendidoRecuperacion.addEventListener('click', cerrarModalRecuperacion);

    // Modal Soporte
    dom.btnCerrarModalSoporte.addEventListener('click', cerrarModalSoporte);
    dom.btnEntendidoSoporte.addEventListener('click', cerrarModalSoporte);

    // Cerrar modales con tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cerrarModalSocial();
        cerrarModalRecuperacion();
        cerrarModalSoporte();
      }
    });
  }

  function abrirModalSocial(proveedor) {
    dom.tituloModalSocial.textContent = `Simulación de acceso con ${proveedor}`;
    dom.avisoModalSocial.textContent = `Esta es una simulación de acceso con ${proveedor}. No se solicitan contraseñas del proveedor. Selecciona una cuenta de prueba para continuar hacia la verificación en dos pasos o cancela para regresar.`;
    seleccionarCuentaModalSocial('asesor');
    dom.modalSocial.classList.remove('oculto');
  }

  function cerrarModalSocial() {
    dom.modalSocial.classList.add('oculto');
  }

  function seleccionarCuentaModalSocial(tipo) {
    estado.cuentaSocialTemporal = tipo;
    if (tipo === 'asesor') {
      dom.itemSocialAsesor.classList.add('seleccionado');
      dom.itemSocialCliente.classList.remove('seleccionado');
    } else {
      dom.itemSocialAsesor.classList.remove('seleccionado');
      dom.itemSocialCliente.classList.add('seleccionado');
    }
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

  // --------------------------------------------------------------------------
  // 10. Toasts de Notificación Simulación
  // --------------------------------------------------------------------------
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

  // Ejecutar inicialización al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
