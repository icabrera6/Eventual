// Configuración de la API y funciones para peticiones HTTP al backend

import { cognitoAuth } from '../utils/cognito.js';

const API_URL = import.meta.env.VITE_API_URL || 'https://okigxfcsk8.execute-api.eu-south-2.amazonaws.com/prod';

// Gestión de perfil (Token gestionado por el SDK de Cognito)
// Obtiene todos los tokens de la sesión activa de Cognito
export const getAllSessionTokens = async () => {
    try {
        const session = await cognitoAuth.getSession();
        return {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken()
        };
    } catch (e) {
        return null;
    }
};

// Comprueba si hay sesión activa (verificación síncrona)
export const getToken = () => {
    // Helper para verificaciones síncronas legacy (isAuthenticated)
    // Devuelve truthy si existe un usuario en almacenamiento
    return cognitoAuth.getCurrentUser() ? 'active-session' : null;
};

export const removeToken = () => {
    // Sin operación, gestionado por cognitoAuth.signOut()
};

// Obtiene los datos del usuario desde localStorage
export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Guarda los datos del usuario en localStorage
export const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Elimina los datos del usuario de localStorage
export const removeUser = () => {
    localStorage.removeItem('user');
};

// Helper para peticiones HTTP
async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    let token = null;

    try {
        const session = await cognitoAuth.getSession();
        token = session.getIdToken().getJwtToken();
    } catch (e) {
        // Solo advertir si realmente esperábamos estar logueados
        // Algunos endpoints como eventos públicos no necesitan token.
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Manejar respuesta 204 Sin Contenido (respuesta vacía)
        if (response.status === 204) {
            return null;
        }

        // Verificar si la respuesta fue exitosa antes de parsear JSON
        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || 'Request failed';
            } catch (jsonError) {
                try {
                    const errorText = await response.text();
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                } catch (textError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            throw new Error(errorMessage);
        }

        // Parsear respuesta JSON exitosa
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Métodos de la API
export const api = {
    // Autenticación
    register: async (userData) => {
        const user = await cognitoAuth.signUp(userData.email, userData.password, {
            'name': userData.name,
            'custom:role': userData.role
        });
        return { user };
    },

    confirmEmail: async (email, code) => {
        try {
            return await cognitoAuth.confirmSignUp(email, code);
        } catch (error) {
            console.error('API Error confirming email:', error);
            throw error;
        }
    },

    resendConfirmationCode: async (email) => {
        try {
            return await cognitoAuth.resendConfirmationCode(email);
        } catch (error) {
            console.error('API Error resending code:', error);
            throw error;
        }
    },

    login: async (credentials) => {
        const session = await cognitoAuth.signIn(credentials.email, credentials.password);

        if (session.newPasswordRequired) {
            return session;
        }

        // Después del login, obtener perfil completo del backend para sincronizar BD y obtener rol
        const user = await api.getMe();
        return { user, ...session };
    },

    completeNewPassword: async (cognitoUser, newPassword, attributes = {}) => {
        const result = await cognitoAuth.completeNewPassword(cognitoUser, newPassword, attributes);
        // Después de responder el desafío, obtenemos tokens. Obtener perfil.
        const user = await api.getMe();
        return { user, ...result };
    },

    logout: () => {
        cognitoAuth.signOut();
        removeUser();
    },

    getMe: () => request('/auth/me'),

    // Eventos
    getEvents: () => request('/events'),

    getEvent: (id) => request(`/events/${id}`),

    getMyEvents: () => request('/events/my-events'),

    createEvent: (eventData) => request('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
    }),

    updateEvent: (id, eventData) => request(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
    }),

    deleteEvent: (id) => request(`/events/${id}`, {
        method: 'DELETE',
    }),

    // Inscripciones
    registerToEvent: (eventId) => request(`/registrations?event_id=${eventId}`, {
        method: 'POST',
    }),

    cancelRegistration: (eventId) => request(`/registrations/${eventId}`, {
        method: 'DELETE',
    }),

    getMyRegistrations: () => request('/registrations/my-registrations'),

    getEventRegistrations: (eventId) => request(`/registrations/event/${eventId}`),

    // Check-in
    checkIn: (eventId, userId) => request(`/checkin/${eventId}/${userId}`, {
        method: 'POST',
    }),

    // Estadísticas
    getEventStatistics: (eventId) => request(`/statistics/${eventId}`),

    // Administración
    admin: {
        getUsers: () => request('/admin/users'),
        getAllEvents: () => request('/admin/events'),
        deleteUser: (userId) => request(`/admin/users/${userId}`, {
            method: 'DELETE',
        }),
        deleteEvent: (eventId) => request(`/admin/events/${eventId}`, {
            method: 'DELETE',
        }),
    },

    // Etiquetas
    tags: {
        getAll: () => request('/tags'),
        create: (tagData) => request('/tags', {
            method: 'POST',
            body: JSON.stringify(tagData),
        }),
        update: (tagId, tagData) => request(`/tags/${tagId}`, {
            method: 'PUT',
            body: JSON.stringify(tagData),
        }),
        delete: (tagId) => request(`/tags/${tagId}`, {
            method: 'DELETE',
        }),
    }
};
