/**
 * ============================================================================
 * SHOWTECH SOLUTIONS - CONFIGURACIÓN DE FIREBASE AUTHENTICATION
 * Archivo: firebase-init.js
 * Propósito: Inicializar el SDK modular oficial de Firebase v10 y exportar
 *            la instancia de Auth y el proveedor de Google con persistencia.
 * ============================================================================
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// Configuración web oficial del proyecto Firebase de Showtech Solutions
const firebaseConfig = {
  apiKey: "AIzaSyDkAhcjG_cb5E-v08V9fvTlizGrrJGkTRk",
  authDomain: "showtech-prototipo.firebaseapp.com",
  projectId: "showtech-prototipo",
  storageBucket: "showtech-prototipo.firebasestorage.app",
  messagingSenderId: "396170424327",
  appId: "1:396170424327:web:ca230d98cc9047d85d3aa2",
  measurementId: "G-6HGXW67EP7"
};

// Inicialización de Firebase (instancia única)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configuración explícita de persistencia de sesión en el navegador
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.warn('Configuración de persistencia en Firebase Auth:', error);
});

// Proveedor oficial de Google con forzado de selección de cuenta
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence
};
