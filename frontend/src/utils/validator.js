// Módulo de validación de formularios

// Comprueba que el email tenga un formato válido
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Comprueba que la contraseña tenga al menos 6 caracteres
export function validatePassword(password) {
    return password.length >= 6;
}

// Comprueba que el campo no esté vacío
export function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Valida que el valor sea numérico y esté dentro del rango indicado
export function validateNumber(value, min = null, max = null) {
    const num = parseInt(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

// Comprueba que la cadena sea una fecha válida
export function validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Comprueba que la fecha sea posterior a la actual
export function validateFutureDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
}

// Clase para gestionar la validación de formularios completos
export class FormValidator {
    constructor() {
        this.errors = {};
    }

    // Aplica las reglas de validación a un campo y guarda los errores
    validate(field, value, rules) {
        this.errors[field] = [];

        for (const rule of rules) {
            const error = rule(value);
            if (error) {
                this.errors[field].push(error);
            }
        }

        if (this.errors[field].length === 0) {
            delete this.errors[field];
        }
    }

    // Devuelve true si no hay errores
    isValid() {
        return Object.keys(this.errors).length === 0;
    }

    // Devuelve los errores de un campo concreto
    getErrors(field) {
        return this.errors[field] || [];
    }

    // Devuelve todos los errores del formulario
    getAllErrors() {
        return this.errors;
    }

    // Limpia todos los errores
    clear() {
        this.errors = {};
    }
}

// Reglas de validación comunes
export const rules = {
    required: (value) => !validateRequired(value) ? 'Este campo es obligatorio' : null,

    email: (value) => !validateEmail(value) ? 'Email inválido' : null,

    password: (value) => !validatePassword(value) ? 'La contraseña debe tener al menos 6 caracteres' : null,

    minLength: (min) => (value) =>
        value.length < min ? `Mínimo ${min} caracteres` : null,

    maxLength: (max) => (value) =>
        value.length > max ? `Máximo ${max} caracteres` : null,

    min: (min) => (value) =>
        !validateNumber(value, min) ? `Mínimo ${min}` : null,

    max: (max) => (value) =>
        !validateNumber(value, null, max) ? `Máximo ${max}` : null,

    futureDate: (value) =>
        !validateFutureDate(value) ? 'La fecha debe ser futura' : null,
};
