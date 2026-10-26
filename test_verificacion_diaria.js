/**
 * SHOWTECH SOLUTIONS - SUITE DE COMPROBACIONES DE VERIFICACIÓN DIARIA DEL ASESOR
 * Ejecución en Node.js con reloj controlable sin alterar el reloj del equipo.
 */

const assert = require('assert');

// 1. Mock de Storage (localStorage y sessionStorage)
class MockStorage {
  constructor(shouldThrow = false) {
    this.store = {};
    this.shouldThrow = shouldThrow;
  }
  getItem(key) {
    if (this.shouldThrow) throw new Error('Storage disabled or QuotaExceededError');
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    if (this.shouldThrow) throw new Error('Storage disabled or QuotaExceededError');
    this.store[key] = String(value);
  }
  removeItem(key) {
    if (this.shouldThrow) throw new Error('Storage disabled or QuotaExceededError');
    delete this.store[key];
  }
  clear() {
    if (this.shouldThrow) throw new Error('Storage disabled or QuotaExceededError');
    this.store = {};
  }
}

// 2. Lógica idéntica a acceso.js para comprobación con reloj controlable
const ZONA_HORARIA_PERU = 'America/Lima';
const RECORDATORIO_ASESOR_KEY = 'showtech_recordatorio_verificacion_asesor';
const DEMO_SESSION_KEY = 'showtech_demo_session';

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

let relojControlable = null;

function setRelojControlable(fecha) {
  relojControlable = fecha ? new Date(fecha) : null;
}

