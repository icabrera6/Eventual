// Sistema de notificaciones: toasts y modales de confirmación
let toastContainer = null;

// Crea el contenedor de toasts si no existe
function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

// Muestra un toast con mensaje y tipo (success, error, info)
export function showToast(message, type = 'success') {
    const container = ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Activar animación
    setTimeout(() => toast.classList.add('show'), 10);

    // Eliminar automáticamente después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal de confirmación
export function showConfirmModal(message, onConfirm, onCancel = null) {
    // Eliminar cualquier modal existente
    const existing = document.getElementById('confirm-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirmación</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
                <button class="btn btn-primary" id="modal-confirm">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Activar animación
    setTimeout(() => modal.classList.add('show'), 10);

    // Manejar botones
    const confirmBtn = modal.querySelector('#modal-confirm');
    const cancelBtn = modal.querySelector('#modal-cancel');

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    confirmBtn.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });

    // Cerrar al hacer clic en el fondo
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    });
}

// Añadir estilos al documento
const styles = `
    .toast-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        min-width: 300px;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-icon {
        font-size: 20px;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .toast-success {
        border-left: 4px solid var(--success-color);
    }
    
    .toast-success .toast-icon {
        color: var(--success-color);
    }
    
    .toast-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .toast-error .toast-icon {
        color: var(--danger-color);
    }
    
    .toast-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .toast-info .toast-icon {
        color: var(--primary-color);
    }
    
    .toast-message {
        color: var(--text-primary);
        font-size: 14px;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .modal-overlay.show {
        opacity: 1;
    }
    
    .modal-overlay.show .modal-content {
        transform: scale(1);
    }
    
    .modal-content {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        max-width: 500px;
        width: 90%;
        box-shadow: var(--shadow-xl);
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .modal-header {
        padding: var(--space-lg);
        border-bottom: 1px solid var(--border-color);
    }
    
    .modal-header h3 {
        margin: 0;
        color: var(--text-primary);
        font-size: 20px;
    }
    
    .modal-body {
        padding: var(--space-xl);
    }
    
    .modal-body p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 16px;
        line-height: 1.6;
    }
    
    .modal-footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: var(--space-md);
        justify-content: flex-end;
    }
    
    @media (max-width: 768px) {
        .toast-container {
            left: 20px;
            right: 20px;
        }
        
        .toast {
            min-width: auto;
            width: 100%;
        }
    }
`;

// Inyectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
