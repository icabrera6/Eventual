// Página de edición de evento (solo organizadores)

import { api } from '../config/api.js';
import { requireOrganizer } from '../utils/auth.js';

// Renderiza el formulario de edición de evento
export async function EditEventPage(eventId) {
    if (!requireOrganizer()) return '';

    return `
        <div class="create-event-page container">
            <div class="page-header">
                <h1>Editar Evento</h1>
                <p class="text-muted">Modifica los detalles de tu evento</p>
            </div>
            
            <div class="card" style="max-width: 800px; margin: 0 auto;">
                <div id="edit-event-alert"></div>
                
                <form id="edit-event-form">
                    <div class="form-group">
                        <label class="form-label">Nombre del Evento</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            id="name" 
                            name="name"
                            placeholder="Cargando..."
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Descripción</label>
                        <textarea 
                            class="form-textarea" 
                            id="description" 
                            name="description"
                            placeholder="Cargando..."
                            required
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Fecha y Hora</label>
                        <input 
                            type="datetime-local" 
                            class="form-input" 
                            id="date" 
                            name="date"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Ubicación</label>
                        <div class="grid grid-3" style="gap: var(--space-sm);">
                            <div>
                                <label class="text-sm text-secondary">País</label>
                                <input type="text" class="form-input" id="country" name="country" value="España" disabled style="background: var(--bg-secondary); cursor: not-allowed; opacity: 0.8;">
                            </div>
                            <div>
                                <label class="text-sm text-secondary">Comunidad Autónoma</label>
                                <select class="form-select" id="autonomous_community" name="autonomous_community" required>
                                    <option value="" disabled selected>Selecciona una...</option>
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
                            <div>
                                <label class="text-sm text-secondary">Ciudad / Municipio</label>
                                <input type="text" class="form-input" id="city" name="city" placeholder="Ej. Sevilla" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Aforo Máximo</label>
                        <input 
                            type="number" 
                            class="form-input" 
                            id="max_capacity" 
                            name="max_capacity"
                            placeholder="Cargando..."
                            min="1"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">URL de Imagen (opcional)</label>
                        <input 
                            type="url" 
                            class="form-input" 
                            id="image_url" 
                            name="image_url"
                            placeholder="Cargando..."
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Etiquetas del Evento</label>
                        <div id="tags-container" class="tags-checkbox-grid" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px;">
                            <span class="text-secondary text-sm">Cargando etiquetas...</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-md" style="justify-content: flex-end; margin-top: 2rem;">
                        <a href="#/my-events" class="btn btn-secondary">
                            Cancelar
                        </a>
                        <button type="submit" class="btn btn-primary" id="submit-btn" disabled>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <style>
            .create-event-page {
                padding: var(--space-xl) var(--space-md);
            }
            
            .page-header {
                text-align: center;
                margin-bottom: var(--space-2xl);
            }
            
            .page-header h1 {
                margin-bottom: var(--space-xs);
            }
        </style>
    `;
}

// Gestiona la carga inicial y el envío del formulario para actualizar
export async function attachEditEventListeners(eventId) {
    const form = document.getElementById('edit-event-form');
    const alertDiv = document.getElementById('edit-event-alert');
    const submitBtn = document.getElementById('submit-btn');

    if (!form || !eventId) return;

    try {
        // 1. Obtener datos del evento actual validando los permisos del organizador implicito por el token (el backend se encarga)
        const event = await api.getEvent(eventId);

        // 2. Poblar formulario
        document.getElementById('name').value = event.name || '';
        document.getElementById('description').value = event.description || '';

        // Formatear fecha para el input datetime-local (YYYY-MM-DDThh:mm)
        if (event.date) {
            const dateObj = new Date(event.date);
            // Ajuste simple para la zona horaria local en formato YYYY-MM-DDTHH:mm
            const tzOffset = dateObj.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);
            document.getElementById('date').value = localISOTime;
        }

        // Si existen los nuevos campos los usamos, de lo contrario fallback vacio o de logic legacy
        document.getElementById('autonomous_community').value = event.autonomous_community || '';
        document.getElementById('city').value = event.city || '';
        document.getElementById('max_capacity').value = event.max_capacity || '';
        document.getElementById('image_url').value = event.image_url || '';

        // Cargar y marcar etiquetas
        await loadTagsForEditing(event.tags || []);

        submitBtn.disabled = false; // Habilitar tras cargar

    } catch (error) {
        alertDiv.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los datos del evento.
                ${error.message || ''}
            </div>
        `;
        return; // Detener flujo si no pudimos cargar
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedTags = Array.from(document.querySelectorAll('input[name="event_tags"]:checked')).map(cb => cb.value);

        const autoCommVal = document.getElementById('autonomous_community').value;
        const cityVal = document.getElementById('city').value;

        const formData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            date: new Date(document.getElementById('date').value).toISOString(),
            location: `${cityVal}, ${autoCommVal}`,
            autonomous_community: autoCommVal,
            city: cityVal,
            max_capacity: parseInt(document.getElementById('max_capacity').value, 10),
            image_url: document.getElementById('image_url').value || null,
            tags: selectedTags
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            await api.updateEvent(eventId, formData);

            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    ¡Evento actualizado exitosamente! Redirigiendo...
                </div>
            `;

            setTimeout(() => {
                window.location.href = '/#/my-events';
            }, 1000);

        } catch (error) {
            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message || 'Error al actualizar el evento'}
                </div>
            `;

            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    });
}

async function loadTagsForEditing(selectedTagIds = []) {
    const container = document.getElementById('tags-container');
    if (!container) return;

    try {
        const tags = await api.tags.getAll();
        if (!tags || tags.length === 0) {
            container.innerHTML = '<span class="text-secondary text-sm">No hay etiquetas disponibles en el sistema.</span>';
            return;
        }

        container.innerHTML = tags.map(tag => {
            const isChecked = selectedTagIds.includes(tag.id) ? 'checked' : '';
            return `
            <label class="tag-selection-label">
                <input type="checkbox" name="event_tags" value="${tag.id}" class="tag-checkbox-hidden" ${isChecked}>
                <span class="tag-selection-badge">
                    <span class="tag-dot" style="background-color: ${tag.color};"></span>
                    ${tag.name}
                </span>
            </label>
            `;
        }).join('');
    } catch (e) {
        console.error('Error loading tags:', e);
        container.innerHTML = '<span class="text-danger text-sm">Error cargando etiquetas</span>';
    }
}
