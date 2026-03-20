// Página del panel con explorador de eventos, inscripción y cancelación

import { api } from '../config/api.js';
import { requireAuth, getCurrentUser } from '../utils/auth.js';
import { EventCard } from '../components/EventCard.js';
import { Loading, EmptyState } from '../components/Common.js';
import { showToast, showConfirmModal } from '../components/Notifications.js';

// Renderiza el panel de eventos disponibles
export async function DashboardPage() {
    if (!requireAuth()) return '';

    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/#/login';
        return '';
    }

    return `
        <div class="dashboard-page container">
            <div class="dashboard-header">
                <div>
                    <h1>Explorar Eventos</h1>
                    <p class="text-muted">Descubre y regístrate en eventos que te interesan</p>
                </div>
                ${user.role === 'Organizador' ? `
                    <a href="#/create-event" class="btn btn-primary">
                        ➕ Crear Evento
                    </a>
                ` : ''}
            </div>
            
            <div class="dashboard-filters" style="margin-bottom: var(--space-xl); background: var(--bg-secondary); padding: var(--space-md); border-radius: var(--radius-lg); border: 1px solid var(--border);">
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; justify-content: space-between;">
                    <div style="flex: 1; min-width: 250px;">
                        <input type="text" id="search-input" class="form-input" placeholder="🔍 Buscar por evento o por organizador..." style="background: var(--bg-tertiary);">
                    </div>
                    <button id="toggle-filters-btn" class="btn btn-secondary">
                        <span style="margin-right: 6px;">⚙️</span> Filtros Avanzados
                    </button>
                </div>
                
                <div id="filters-form-container" style="display: none; margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--border);">
                    <div class="grid grid-2">
                        <div class="form-group mb-0">
                            <label class="form-label text-sm text-secondary">Categoría (Etiqueta)</label>
                            <select id="filter-tag" class="form-select" style="background: var(--bg-tertiary);">
                                <option value="">Todas las Etiquetas</option>
                                <!-- Se rellenará dinámicamente -->
                            </select>
                        </div>

                        <div class="form-group mb-0">
                            <label class="form-label text-sm text-secondary">Comunidad Autónoma</label>
                            <select id="filter-location" class="form-select" style="background: var(--bg-tertiary);">
                                <option value="">Toda España</option>
                                <option value="Andalucía">Andalucía</option>
                                <option value="Aragón">Aragón</option>
                                <option value="Asturias">Asturias</option>
                                <option value="Baleares">Baleares</option>
                                <option value="Canarias">Canarias</option>
                                <option value="Cantabria">Cantabria</option>
                                <option value="Castilla y León">Castilla y León</option>
                                <option value="Castilla-La Mancha">Castilla-La Mancha</option>
                                <option value="Cataluña">Cataluña</option>
                                <option value="Comunidat Valenciana">Comunidat Valenciana</option>
                                <option value="Extremadura">Extremadura</option>
                                <option value="Galicia">Galicia</option>
                                <option value="Madrid">Madrid</option>
                                <option value="Murcia">Murcia</option>
                                <option value="Navarra">Navarra</option>
                                <option value="País Vasco">País Vasco</option>
                                <option value="La Rioja">La Rioja</option>
                                <option value="Ceuta">Ceuta</option>
                                <option value="Melilla">Melilla</option>
                            </select>
                        </div>
                        
                        <div class="form-group mb-0">
                            <label class="form-label text-sm text-secondary">Ordenar por</label>
                            <select id="filter-sort" class="form-select" style="background: var(--bg-tertiary);">
                                <option value="recent">Más recientes primero</option>
                                <option value="upcoming">Próximos a realizarse</option>
                                <option value="popular">Más populares</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="events-container">
                ${Loading()}
            </div>
        </div>
        
    `;
}

