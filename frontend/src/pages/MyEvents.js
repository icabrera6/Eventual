// Página de eventos creados por el organizador con opciones de edición y eliminación

import { api } from '../config/api.js';
import { requireOrganizer } from '../utils/auth.js';
import { EventCard } from '../components/EventCard.js';
import { Loading, EmptyState } from '../components/Common.js';
import { showToast, showConfirmModal } from '../components/Notifications.js';

// Renderiza la página "Mis Eventos" (solo organizadores)
export async function MyEventsPage() {
    if (!requireOrganizer()) return '';

    return `
        <div class="my-events-page container">
            <div class="page-header">
                <div>
                    <h1>Mis Eventos</h1>
                    <p class="text-muted">Eventos que has creado</p>
                </div>
                <a href="#/create-event" class="btn btn-primary">
                    ➕ Crear Evento
                </a>
            </div>
            
            <div id="my-events-container">
                ${Loading()}
            </div>
        </div>
        
        <style>
            .my-events-page {
                padding: var(--space-xl) var(--space-md);
            }
            
            .page-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: var(--space-2xl);
                gap: var(--space-md);
            }
            
            .page-header h1 {
                margin-bottom: var(--space-xs);
            }
            
            @media (max-width: 768px) {
                .page-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        </style>
    `;
}

// Carga los eventos del organizador y los muestra en una cuadrícula
export async function attachMyEventsListeners() {
    try {
        const events = await api.getMyEvents();
        const container = document.getElementById('my-events-container');

        if (events.length === 0) {
            container.innerHTML = `
                ${EmptyState('No has creado ningún evento', '📅')}
                <div style="text-align: center;">
                    <a href="#/create-event" class="btn btn-primary">
                        Crear Mi Primer Evento
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-2">
                ${events.map(event => EventCard(event, {
            showActions: true,
            onView: true,
            onEdit: true,
            onDelete: true
        })).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading my events:', error);
        document.getElementById('my-events-container').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar tus eventos. Por favor, intenta de nuevo.
            </div>
        `;
    }
}

// Funciones globales para acciones del organizador
window.handleEventEdit = async (eventId) => {
    window.location.href = `/#/edit-event/${eventId}`;
};

window.handleEventDelete = async (eventId) => {
    showConfirmModal('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.', async () => {
        try {
            await api.deleteEvent(eventId);
            showToast('Evento eliminado exitosamente', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            showToast(error.message || 'Error al eliminar el evento', 'error');
        }
    });
};