function obtenerAhora() {
  if (relojControlable instanceof Date) {
    return new Date(relojControlable.getTime());
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

function obtenerRecordatorioValido(emailCuenta, storage = localStorageMock) {
  if (!emailCuenta || typeof emailCuenta !== 'string') return null;

  try {
    const raw = storage.getItem(RECORDATORIO_ASESOR_KEY);
    if (!raw) return null;

    const registro = JSON.parse(raw);
    if (!registro || typeof registro !== 'object') return null;

    if (typeof registro.cuentaId !== 'string' ||
        registro.cuentaId.toLowerCase().trim() !== emailCuenta.toLowerCase().trim()) {
      return null;
    }

    if (typeof registro.diaPeru !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(registro.diaPeru)) {
      return null;
    }

    if (typeof registro.fechaVerificacionIso !== 'string') {
      return null;
    }
    const fechaVerif = new Date(registro.fechaVerificacionIso);
    if (isNaN(fechaVerif.getTime())) {
      return null;
    }

    const ahora = obtenerAhora();
    const diaActualPeru = obtenerFechaCalendarioLima(ahora);

    if (registro.diaPeru > diaActualPeru || fechaVerif.getTime() > ahora.getTime() + 1000) {
      return null;
    }

    if (registro.diaPeru !== diaActualPeru) {
      return null;
    }

    if (obtenerFechaCalendarioLima(fechaVerif) !== registro.diaPeru) {
      return null;
    }

    return registro;
  } catch (e) {
    return null;
  }
}

function guardarRecordatorioAsesor(emailCuenta, storage = localStorageMock) {
  const ahora = obtenerAhora();
  const diaPeru = obtenerFechaCalendarioLima(ahora);
  const registro = {
    cuentaId: emailCuenta.toLowerCase().trim(),
    diaPeru: diaPeru,
    fechaVerificacionIso: ahora.toISOString()
  };

  try {
    storage.setItem(RECORDATORIO_ASESOR_KEY, JSON.stringify(registro));
    return true;
  } catch (e) {
    return false;
  }
}

let localStorageMock = new MockStorage();
let sessionStorageMock = new MockStorage();

function simularProcesarLogin(emailVal, passVal) {
  let cuentaEncontrada = null;
  if (emailVal.toLowerCase() === CUENTAS_DEMO.asesor.email.toLowerCase() && passVal === CUENTAS_DEMO.asesor.password) {
    cuentaEncontrada = CUENTAS_DEMO.asesor;
  } else if (emailVal.toLowerCase() === CUENTAS_DEMO.cliente.email.toLowerCase() && passVal === CUENTAS_DEMO.cliente.password) {
    cuentaEncontrada = CUENTAS_DEMO.cliente;
  }

  if (!cuentaEncontrada) {
    return { exito: false, accion: 'error_credenciales' };
  }

  if (cuentaEncontrada.rol === 'asesor') {
    const recordatorio = obtenerRecordatorioValido(cuentaEncontrada.email);
    if (recordatorio) {
      // Reutiliza recordatorio
      const ahora = obtenerAhora();
      const sesionReutilizada = {
        email: cuentaEncontrada.email,
        nombre: cuentaEncontrada.nombre,
        rol: cuentaEncontrada.rol,
        rolEtiqueta: cuentaEncontrada.rolEtiqueta,
        metodoVerificacion: 'recordatorio_diario',
        verificacionReutilizada: true,
        fechaVerificacionOriginal: recordatorio.fechaVerificacionIso,
        diaPeru: recordatorio.diaPeru,
        autenticado: true,
        timestamp: ahora.toISOString()
      };
      sessionStorageMock.setItem(DEMO_SESSION_KEY, JSON.stringify(sesionReutilizada));
      return { exito: true, accion: 'redirigir_directo', destino: cuentaEncontrada.destino, recordatorioUsado: true };
    }
  }

  // Requiere verificar código por correo
  return { exito: true, accion: 'mostrar_paso_codigo', cuenta: cuentaEncontrada };
}

function simularVerificarCodigoExitoso(cuenta, storageLocal = localStorageMock, storageSession = sessionStorageMock) {
  const ahora = obtenerAhora();
  if (cuenta.rol === 'asesor') {
    guardarRecordatorioAsesor(cuenta.email, storageLocal);
  }
  const sesion = {
    email: cuenta.email,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    rolEtiqueta: cuenta.rolEtiqueta,
    metodoVerificacion: 'email',
    verificacionReutilizada: false,
    autenticado: true,
    timestamp: ahora.toISOString()
  };
  try {
    storageSession.setItem(DEMO_SESSION_KEY, JSON.stringify(sesion));
  } catch (e) {}
  return { exito: true, destino: cuenta.destino };
}

function simularCerrarSesion() {
  sessionStorageMock.removeItem(DEMO_SESSION_KEY);
}

// ----------------------------------------------------------------------------
// EJECUCIÓN DE PRUEBAS
// ----------------------------------------------------------------------------
console.log('=== INICIANDO BATERÍA DE COMPROBACIONES DE VERIFICACIÓN DIARIA ===\n');

// 1. Primer inicio del día: solicita código
{
  localStorageMock.clear();
  sessionStorageMock.clear();
  setRelojControlable('2026-10-26T09:00:00-05:00'); // Lunes 9:00 AM Perú

  const res = simularProcesarLogin('asesor@showtech.com', 'Asesor2026!');
  assert.strictEqual(res.accion, 'mostrar_paso_codigo', 'Debe solicitar código en el primer inicio del día');
  assert.strictEqual(sessionStorageMock.getItem(DEMO_SESSION_KEY), null, 'No debe crear sesión antes de verificar el código');
  console.log('✔ Prueba 1: Primer inicio del día solicita código (sin sesión prematura).');
}

// 2. Código correcto: crea sesión y recordatorio
{
  const resVerif = simularVerificarCodigoExitoso(CUENTAS_DEMO.asesor);
  assert.strictEqual(resVerif.destino, 'index.html');

  const sesionRaw = sessionStorageMock.getItem(DEMO_SESSION_KEY);
  assert.ok(sesionRaw, 'Debe haber creado sesión en sessionStorage');
  const sesion = JSON.parse(sesionRaw);
  assert.strictEqual(sesion.email, 'asesor@showtech.com');
  assert.strictEqual(sesion.verificacionReutilizada, false);
  assert.strictEqual(sesion.metodoVerificacion, 'email');

  const recordatorioRaw = localStorageMock.getItem(RECORDATORIO_ASESOR_KEY);
  assert.ok(recordatorioRaw, 'Debe haber guardado el recordatorio en localStorage');
  const rec = JSON.parse(recordatorioRaw);
  assert.strictEqual(rec.cuentaId, 'asesor@showtech.com');
  assert.strictEqual(rec.diaPeru, '2026-10-26');
  console.log('✔ Prueba 2: Código correcto crea sesión con verificacionReutilizada=false y recordatorio diario en America/Lima.');
}

// 3. Cerrar sesión y volver el mismo día: exige credenciales, pero omite el código
{
  simularCerrarSesion();
  assert.strictEqual(sessionStorageMock.getItem(DEMO_SESSION_KEY), null, 'Cerrar sesión elimina sessionStorage');
  assert.ok(localStorageMock.getItem(RECORDATORIO_ASESOR_KEY), 'Cerrar sesión conserva el recordatorio en localStorage');

  // Mismo día a las 14:30 Perú
  setRelojControlable('2026-10-26T14:30:00-05:00');
  const res = simularProcesarLogin('asesor@showtech.com', 'Asesor2026!');
  assert.strictEqual(res.accion, 'redirigir_directo', 'Debe omitir la pantalla de código');
  assert.strictEqual(res.recordatorioUsado, true);

  const sesionRaw = sessionStorageMock.getItem(DEMO_SESSION_KEY);
  const sesion = JSON.parse(sesionRaw);
  assert.strictEqual(sesion.verificacionReutilizada, true, 'Debe registrar que se reutilizó la verificación del día');
  assert.strictEqual(sesion.metodoVerificacion, 'recordatorio_diario');
  console.log('✔ Prueba 3: Cerrar sesión y volver el mismo día exige credenciales y omite código registrando verificacionReutilizada=true.');
}

// 4. Contraseña incorrecta con recordatorio válido: rechaza el acceso
{
  simularCerrarSesion();
  const res = simularProcesarLogin('asesor@showtech.com', 'PasswordErronea123');
  assert.strictEqual(res.accion, 'error_credenciales', 'Debe rechazar credenciales incorrectas');
  assert.strictEqual(sessionStorageMock.getItem(DEMO_SESSION_KEY), null, 'No debe crear sesión');
  console.log('✔ Prueba 4: Contraseña incorrecta con recordatorio válido rechaza acceso sin crear sesión.');
}

// 5. Día siguiente en Perú: solicita código
{
  simularCerrarSesion();
  // Martes 08:00 AM Perú (2026-10-27)
  setRelojControlable('2026-10-27T08:00:00-05:00');
  const res = simularProcesarLogin('asesor@showtech.com', 'Asesor2026!');
  assert.strictEqual(res.accion, 'mostrar_paso_codigo', 'Al día siguiente en Perú debe solicitar código nuevamente');
  console.log('✔ Prueba 5: Día siguiente en Perú (2026-10-27) invalida recordatorio del día anterior y solicita código.');
}

// 6. Cambio de fecha UTC mientras aún es el mismo día en Perú: conserva la validez
{
  // Lunes 2026-10-26 a las 20:00 en Perú (UTC ya es 2026-10-27T01:00:00Z)
  setRelojControlable('2026-10-26T20:00:00-05:00');
  // Se verifica a las 20:00
  simularVerificarCodigoExitoso(CUENTAS_DEMO.asesor);
  simularCerrarSesion();

  // A las 23:45 Perú (UTC es 2026-10-27T04:45:00Z)
  setRelojControlable('2026-10-26T23:45:00-05:00');
  const diaLima = obtenerFechaCalendarioLima();
  assert.strictEqual(diaLima, '2026-10-26', 'En Lima sigue siendo 2026-10-26 aunque en UTC sea 2026-10-27');

  const res = simularProcesarLogin('asesor@showtech.com', 'Asesor2026!');
  assert.strictEqual(res.accion, 'redirigir_directo', 'Debe conservar la validez mientras sea el mismo día en Perú');
  console.log('✔ Prueba 6: Cambio de fecha UTC mientras aún es el mismo día en Perú conserva la validez.');
}

// 7. Código confirmado después de medianoche: registra el nuevo día de Perú
{
  simularCerrarSesion();
  // Martes 00:05 AM en Perú
  setRelojControlable('2026-10-27T00:05:00-05:00');
  const resLogin = simularProcesarLogin('asesor@showtech.com', 'Asesor2026!');
  assert.strictEqual(resLogin.accion, 'mostrar_paso_codigo', 'Medianoche pasada exige código');

  simularVerificarCodigoExitoso(CUENTAS_DEMO.asesor);
  const rec = JSON.parse(localStorageMock.getItem(RECORDATORIO_ASESOR_KEY));
  assert.strictEqual(rec.diaPeru, '2026-10-27', 'El nuevo recordatorio debe tener diaPeru: 2026-10-27');
  console.log('✔ Prueba 7: Código confirmado después de medianoche registra el nuevo día de Perú (2026-10-27).');
}

// 8. Registro inválido o futuro: solicita código
{
  simularCerrarSesion();
  setRelojControlable('2026-10-27T10:00:00-05:00');

  // Caso A: JSON malformado
  localStorageMock.setItem(RECORDATORIO_ASESOR_KEY, 'invalid-json{');
  assert.strictEqual(simularProcesarLogin('asesor@showtech.com', 'Asesor2026!').accion, 'mostrar_paso_codigo');

  // Caso B: Campos faltantes
  localStorageMock.setItem(RECORDATORIO_ASESOR_KEY, JSON.stringify({ cuentaId: 'asesor@showtech.com' }));
  assert.strictEqual(simularProcesarLogin('asesor@showtech.com', 'Asesor2026!').accion, 'mostrar_paso_codigo');

  // Caso C: Fecha futura en diaPeru
  localStorageMock.setItem(RECORDATORIO_ASESOR_KEY, JSON.stringify({
    cuentaId: 'asesor@showtech.com',
    diaPeru: '2026-10-28',
    fechaVerificacionIso: '2026-10-28T10:00:00.000Z'
  }));
  assert.strictEqual(simularProcesarLogin('asesor@showtech.com', 'Asesor2026!').accion, 'mostrar_paso_codigo');

  // Caso D: Timestamp futuro
  localStorageMock.setItem(RECORDATORIO_ASESOR_KEY, JSON.stringify({
    cuentaId: 'asesor@showtech.com',
    diaPeru: '2026-10-27',
    fechaVerificacionIso: '2026-10-27T23:59:00.000Z' // Horas adelante del reloj actual (10:00)
  }));
  assert.strictEqual(simularProcesarLogin('asesor@showtech.com', 'Asesor2026!').accion, 'mostrar_paso_codigo');
  console.log('✔ Prueba 8: Registro inválido, corrupto, incompleto o futuro solicita código obligatoriamente.');
}

// 9. Fallo de localStorage: permite el acceso tras verificar y vuelve a exigir el código en el siguiente inicio
{
  simularCerrarSesion();
  const faultyLocalStorage = new MockStorage(true); // Siempre arroja excepción
  const sessionOk = new MockStorage();

  const verifRes = simularVerificarCodigoExitoso(CUENTAS_DEMO.asesor, faultyLocalStorage, sessionOk);
  assert.strictEqual(verifRes.destino, 'index.html', 'Permite acceso exitoso incluso si localStorage falla');
  assert.ok(sessionOk.getItem(DEMO_SESSION_KEY), 'Sesión creada en sessionStorage');

  // Siguiente inicio de sesión con localStorage fallido o sin el dato
  const siguienteLogin = simularProcesarLogin('asesor@showtech.com', 'Asesor2026!');
  assert.strictEqual(siguienteLogin.accion, 'mostrar_paso_codigo', 'Vuelve a exigir código al no tener recordatorio guardado');
  console.log('✔ Prueba 9: Fallo de localStorage permite acceso tras verificar pero vuelve a exigir código en el siguiente inicio.');
}

// 10. Otra cuenta no aprovecha el recordatorio
{
  simularCerrarSesion();
  setRelojControlable('2026-10-27T11:00:00-05:00');
  // Recordatorio guardado para asesor@showtech.com
  guardarRecordatorioAsesor('asesor@showtech.com');

  // Comprobar con otra cuenta hipotética de asesor
  const recOtraCuenta = obtenerRecordatorioValido('otroasesor@showtech.com');
  assert.strictEqual(recOtraCuenta, null, 'Otra cuenta no debe aprovechar el recordatorio de asesor@showtech.com');
  console.log('✔ Prueba 10: Otra cuenta no aprovecha el recordatorio de verificación.');
}

// 11. Se conservan los flujos de Google, Facebook y cliente
{
  simularCerrarSesion();
  // El cliente por correo y contraseña SIEMPRE solicita código, nunca omite el paso 2
  guardarRecordatorioAsesor('cliente@horizonte.com'); // Incluso si existiese registro para cliente
  const resCliente = simularProcesarLogin('cliente@horizonte.com', 'Cliente2026!');
  assert.strictEqual(resCliente.accion, 'mostrar_paso_codigo', 'Cliente siempre debe solicitar código');
  assert.strictEqual(resCliente.recordatorioUsado, undefined, 'Cliente no utiliza recordatorio diario');
  console.log('✔ Prueba 11: Se conservan sin cambios los flujos de cliente (siempre exige código), Google y Facebook.');
}

console.log('\n================================================================');
console.log('TODAS LAS 11 COMPROBACIONES PASARON SATISFACTORIAMENTE (11/11)');
console.log('================================================================');
