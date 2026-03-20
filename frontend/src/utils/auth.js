// Utilidades de autenticación y protección de rutas

import { getToken, getUser, removeUser } from '../config/api.js';
import { api } from '../config/api.js';
import { showToast } from '../components/Notifications.js';

// Comprueba si hay un usuario autenticado
export function isAuthenticated() {
    return !!getToken();
}

// Devuelve los datos del usuario actual
export function getCurrentUser() {
    return getUser();
}

// Cierra la sesión y redirige al login
export function logout() {
    api.logout();
    window.location.href = '/#/login';
}

// Comprueba si el usuario es Organizador
export function isOrganizer() {
    const user = getUser();
    return user && user.role === 'Organizador';
}

// Comprueba si el usuario es Asistente
export function isAsistente() {
    const user = getUser();
    return user && user.role === 'Asistente';
}

// Exige autenticación; redirige al login si no hay sesión
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/#/login';
        return false;
    }
    return true;
}

// Exige rol de Organizador; muestra aviso si no lo es
export function requireOrganizer() {
    if (!isAuthenticated()) {
        window.location.href = '/#/login';
        return false;
    }
    if (!isOrganizer()) {
        showToast('Esta función solo está disponible para organizadores', 'error');
        setTimeout(() => window.location.href = '/#/dashboard', 1500);
        return false;
    }
    return true;
}
