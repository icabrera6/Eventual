// Página de registro con validación, confirmación por código y reenvío

import { api } from '../config/api.js';
import { isAuthenticated } from '../utils/auth.js';
import { FormValidator, rules } from '../utils/validator.js';

// Renderiza el formulario de registro (redirige si ya hay sesión)
export async function RegisterPage() {
    if (isAuthenticated()) {
        window.location.href = '/#/dashboard';
        return '';
    }

    return `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card card">
                    <div class="auth-header">
                        <h1>Crear Cuenta</h1>
                        <p class="text-muted">Únete a Event Manager</p>
                    </div>
                    
                    <div id="register-alert"></div>
                    
                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <label class="form-label">Nombre Completo</label>
                            <input 
                                type="text" 
                                class="form-input" 
                                id="name" 
                                name="name"
                                placeholder="Juan Pérez"
                                required
                            />
                            <div class="form-error" id="name-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input 
                                type="email" 
                                class="form-input" 
                                id="email" 
                                name="email"
                                placeholder="tu@email.com"
                                required
                            />
                            <div class="form-error" id="email-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Contraseña</label>
                            <input 
                                type="password" 
                                class="form-input" 
                                id="password" 
                                name="password"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <div class="form-error" id="password-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Rol</label>
                            <select class="form-select" id="role" name="role" required>
                                <option value="Asistente">Asistente - Ver y registrarme en eventos</option>
                                <option value="Organizador">Organizador - Crear y gestionar eventos</option>
                            </select>
                            <div class="form-error" id="role-error"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                            Crear Cuenta
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p class="text-muted">
                            ¿Ya tienes cuenta? 
                            <a href="#/login">Inicia sesión aquí</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Muestra el formulario de confirmación de email con campo para el código de 6 dígitos
function showConfirmationForm(container, email) {
    container.innerHTML = `
        <div class="auth-header">
            <div style="font-size: 3rem; margin-bottom: var(--space-md);">📧</div>
            <h1>Confirma tu Email</h1>
            <p class="text-muted">
                Hemos enviado un código de verificación de 6 dígitos a
                <br><strong>${email}</strong>
            </p>
        </div>

        <div id="confirm-alert"></div>

        <form id="confirm-form" class="auth-form">
            <div class="form-group">
                <label class="form-label">Código de Verificación</label>
                <input 
                    type="text" 
                    class="form-input" 
                    id="confirmation-code" 
                    name="code"
                    placeholder="123456"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;"
                    required
                />
                <div class="form-error" id="code-error"></div>
            </div>
            
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                Confirmar Email
            </button>
        </form>

        <div class="auth-footer">
            <p class="text-muted">
                ¿No recibiste el código? 
                <a href="#" id="resend-code-btn">Reenviar código</a>
            </p>
            <p id="resend-status" style="margin-top: var(--space-sm);"></p>
        </div>
    `;

    attachConfirmationListeners(email);
}

// Vincula los eventos del formulario de confirmación y botón de reenvío
function attachConfirmationListeners(email) {
    const confirmForm = document.getElementById('confirm-form');
    const resendBtn = document.getElementById('resend-code-btn');

    if (confirmForm) {
        confirmForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const code = document.getElementById('confirmation-code').value.trim();
            const alertDiv = document.getElementById('confirm-alert');
            const codeError = document.getElementById('code-error');

            // Limpiar errores
            if (codeError) codeError.textContent = '';
            if (alertDiv) alertDiv.innerHTML = '';

            if (!code || code.length !== 6) {
                if (codeError) codeError.textContent = 'Introduce el código de 6 dígitos';
                return;
            }

            const submitBtn = confirmForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verificando...';

            try {
                await api.confirmEmail(email, code);

                // Mostrar éxito y redirigir
                const card = document.querySelector('.auth-card');
                if (card) {
                    card.innerHTML = `
                        <div class="text-center" style="padding: var(--space-xl) 0;">
                            <div style="font-size: 3rem; margin-bottom: var(--space-md);">✅</div>
                            <h3 style="margin-bottom: var(--space-md);">¡Email Confirmado!</h3>
                            <p class="text-muted" style="margin-bottom: var(--space-lg);">
                                Tu cuenta ha sido verificada correctamente.
                                <br>Ya puedes iniciar sesión.
                            </p>
                            <a href="#/login" class="btn btn-primary">
                                Ir a Iniciar Sesión
                            </a>
                        </div>
                    `;
                }
            } catch (error) {
                let errorMsg = 'Error al verificar el código.';
                if (error.code === 'CodeMismatchException') {
                    errorMsg = 'El código es incorrecto. Inténtalo de nuevo.';
                } else if (error.code === 'ExpiredCodeException') {
                    errorMsg = 'El código ha expirado. Solicita uno nuevo.';
                } else if (error.message) {
                    errorMsg = error.message;
                }

                if (alertDiv) {
                    alertDiv.innerHTML = `<div class="alert alert-danger">${errorMsg}</div>`;
                }

                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar Email';
            }
        });
    }

    if (resendBtn) {
        resendBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const statusEl = document.getElementById('resend-status');
            resendBtn.style.pointerEvents = 'none';
            resendBtn.style.opacity = '0.5';

            try {
                await api.resendConfirmationCode(email);
                if (statusEl) {
                    statusEl.innerHTML = '<span style="color: var(--accent);">✅ Código reenviado a tu email</span>';
                }
            } catch (error) {
                if (statusEl) {
                    statusEl.innerHTML = `<span style="color: var(--danger);">❌ ${error.message || 'Error al reenviar'}</span>`;
                }
            }

            // Cooldown 30s
            let seconds = 30;
            resendBtn.textContent = `Reenviar código (${seconds}s)`;
            const interval = setInterval(() => {
                seconds--;
                resendBtn.textContent = `Reenviar código (${seconds}s)`;
                if (seconds <= 0) {
                    clearInterval(interval);
                    resendBtn.textContent = 'Reenviar código';
                    resendBtn.style.pointerEvents = '';
                    resendBtn.style.opacity = '';
                    if (statusEl) statusEl.innerHTML = '';
                }
            }, 1000);
        });
    }
}

// Gestiona el envío del formulario de registro y la validación de campos
export function attachRegisterListeners() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value.toLowerCase();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const alertDiv = document.getElementById('register-alert');

        // Limpiar errores anteriores
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

        // Validar
        const validator = new FormValidator();
        validator.validate('name', name, [rules.required, rules.minLength(3)]);
        validator.validate('email', email, [rules.required, rules.email]);
        validator.validate('password', password, [rules.required, rules.password]);

        if (!validator.isValid()) {
            const errors = validator.getAllErrors();
            Object.keys(errors).forEach(field => {
                const errorEl = document.getElementById(`${field}-error`);
                if (errorEl) errorEl.textContent = errors[field][0];
            });
            return;
        }

        try {
            // Deshabilitar botón de envío
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando cuenta...';

            await api.register({ name, email, password, role });

            // Mostrar formulario de código de confirmación
            const card = document.querySelector('.auth-card');
            if (card) {
                showConfirmationForm(card, email);
            }

        } catch (error) {
            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message || 'Error al crear la cuenta. El email podría estar registrado.'}
                </div>
            `;

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    });
}

// Exportar para uso en Login.js
export { showConfirmationForm };
