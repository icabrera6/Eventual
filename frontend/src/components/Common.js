// Componentes comunes reutilizables (Modal, Loading, EmptyState, Alert)

// Genera el HTML de un modal con título, contenido y tamaño configurable
export function Modal(options = {}) {
    const {
        title = 'Modal',
        content = '',
        onClose = null,
        size = 'md' // pequeño, mediano, grande
    } = options;

    return `
        <div class="modal-overlay" id="modal-overlay">
            <div class="modal-content modal-${size}">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="btn btn-ghost btn-sm" id="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

// Muestra un modal y gestiona su cierre (botón o clic fuera)
export function showModal(options) {
    const modalHtml = Modal(options);
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Controladores de cierre
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    const closeModal = () => {
        modalContainer.remove();
        if (options.onClose) options.onClose();
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

// Muestra un spinner de carga
export function Loading() {
    return `
        <div class="loading-container">
            <div class="spinner"></div>
        </div>
    `;
}

// Muestra un estado vacío con icono y mensaje personalizable
export function EmptyState(message = 'No hay datos disponibles', icon = '📭') {
    return `
        <div class="empty-state">
            <div class="empty-icon">${icon}</div>
            <p class="empty-message">${message}</p>
        </div>
        
        <style>
            .empty-state {
                text-align: center;
                padding: var(--space-2xl) var(--space-md);
            }
            
            .empty-icon {
                font-size: 4rem;
                margin-bottom: var(--space-md);
                opacity: 0.5;
            }
            
            .empty-message {
                color: var(--text-muted);
                font-size: 1.125rem;
            }
        </style>
    `;
}

// Genera una alerta con tipo (éxito, peligro, info...) y opción de cerrar
export function Alert(options = {}) {
    const {
        type = 'info', // éxito, advertencia, peligro, info
        message = '',
        dismissible = true
    } = options;

    return `
        <div class="alert alert-${type} fade-in">
            <span>${message}</span>
            ${dismissible ? '<button class="alert-close" onclick="this.parentElement.remove()">✕</button>' : ''}
        </div>
        
        <style>
            .alert {
                padding: var(--space-md) var(--space-lg);
                border-radius: var(--radius-md);
                margin-bottom: var(--space-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--space-md);
            }
            
            .alert-success {
                background: hsla(142, 71%, 45%, 0.2);
                border: 1px solid var(--success);
                color: var(--text-primary);
            }
            
            .alert-warning {
                background: hsla(45, 100%, 51%, 0.2);
                border: 1px solid var(--warning);
                color: var(--text-primary);
            }
            
            .alert-danger {
                background: hsla(0, 84%, 60%, 0.2);
                border: 1px solid var(--danger);
                color: var(--text-primary);
            }
            
            .alert-info {
                background: hsla(200, 100%, 55%, 0.2);
                border: 1px solid var(--secondary);
                color: var(--text-primary);
            }
            
            .alert-close {
                background: transparent;
                border: none;
                color: var(--text-primary);
                font-size: 1.25rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
        </style>
    `;
}
