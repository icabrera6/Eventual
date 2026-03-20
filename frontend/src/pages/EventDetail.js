// Página de detalle de evento con estadísticas, lista de inscritos y check-in

import { api } from '../config/api.js';
import { requireAuth, getCurrentUser, isOrganizer } from '../utils/auth.js';
import { formatDate, formatPercentage } from '../utils/formatters.js';
import { Loading } from '../components/Common.js';
import { showToast, showConfirmModal } from '../components/Notifications.js';

// Renderiza la estructura de la página de detalle del evento
export async function EventDetailPage(eventId) {
    if (!requireAuth()) return '';

    return `
        <div class="event-detail-page container">
            <div id="event-detail-container">
                ${Loading()}
            </div>
        </div>
        
        <style>
            .event-detail-page {
                padding: var(--space-xl) var(--space-md);
            }
            
            .event-detail {
                max-width: 900px;
                margin: 0 auto;
            }
            
            .detail-hero {
                width: 100%;
                height: 400px;
                border-radius: var(--radius-lg);
                overflow: hidden;
                margin-bottom: var(--space-xl);
            }
            
            .detail-hero img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .detail-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--space-lg);
                margin: var(--space-xl) 0;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: var(--space-md);
            }
            
            .info-icon {
                font-size: 1.5rem;
            }
            
            .info-content h4 {
                margin-bottom: var(--space-xs);
                font-size: 0.875rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .info-content p {
                font-size: 1.125rem;
                font-weight: 600;
            }
            
            .registrations-list {
                margin-top: var(--space-xl);
            }
            
            .registration-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--space-md);
                background: var(--bg-tertiary);
                border-radius: var(--radius-md);
                margin-bottom: var(--space-sm);
            }
            
            .registration-user {
                display: flex;
                flex-direction: column;
            }
            
            .user-name {
                font-weight: 600;
            }
            
            .user-email {
                font-size: 0.875rem;
                color: var(--text-muted);
            }
        </style>
    `;
}

