// Componente de tarjeta de evento con imagen, detalles, barra de aforo y acciones

import { formatDate, formatDateShort, isUpcoming } from '../utils/formatters.js';

// Genera el HTML de una tarjeta de evento con sus acciones (ver, inscribirse, editar, eliminar)
export function EventCard(event, options = {}) {
    const {
        showActions = true,
        onRegister = null,
        onView = null,
        onEdit = null,
        onDelete = null,
        isRegistered = false,
        onCancelRegistration = null,
        checkedIn = false

    } = options;

    const availablePercent = (event.available_spots / event.max_capacity) * 100;
    const isFull = event.available_spots === 0;
    const upcoming = isUpcoming(event.date);

    return `
        <div class="event-card card fade-in">
            ${event.image_url ? `
                <div class="event-image">
                    <img src="${event.image_url}" alt="${event.name}" />
                    ${isFull ? '<div class="event-badge badge-danger">Completo</div>' : ''}
                    ${!upcoming ? '<div class="event-badge badge-warning">Pasado</div>' : ''}
                </div>
            ` : ''}
            
            <div class="event-header">
                <h3 class="event-title">${event.name}</h3>
                <p class="event-organizer text-muted">
                    Por ${event.organizer_name}
                </p>
                ${event.tag_details && event.tag_details.length > 0 ? `
                <div class="event-tags-container" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
                    ${event.tag_details.map(tag => `
                        <span class="badge" style="background-color: var(--bg-tertiary); color: var(--text-primary); padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; border: 1px solid var(--primary); display: inline-flex; align-items: center; gap: 6px;">
                            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${tag.color}; display: inline-block;"></span>
                            ${tag.name}
                        </span>
                    `).join('')}
                </div>
                ` : ''}
            </div>
            
            <div class="event-body">
                <p class="event-description">${event.description}</p>
                
                <div class="event-details">
                    <div class="event-detail">
                        <span class="detail-icon">📅</span>
                        <span>${formatDateShort(event.date)}</span>
                    </div>
                    <div class="event-detail">
                        <span class="detail-icon">📍</span>
                        <span>${event.city && event.autonomous_community ? `${event.city}, ${event.autonomous_community}` : event.location}</span>
                    </div>
                    <div class="event-detail">
                        <span class="detail-icon">👥</span>
                        <span>${event.current_registrations} / ${event.max_capacity}</span>
                    </div>
                </div>
                
                <div class="capacity-bar">
                    <div class="capacity-fill" style="width: ${100 - availablePercent}%"></div>
                </div>
                <p class="capacity-text text-muted">
                    ${event.available_spots} plazas disponibles
                </p>
            </div>
            
            ${showActions ? `
                <div class="event-footer">
                    <div class="event-actions">
                        ${onView ? `
                            <button class="btn btn-secondary btn-sm" onclick="handleEventView('${event.id}')">
                                Ver Detalles
                            </button>
                        ` : ''}
                        
                        ${onRegister && !isRegistered && !isFull && upcoming ? `
                            <button class="btn btn-primary btn-sm" onclick="handleEventRegister('${event.id}')">
                                Inscribirse
                            </button>
                        ` : ''}
                        
                        ${isRegistered && upcoming ? `
                            <button class="btn btn-danger btn-sm" onclick="handleCancelRegistration('${event.id}')">
                                Cancelar Inscripción
                            </button>
                        ` : ''}
                        
                        ${onEdit ? `
                            <button class="btn btn-secondary btn-sm" onclick="handleEventEdit('${event.id}')">
                                Editar
                            </button>
                        ` : ''}
                        
                        ${onDelete ? `
                            <button class="btn btn-danger btn-sm" onclick="handleEventDelete('${event.id}')">
                                Eliminar
                            </button>
                        ` : ''}
                    </div>
                    ${checkedIn ? `
                        <div class="checkin-badge">
                            <span class="badge badge-success">
                                ✓ Check-in realizado
                            </span>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        
        <style>
            .event-card {
                overflow: hidden;
            }
            
            .event-image {
                position: relative;
                width: calc(100% + (2 * var(--space-lg)));
                height: 200px;
                overflow: hidden;
                margin: calc(-1 * var(--space-lg));
                margin-bottom: var(--space-md);
            }
            
            .event-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .event-badge {
                position: absolute;
                top: var(--space-md);
                right: var(--space-md);
            }
            
            .event-header {
                margin-bottom: var(--space-md);
            }
            
            .event-title {
                margin-bottom: var(--space-xs);
            }
            
            .event-organizer {
                font-size: 0.875rem;
            }
            
            .event-description {
                color: var(--text-secondary);
                margin-bottom: var(--space-md);
                line-height: 1.6;
            }
            
            .event-details {
                display: flex;
                flex-direction: column;
                gap: var(--space-sm);
                margin-bottom: var(--space-md);
            }
            
            .event-detail {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                color: var(--text-secondary);
                font-size: 0.9375rem;
            }
            
            .detail-icon {
                font-size: 1.25rem;
            }
            
            .capacity-bar {
                height: 8px;
                background: var(--bg-tertiary);
                border-radius: var(--radius-full);
                overflow: hidden;
                margin-bottom: var(--space-sm);
                border: 1px solid var(--border);
            }
            
            .capacity-fill {
                height: 100%;
                background: var(--gradient-gold);
                transition: width var(--transition-slow);
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            }
            
            .capacity-text {
                font-size: 0.875rem;
            }
            
            .event-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--space-md);
                flex-wrap: wrap;
            }

            .event-actions {
                display: flex;
                gap: var(--space-sm);
                flex-wrap: wrap;
            }
            
            .checkin-badge {
                margin-left: auto;
            }

        </style>
    `;
}
