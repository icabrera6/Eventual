// Panel de administración con gestión de usuarios y eventos (solo admin)

import { api } from '../config/api.js';
import { requireAuth, getCurrentUser } from '../utils/auth.js';
import { Loading } from '../components/Common.js';
import { showToast, showConfirmModal } from '../components/Notifications.js';
import { formatDateShort } from '../utils/formatters.js';

// Renderiza el panel de administración con pestañas
export async function AdminDashboardPage() {
    if (!requireAuth()) return '';

    const user = getCurrentUser();
    if (!user || user.role !== 'Admin') {
        window.location.href = '/#/dashboard';
        return '';
    }

    return `
        <div class="admin-page container">
            <div class="admin-header">
                <h1>Panel de Administración</h1>
                <p class="text-secondary">Gestión de usuarios y eventos</p>
            </div>
            
            <div class="admin-tabs">
                <button class="tab-btn active" data-tab="users">Usuarios</button>
                <button class="tab-btn" data-tab="events">Eventos</button>
                <button class="tab-btn" data-tab="tags">Etiquetas</button>
            </div>

            <div id="admin-content" class="mt-lg">
                ${Loading()}
            </div>
        </div>
        
    `;
}

// Gestiona las pestañas, carga de datos y acciones de eliminación
export async function attachAdminListeners() {
    const content = document.getElementById('admin-content');
    const tabs = document.querySelectorAll('.tab-btn');

    // Estado
    let currentTab = 'users';

    async function loadUsers() {
        content.innerHTML = Loading();
        try {
            const users = await api.admin.getUsers();
            renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            content.innerHTML = `<div class="alert alert-danger">Error al cargar usuarios: ${error.message}</div>`;
        }
    }

    async function loadEvents() {
        content.innerHTML = Loading();
        try {
            const events = await api.admin.getAllEvents();
            renderEventsTable(events);
        } catch (error) {
            console.error('Error loading events:', error);
            content.innerHTML = `<div class="alert alert-danger">Error al cargar eventos: ${error.message}</div>`;
        }
    }

    async function loadTags() {
        content.innerHTML = Loading();
        try {
            const tags = await api.tags.getAll();
            renderTagsTable(tags);
        } catch (error) {
            console.error('Error loading tags:', error);
            content.innerHTML = `<div class="alert alert-danger">Error al cargar etiquetas: ${error.message}</div>`;
        }
    }

    function renderUsersTable(users) {
        if (!users || users.length === 0) {
            content.innerHTML = '<p class="text-center text-secondary">No hay usuarios registrados</p>';
            return;
        }

        const rows = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'Admin' ? 'badge-primary' : (user.role === 'Organizador' ? 'badge-warning' : 'badge-success')}">${user.role}</span></td>
                <td>${formatDateShort(user.created_at)}</td>
                <td>
                    ${user.role !== 'Admin' ? `
                        <button class="action-btn" onclick="handleDeleteUser('${user.id}', '${user.name}')">
                            Eliminar
                        </button>
                    ` : ''}
                </td>
            </tr>
    `).join('');

        content.innerHTML = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
    `;
    }

    function renderEventsTable(events) {
        if (!events || events.length === 0) {
            content.innerHTML = '<p class="text-center text-secondary">No hay eventos registrados</p>';
            return;
        }

        const rows = events.map(event => `
            <tr>
                <td>${event.name}</td>
                <td>${event.organizer_name}</td>
                <td>${formatDateShort(event.date)}</td>
                <td>${event.current_registrations} / ${event.max_capacity}</td>
                <td>
                    <button class="action-btn" onclick="handleDeleteEvent('${event.id}', '${event.name}')">
                        Eliminar
                    </button>
                </td>
            </tr>
    `).join('');

        content.innerHTML = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Organizador</th>
                            <th>Fecha</th>
                            <th>Inscritos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
    `;
    }

    function renderTagsTable(tags) {
        let rows = '';
        if (!tags || tags.length === 0) {
            rows = '<tr><td colspan="4" class="text-center text-secondary">No hay etiquetas creadas</td></tr>';
        } else {
            rows = tags.map(tag => `
                <tr>
                    <td>${tag.name}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 20px; height: 20px; border-radius: 4px; background-color: ${tag.color};"></div>
                            ${tag.color}
                        </div>
                    </td>
                    <td>${formatDateShort(tag.created_at)}</td>
                    <td>
                        <button class="action-btn" onclick="handleDeleteTag('${tag.id}', '${tag.name}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xl); flex-wrap: wrap; gap: 1rem;">
                <h3 style="margin: 0;">Etiquetas del Sistema</h3>
                <form id="create-tag-form" style="display: flex; gap: var(--space-sm); align-items: center;">
                    <input type="text" id="new-tag-name" placeholder="Nueva etiqueta" required class="form-input" style="width: auto; min-width: 150px;">
                    <input type="color" id="new-tag-color" value="#0044ff" required title="Color de la etiqueta" class="color-circle">
                    <button type="submit" class="btn btn-primary" style="padding: 8px 16px;">Añadir</button>
                </form>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Color</th>
                            <th>Creada</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('create-tag-form')?.addEventListener('submit', handleCreateTag);
    }

    // Lógica de cambio de pestañas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;

            if (currentTab === 'users') {
                loadUsers();
            } else if (currentTab === 'events') {
                loadEvents();
            } else if (currentTab === 'tags') {
                loadTags();
            }
        });
    });

    // Carga inicial
    loadUsers();

    // Controladores globales para botones
    window.handleDeleteUser = async (userId, userName) => {
        showConfirmModal(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`, async () => {
            try {
                await api.admin.deleteUser(userId);
                showToast('Usuario eliminado correctamente', 'success');
                loadUsers();
            } catch (error) {
                showToast('Error al eliminar usuario: ' + error.message, 'error');
            }
        });
    };

    window.handleDeleteEvent = async (eventId, eventName) => {
        showConfirmModal(`¿Estás seguro de que quieres eliminar el evento "${eventName}"?`, async () => {
            try {
                await api.admin.deleteEvent(eventId);
                showToast('Evento eliminado correctamente', 'success');
                loadEvents();
            } catch (error) {
                showToast('Error al eliminar evento: ' + error.message, 'error');
            }
        });
    };

    window.handleDeleteTag = async (tagId, tagName) => {
        showConfirmModal(`¿Estás seguro de que quieres eliminar la etiqueta "${tagName}"?`, async () => {
            try {
                await api.tags.delete(tagId);
                showToast('Etiqueta eliminada correctamente', 'success');
                loadTags();
            } catch (error) {
                showToast('Error al eliminar etiqueta: ' + error.message, 'error');
            }
        });
    };

    async function handleCreateTag(e) {
        e.preventDefault();
        const nameInput = document.getElementById('new-tag-name');
        const colorInput = document.getElementById('new-tag-color');

        const name = nameInput.value.trim();
        const color = colorInput.value;

        if (!name) return;

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Añadiendo...';
        btn.disabled = true;

        try {
            await api.tags.create({ name, color });
            showToast('Etiqueta creada correctamente', 'success');
            loadTags();
        } catch (error) {
            showToast('Error al crear etiqueta: ' + error.message, 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}
