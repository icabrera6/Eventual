// Página de inicio de sesión con validación y manejo de errores de Cognito

import { api, setUser } from '../config/api.js';
import { isAuthenticated } from '../utils/auth.js';
import { FormValidator, rules } from '../utils/validator.js';
import { showConfirmationForm } from './Register.js';

// Renderiza el formulario de login (redirige si ya hay sesión)
export async function LoginPage() {
    if (isAuthenticated()) {
        window.location.href = '/#/dashboard';
        return '';
    }

    return `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card card">
                    <div class="auth-header">
                        <h1>Iniciar Sesión</h1>
                        <p class="text-muted">Accede a tu cuenta de Event Manager</p>
                    </div>
                    
                    <div id="login-alert"></div>
                    
                    <form id="login-form" class="auth-form">
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
                                placeholder="••••••••"
                                required
                            />
                            <div class="form-error" id="password-error"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                            Iniciar Sesión
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p class="text-muted">
                            ¿No tienes cuenta? 
                            <a href="#/register">Regístrate aquí</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
    `;
}

// Gestiona el envío del formulario, valida campos y maneja los errores de Cognito
export function attachLoginListeners() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.toLowerCase();
        const password = document.getElementById('password').value;
        const alertDiv = document.getElementById('login-alert');

        // Limpiar errores anteriores
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

        // Validar
        const validator = new FormValidator();
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
            submitBtn.textContent = 'Iniciando sesión...';

            const response = await api.login({ email, password });

            // Guardar token y usuario
            if (response.newPasswordRequired) {
                // Manejar cambio de contraseña forzado (usuarios migrados)
                const newPass = prompt("⚠️ Tu cuenta ha sido migrada y requiere una nueva contraseña.\n\nPor favor, ingresa una nueva contraseña:");
                if (!newPass) throw new Error("Cambio de contraseña requerido");

                const resp2 = await api.completeNewPassword(response.cognitoUser, newPass);
                setUser(resp2.user);
            } else {
                setUser(response.user);
            }

            // Redirigir al dashboard
            window.location.href = '/#/dashboard';

        } catch (error) {
            // Manejar usuario no confirmado - mostrar formulario de confirmación
            if (error.code === 'UserNotConfirmedException') {
                const card = document.querySelector('.auth-card');
                if (card) {
                    // Reenviar código automáticamente
                    try {
                        await api.resendConfirmationCode(email);
                    } catch (resendErr) {
                        // Ignorar error de reenvío, el usuario puede reenviar manualmente
                    }
                    showConfirmationForm(card, email);
                }
                return;
            }

            let errorMsg = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            if (error.code === 'NotAuthorizedException') {
                errorMsg = 'Email o contraseña incorrectos.';
            } else if (error.code === 'UserNotFoundException') {
                errorMsg = 'No existe una cuenta con ese email.';
            }

            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ${errorMsg}
                </div>
            `;

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });
}
