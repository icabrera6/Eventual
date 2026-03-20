// Página de inscripciones del usuario con estado de check-in y cancelación

import { api } from '../config/api.js';
import { requireAuth, getCurrentUser } from '../utils/auth.js';
import { EventCard } from '../components/EventCard.js';
import { Loading, EmptyState } from '../components/Common.js';

// Renderiza la página "Mis Inscripciones"
export async function MyRegistrationsPage() {
    if (!requireAuth()) return '';

    return `
        <div class="my-registrations-page container">
            <div class="page-header">
                <h1>Mis Inscripciones</h1>
                <p class="text-muted">Eventos en los que estás registrado</p>
            </div>
            
            <div id="registration-alert"></div>

            <div id="registrations-container">
                ${Loading()}
            </div>
        </div>
        
        <style>
            .my-registrations-page {
                padding: var(--space-xl) var(--space-md);
            }
            
            .page-header {
                margin-bottom: var(--space-2xl);
            }
            
            .page-header h1 {
                margin-bottom: var(--space-xs);
            }
        </style>
    `;
}

// Carga las inscripciones, obtiene los detalles de cada evento y los muestra
export async function attachMyRegistrationsListeners() {
    try {
        const registrations = await api.getMyRegistrations();
        const container = document.getElementById('registrations-container');

        if (registrations.length === 0) {
            container.innerHTML = EmptyState('No estás inscrito en ningún evento', '📝');
            return;
        }

        // Obtener detalles completos del evento para cada inscripción
        const eventPromises = registrations.map(reg => api.getEvent(reg.event_id));
        const events = await Promise.all(eventPromises);

        const registrationMap = new Map(registrations.map(r => [r.event_id, r]));

        container.innerHTML = `
            <div class="grid grid-2">
                ${events.map(event => {
            const registration = registrationMap.get(event.id);
            return `
                        <div id="event-card-${event.id}">
                            ${EventCard(event, {
                showActions: true,
                onView: true,
                isRegistered: true,
                onCancelRegistration: true,
                checkedIn: registration.checked_in
            })}
                        </div>
                    `;
        }).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading registrations:', error);
        document.getElementById('registrations-container').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar las inscripciones. Por favor, intenta de nuevo.
            </div>
        `;
    }
}