// Carga los eventos y las inscripciones del usuario para mostrar el estado de cada tarjeta
export async function attachDashboardListeners() {
    let allEvents = [];
    let registeredEventIds = new Set();

    try {
        // Fetch paralelo de eventos y registros
        const [events, registrations] = await Promise.all([
            api.getEvents(),
            api.getMyRegistrations()
        ]);

        allEvents = events;
        registeredEventIds = new Set(registrations.map(r => r.event_id));

        // Cargar etiquetas visuales al dropdown
        await loadFilterTags();

        // Renderizado inicial (orden por defecto: recientes)
        applyFilters(allEvents, registeredEventIds);

        // Añadir listeners a los controles de filtro
        document.getElementById('search-input')?.addEventListener('input', () => applyFilters(allEvents, registeredEventIds));
        document.getElementById('filter-tag')?.addEventListener('change', () => applyFilters(allEvents, registeredEventIds));
        document.getElementById('filter-location')?.addEventListener('change', () => applyFilters(allEvents, registeredEventIds));
        document.getElementById('filter-sort')?.addEventListener('change', () => applyFilters(allEvents, registeredEventIds));

        // Listener para el botón de mostrar/ocultar filtros
        const toggleBtn = document.getElementById('toggle-filters-btn');
        const filtersContainer = document.getElementById('filters-form-container');
        if (toggleBtn && filtersContainer) {
            toggleBtn.addEventListener('click', () => {
                if (filtersContainer.style.display === 'none') {
                    filtersContainer.style.display = 'block';
                    toggleBtn.innerHTML = '<span style="margin-right: 6px;">❌</span> Ocultar Filtros';
                } else {
                    filtersContainer.style.display = 'none';
                    toggleBtn.innerHTML = '<span style="margin-right: 6px;">⚙️</span> Filtros Avanzados';
                }
            });
        }

    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('events-container').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los eventos. Por favor, intenta de nuevo.
            </div>
        `;
    }
}

async function loadFilterTags() {
    try {
        const tags = await api.tags.getAll();
        const tagSelect = document.getElementById('filter-tag');
        if (tagSelect && tags.length > 0) {
            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.id;
                option.textContent = tag.name;
                tagSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading tags for filter', error);
    }
}

function applyFilters(eventsData, registeredIds) {
    const searchInput = document.getElementById('search-input')?.value.toLowerCase() || '';
    const tagFilter = document.getElementById('filter-tag')?.value || '';
    const locationFilter = document.getElementById('filter-location')?.value || '';
    const sortFilter = document.getElementById('filter-sort')?.value || 'recent';

    let filtered = eventsData.filter(event => {
        // Filtro Búsqueda
        const matchesSearch =
            event.name.toLowerCase().includes(searchInput) ||
            (event.organizer_name && event.organizer_name.toLowerCase().includes(searchInput));

        // Filtro Etiquetas
        const matchesTag = tagFilter ? (event.tags || []).includes(tagFilter) : true;

        // Filtro Ubicación
        const matchesLocation = locationFilter ? event.autonomous_community === locationFilter : true;

        return matchesSearch && matchesTag && matchesLocation;
    });

    // Filtro Ordenación
    filtered.sort((a, b) => {
        if (sortFilter === 'recent') {
            // Más reciéntemente creados (usando ID u orden natural de DB como proxy si no hay created_at, o fecha si no aplicara)
            // Asumiendo que la fecha del evento es la medida más relevante if 'created_at' falls back
            return new Date(b.date) - new Date(a.date);
        } else if (sortFilter === 'upcoming') {
            // Próximos a realizarse primero
            return new Date(a.date) - new Date(b.date);
        } else if (sortFilter === 'popular') {
            // Más inscritos
            return b.current_registrations - a.current_registrations;
        }
        return 0;
    });

    renderEvents(filtered, registeredIds);
}

function renderEvents(eventsToRender, registeredIds) {
    const container = document.getElementById('events-container');

    if (!eventsToRender || eventsToRender.length === 0) {
        container.innerHTML = EmptyState('No se encontraron eventos con los filtros actuales', '🔍');
        return;
    }

    container.innerHTML = `
        <div class="grid grid-2">
            ${eventsToRender.map(event => EventCard(event, {
        showActions: true,
        onView: true,
        onRegister: true,
        isRegistered: registeredIds.has(event.id),
        onCancelRegistration: true
    })).join('')}
        </div>
    `;
}

// Funciones globales para acciones de tarjetas de eventos
window.handleEventView = async (eventId) => {
    window.location.href = `/#/event/${eventId}`;
};

window.handleEventRegister = async (eventId) => {
    showConfirmModal('¿Quieres inscribirte a este evento?', async () => {
        try {
            await api.registerToEvent(eventId);
            showToast('¡Inscripción exitosa!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            showToast(error.message || 'Error al inscribirse al evento', 'error');
        }
    });
};


window.handleCancelRegistration = async (eventId) => {
    showConfirmModal('¿Estás seguro de que quieres cancelar tu inscripción?', async () => {
        const alertDiv = document.getElementById('registration-alert');
        const eventCard = document.getElementById(`event-card-${eventId}`);

        try {
            await api.cancelRegistration(eventId);

            // Si tenemos un área de alertas (página Mis Inscripciones), mostrar mensaje ahí
            if (alertDiv) {
                alertDiv.innerHTML = `
                    <div class="alert alert-success mb-lg">
                        ✓ Inscripción cancelada exitosamente
                    </div>
                `;

                // Ocultar automáticamente después de 3 segundos
                setTimeout(() => {
                    alertDiv.innerHTML = '';
                }, 3000);

                // Eliminar la tarjeta del evento con animación
                if (eventCard) {
                    eventCard.style.opacity = '0';
                    eventCard.style.transform = 'scale(0.9)';
                    eventCard.style.transition = 'all 0.3s ease';
                    setTimeout(() => eventCard.remove(), 300);
                }
            } else {
                // Página Dashboard - usar toast y recargar
                showToast('Inscripción cancelada', 'success');
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            if (alertDiv) {
                alertDiv.innerHTML = `
                    <div class="alert alert-danger mb-lg">
                        ${error.message || 'Error al cancelar la inscripción'}
                    </div>
                `;
                setTimeout(() => {
                    alertDiv.innerHTML = '';
                }, 5000);
            } else {
                showToast(error.message || 'Error al cancelar la inscripción', 'error');
            }
        }
    });
};
