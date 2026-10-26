/**
 * ============================================================================
 * SHOWTECH SOLUTIONS - CONTROLADOR DE AUTENTICACIÓN DEL PORTAL DEL CLIENTE
 * Archivo: cliente-auth.js
 * Propósito: Resolver el estado de autenticación de Firebase (Google) o sesión
 *            local de demostración (Facebook / Contraseña) y gestionar signOut.
 * ============================================================================
 */

import { auth, onAuthStateChanged, signOut } from './firebase-init.js';

const usuarioEl = document.getElementById('headerUsuarioTexto') || document.querySelector('.usuario');
const badgeEl = document.getElementById('headerBadgeCliente') || document.querySelector('.badge-cliente-header');
const btnCerrar = document.getElementById('btnCerrarSesion');
const mainEl = document.getElementById('mainPortalCliente') || document.querySelector('main');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escuchar cambios de estado en Firebase Authentication (fuente de verdad de Google)
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    // ------------------------------------------------------------------------
    // 1. Acceso con Cuenta Real de Google
    // ------------------------------------------------------------------------
    // Limpiar cualquier sesión ficticia en sessionStorage para no reutilizarla
    try {
      sessionStorage.removeItem('showtech_demo_session');
    } catch (e) {}

    const nombre = firebaseUser.displayName || firebaseUser.email || 'Usuario Google';
    const email = firebaseUser.email || '';
    const foto = firebaseUser.photoURL;

    if (usuarioEl) {
      if (foto) {
        usuarioEl.innerHTML = `<img src="${foto}" class="avatar-google-header" alt="Foto de perfil" referrerpolicy="no-referrer"><span>${escapeHtml(nombre)}</span>`;
      } else {
        usuarioEl.textContent = 'Usuario: ' + nombre;
      }
      usuarioEl.title = 'Cuenta de Google: ' + email;
    }

    if (badgeEl) {
      badgeEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align: -1px; margin-right: 4px;">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Cuenta Google
      `;
      badgeEl.className = 'badge-cliente-header badge-google';
      badgeEl.style.display = 'inline-block';
    }

    // Configurar cliente.js en modo Google (sin cliente vinculado -> estado vacío)
    if (window.configurarIdentidadClientePortal) {
      window.configurarIdentidadClientePortal({
        tipo: 'google',
        user: {
          uid: firebaseUser.uid,
          nombre: nombre,
          email: email,
          foto: foto
        }
      });
    }

    if (mainEl) {
      mainEl.style.opacity = '1';
    }
  } else {
    // ------------------------------------------------------------------------
    // 2. Comprobación de Sesión de Demostración Local (Facebook / Contraseña)
    // ------------------------------------------------------------------------
    let sesionDemoValida = false;
    try {
      const sesionRaw = sessionStorage.getItem('showtech_demo_session');
      if (sesionRaw) {
        const sesion = JSON.parse(sesionRaw);
        if (sesion && sesion.autenticado && sesion.rol === 'cliente') {
          sesionDemoValida = true;

          if (usuarioEl) {
            usuarioEl.textContent = 'Usuario: ' + (sesion.nombre || 'Cliente');
            usuarioEl.title = 'Sesión activa: ' + (sesion.email || '');
          }

          if (badgeEl) {
            badgeEl.textContent = 'Promoción Horizonte 2026';
            badgeEl.className = 'badge-cliente-header';
            badgeEl.style.display = 'inline-block';
          }

          // Configurar cliente.js en modo mock (con eventos de CLI-001)
          if (window.configurarIdentidadClientePortal) {
            window.configurarIdentidadClientePortal({
              tipo: 'mock',
              user: sesion
            });
          }

          if (mainEl) {
            mainEl.style.opacity = '1';
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo sesión demo:', e);
    }

    if (!sesionDemoValida) {
      // ----------------------------------------------------------------------
      // 3. Ni Google ni Sesión Demo -> Redirigir a inicio.html
      // ----------------------------------------------------------------------
      window.location.href = 'inicio.html';
    }
  }
});

// Manejador del botón "Cerrar sesión"
if (btnCerrar) {
  btnCerrar.addEventListener('click', async function (e) {
    e.preventDefault();
    btnCerrar.disabled = true;

    try {
      // Ejecutar signOut explícito de Firebase Authentication
      await signOut(auth);
    } catch (err) {
      console.warn('Error ejecutando signOut en Firebase:', err);
    }

    try {
      sessionStorage.removeItem('showtech_demo_session');
    } catch (e) {}

    // Redirigir al inicio sin restaurar sesión
    window.location.href = 'inicio.html';
  });
}
