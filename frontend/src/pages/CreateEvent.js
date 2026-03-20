// Página de creación de evento (solo organizadores)

import { api } from '../config/api.js';
import { requireOrganizer } from '../utils/auth.js';

// Renderiza el formulario de creación de evento
export async function CreateEventPage() {
    if (!requireOrganizer()) return '';

    return `
        <div class="create-event-page container">
            <div class="page-header">
                <h1>Crear Nuevo Evento</h1>
                <p class="text-muted">Completa los detalles de tu evento</p>
            </div>
            
            <div class="card" style="max-width: 800px; margin: 0 auto;">
                <div id="create-event-alert"></div>
                
                <form id="create-event-form">
                    <div class="form-group">
                        <label class="form-label">Nombre del Evento</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            id="name" 
                            name="name"
                            placeholder="Conferencia Tech 2026"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Descripción</label>
                        <textarea 
                            class="form-textarea" 
                            id="description" 
                            name="description"
                            placeholder="Describe tu evento..."
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
                            placeholder="100"
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
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Etiquetas del Evento</label>
                        <div id="tags-container" class="tags-checkbox-grid" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px;">
                            <span class="text-secondary text-sm">Cargando etiquetas...</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-md" style="justify-content: flex-end; margin-top: 2rem;">
                        <a href="#/dashboard" class="btn btn-secondary">
                            Cancelar
                        </a>
                        <button type="submit" class="btn btn-primary">
                            Crear Evento
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

// Gestiona el envío del formulario y la llamada a la API para crear el evento
export function attachCreateEventListeners() {
    console.log('=== attachCreateEventListeners called ===');

    const form = document.getElementById('create-event-form');
    console.log('Form element:', form);

    if (!form) {
        console.error('Create event form not found!');
        return;
    }

    console.log('Attaching submit listener to form...');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('=== FORM SUBMITTED ===');

        const nameValue = document.getElementById('name').value;
        const descValue = document.getElementById('description').value;
        const dateValue = document.getElementById('date').value;
        const autonomousCommunityValue = document.getElementById('autonomous_community').value;
        const cityValue = document.getElementById('city').value;
        // La location completa será una combinación para compatibilidad legacy en caso de leerla cruda
        const locationValue = `${cityValue}, ${autonomousCommunityValue}`;
        const capacityValue = document.getElementById('max_capacity').value;
        const imageValue = document.getElementById('image_url').value;

        // Obtener tags seleccionados
        const selectedTags = Array.from(document.querySelectorAll('input[name="event_tags"]:checked')).map(cb => cb.value);

        console.log('Raw form values:', {
            nameValue,
            descValue,
            dateValue,
            locationValue,
            capacityValue,
            imageValue
        });

        const formData = {
            name: nameValue,
            description: descValue,
            date: new Date(dateValue).toISOString(),
            location: locationValue,
            autonomous_community: autonomousCommunityValue,
            city: cityValue,
            max_capacity: parseInt(capacityValue),
            image_url: imageValue || null,
            tags: selectedTags
        };

        console.log('Processed form data:', formData);

        const alertDiv = document.getElementById('create-event-alert');
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando evento...';

            console.log('Calling api.createEvent...');
            const result = await api.createEvent(formData);
            console.log('API Response:', result);

            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    ¡Evento creado exitosamente! Redirigiendo...
                </div>
            `;

            setTimeout(() => {
                console.log('Redirecting to my-events...');
                window.location.href = '/#/my-events';
            }, 1500);

        } catch (error) {
            console.error('ERROR creating event:', error);

            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message || 'Error al crear el evento'}
                </div>
            `;

            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Evento';
        }
    });

    console.log('=== Form listener attached successfully ===');

    // Cargar etiquetas
    loadTagsForSelection();
}

async function loadTagsForSelection() {
    const container = document.getElementById('tags-container');
    if (!container) return;

    try {
        const tags = await api.tags.getAll();
        if (!tags || tags.length === 0) {
            container.innerHTML = '<span class="text-secondary text-sm">No hay etiquetas disponibles en el sistema.</span>';
            return;
        }

        container.innerHTML = tags.map(tag => `
            <label class="tag-selection-label">
                <input type="checkbox" name="event_tags" value="${tag.id}" class="tag-checkbox-hidden">
                <span class="tag-selection-badge">
                    <span class="tag-dot" style="background-color: ${tag.color};"></span>
                    ${tag.name}
                </span>
            </label>
        `).join('');
    } catch (e) {
        console.error('Error loading tags:', e);
        container.innerHTML = '<span class="text-danger text-sm">Error cargando etiquetas</span>';
    }
}
