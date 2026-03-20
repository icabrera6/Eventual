// Módulo de formateo de datos (fechas, números y tiempos relativos)

// Formatea una fecha a formato largo: "15 de febrero de 2026, 10:00"
export function formatDate(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Formatea una fecha a formato corto: "15 feb 2026"
export function formatDateShort(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Convierte una fecha al formato que necesita un input datetime-local
export function formatDateInput(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Formatea un número con separadores de miles: 1500 → "1.500"
export function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num);
}

// Formatea un número como porcentaje: 71.1 → "71.1%"
export function formatPercentage(num, decimals = 1) {
    return `${num.toFixed(decimals)}%`;
}

// Devuelve cuánto tiempo ha pasado: "Hace 3 horas", "Hace 2 días", etc.
export function timeAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 30) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

    return formatDateShort(isoString);
}

// Comprueba si un evento es futuro
export function isUpcoming(isoString) {
    return new Date(isoString) > new Date();
}

// Comprueba si un evento ya ha pasado
export function isPast(isoString) {
    return new Date(isoString) < new Date();
}