// Carga los datos del evento, estadísticas, inscripciones y renderiza todo el contenido
export async function attachEventDetailListeners(eventId) {
    try {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = '/#/login';
            return;
        }

        const event = await api.getEvent(eventId);
        const statistics = await api.getEventStatistics(eventId);

        let registrations = [];
        let isRegistered = false;

        // Verificar si el usuario está inscrito
        try {
            const myRegs = await api.getMyRegistrations();
            isRegistered = myRegs.some(r => r.event_id === eventId);
        } catch (e) {
            console.error('Error checking registration:', e);
        }

        // Si es organizador, obtener lista de inscripciones
        if (user.id === event.organizer_id) {
            registrations = await api.getEventRegistrations(eventId);
        }

        const container = document.getElementById('event-detail-container');

        container.innerHTML = `
            <div class="event-detail">
                <div class="mb-md">
                    <a href="#/dashboard" class="btn btn-ghost btn-sm">← Volver</a>
                </div>
                
                ${event.image_url ? `
                    <div class="detail-hero">
                        <img src="${event.image_url}" alt="${event.name}" />
                    </div>
                ` : ''}
                
                <div class="card">
                    <h1>${event.name}</h1>
                    <p class="text-muted mb-md">Organizado por ${event.organizer_name}</p>
                    
                    <p class="mb-xl" style="font-size: 1.125rem; line-height: 1.8;">
                        ${event.description}
                    </p>
                    
                    <div class="detail-info">
                        <div class="info-item">
                            <span class="info-icon">📅</span>
                            <div class="info-content">
                                <h4>Fecha y Hora</h4>
                                <p>${formatDate(event.date)}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <div class="info-content">
                                <h4>Ubicación</h4>
                                <p>${event.location}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-icon">👥</span>
                            <div class="info-content">
                                <h4>Inscritos</h4>
                                <p>${event.current_registrations} / ${event.max_capacity}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-icon">✅</span>
                            <div class="info-content">
                                <h4>Check-in</h4>
                                <p>${statistics.checked_in_count} asistentes</p>
                            </div>
                        </div>
                    </div>
                    
                    ${user.id !== event.organizer_id ? `
                        <div class="mt-xl">
                            ${!isRegistered && event.available_spots > 0 ? `
                                <button class="btn btn-primary btn-lg" onclick="handleEventRegister('${event.id}')">
                                    Inscribirme a este Evento
                                </button>
                            ` : isRegistered ? `
                                <button class="btn btn-danger" onclick="handleCancelRegistration('${event.id}')">
                                    Cancelar Mi Inscripción
                                </button>
                            ` : `
                                <div class="badge badge-danger">Evento Completo</div>
                            `}
                        </div>
                    ` : ''}
                </div>
                
                ${user.id === event.organizer_id ? `
                    <div class="card mt-xl">
                        <h2 class="mb-lg">Estadísticas del Evento</h2>
                        
                        <div class="detail-info">
                            <div class="info-item">
                                <span class="info-icon">📊</span>
                                <div class="info-content">
                                    <h4>Total Inscritos</h4>
                                    <p>${statistics.total_registrations}</p>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <span class="info-icon">✅</span>
                                <div class="info-content">
                                    <h4>Check-in</h4>
                                    <p>${statistics.checked_in_count}</p>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <span class="info-icon">📈</span>
                                <div class="info-content">
                                    <h4>Tasa de Asistencia</h4>
                                    <p>${formatPercentage(statistics.attendance_rate)}</p>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <span class="info-icon">🎟️</span>
                                <div class="info-content">
                                    <h4>Plazas Disponibles</h4>
                                    <p>${statistics.available_spots}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mt-xl registrations-list">
                        <div class="flex justify-between items-center mb-lg">
                            <h2>Lista de Inscritos (${registrations.length})</h2>
                        </div>
                        <div id="checkin-alert"></div>

                        
                        ${registrations.length === 0 ? `
                            <p class="text-muted">Aún no hay inscritos en este evento.</p>
                        ` : `
                            <div>
                                ${registrations.map(reg => `
                                    <div class="registration-item" id="reg-${reg.user_id}">
                                        <div class="registration-user">
                                            <span class="user-name">${reg.user_name}</span>
                                            <span class="user-email">${reg.user_email}</span>
                                        </div>
                                        <div class="flex items-center gap-md">
                                            ${reg.checked_in ? `
                                                <span class="badge badge-success">✓ Check-in</span>
                                            ` : `
                                                <button 
                                                    class="btn btn-primary btn-sm" 
                                                    onclick="handleCheckIn('${event.id}', '${reg.user_id}', '${reg.user_name}')"
                                                >
                                                    Hacer Check-in
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                ` : ''}
            </div>
        `;

    } catch (error) {
        console.error('Error loading event details:', error);
        document.getElementById('event-detail-container').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los detalles del evento.
            </div>
        `;
    }
}

// Controlador global de check-in: confirma y actualiza la UI
window.handleCheckIn = async (eventId, userId, userName) => {
    showConfirmModal(`¿Confirmar check-in de ${userName || 'este asistente'}?`, async () => {
        const alertDiv = document.getElementById('checkin-alert');
        const regItem = document.getElementById(`reg-${userId}`);

        try {
            await api.checkIn(eventId, userId);

            // Mostrar mensaje de éxito en el panel
            if (alertDiv) {
                alertDiv.innerHTML = `
                    <div class="alert alert-success mb-md">
                        ✓ Check-in realizado exitosamente para ${userName || 'el asistente'}
                    </div>
                `;

                // Ocultar automáticamente después de 3 segundos
                setTimeout(() => {
                    alertDiv.innerHTML = '';
                }, 3000);
            }

            // Actualizar el elemento de inscripción para mostrar estado de check-in
            if (regItem) {
                const actionDiv = regItem.querySelector('.flex.items-center');
                if (actionDiv) {
                    actionDiv.innerHTML = '<span class="badge badge-success">✓ Check-in</span>';
                }
            }

        } catch (error) {
            // Mostrar mensaje de error en el panel
            if (alertDiv) {
                alertDiv.innerHTML = `
                    <div class="alert alert-danger mb-md">
                        ${error.message || 'Error al realizar el check-in'}
                    </div>
                `;

                // Ocultar automáticamente después de 5 segundos
                setTimeout(() => {
                    alertDiv.innerHTML = '';
                }, 5000);
            }
        }
    });
};
