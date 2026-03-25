// Página de inicio alternativa con funcionalidades, roles y llamada a la acción

import { isAuthenticated } from '../utils/auth.js';

// Renderiza la página de inicio (redirige al dashboard si hay sesión)
export async function HomePage() {
    if (isAuthenticated()) {
        window.location.href = '/#/dashboard';
        return '';
    }

    return `
        <div class="home-page">
            <div class="home-hero">
                <div class="container">
                    <div class="hero-content">
                        <h1 class="hero-title fade-in">
                            Gestiona tus Eventos de Forma Profesional
                        </h1>
                        <p class="hero-subtitle slide-in-left">
                            La plataforma completa para crear, organizar y gestionar eventos educativos y corporativos
                        </p>
                        <div class="hero-actions">
                            <a href="#/register" class="btn btn-primary btn-lg">
                                Comenzar Ahora
                            </a>
                            <a href="#/login" class="btn btn-secondary btn-lg">
                                Iniciar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="home-features container">
                <h2 class="section-title">Funcionalidades Principales</h2>
                
                <div class="grid grid-3">
                    <div class="feature-card card">
                        <div class="feature-icon">📅</div>
                        <h3>Crear Eventos</h3>
                        <p class="text-muted">
                            Crea y publica eventos con toda la información necesaria: fecha, ubicación, aforo y descripción.
                        </p>
                    </div>
                    
                    <div class="feature-card card">
                        <div class="feature-icon">🎟️</div>
                        <h3>Gestionar Inscripciones</h3>
                        <p class="text-muted">
                            Control automático de aforo, inscripciones en tiempo real y gestión de asistentes.
                        </p>
                    </div>
                    
                    <div class="feature-card card">
                        <div class="feature-icon">✅</div>
                        <h3>Check-in Digital</h3>
                        <p class="text-muted">
                            Sistema de check-in para confirmar la asistencia de los participantes a tus eventos.
                        </p>
                    </div>
                    
                    <div class="feature-card card">
                        <div class="feature-icon">📊</div>
                        <h3>Estadísticas</h3>
                        <p class="text-muted">
                            Visualiza métricas de tus eventos: inscritos, asistencia y aforo en tiempo real.
                        </p>
                    </div>
                    
                    <div class="feature-card card">
                        <div class="feature-icon">👥</div>
                        <h3>Roles de Usuario</h3>
                        <p class="text-muted">
                            Sistema con roles diferenciados: organizadores y asistentes con permisos específicos.
                        </p>
                    </div>
                    
                    <div class="feature-card card">
                        <div class="feature-icon">🔒</div>
                        <h3>Seguro y Confiable</h3>
                        <p class="text-muted">
                            Autenticación segura con JWT y almacenamiento en AWS DynamoDB.
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="home-cta">
                <div class="container">
                    <div class="cta-content card">
                        <h2>¿Listo para comenzar?</h2>
                        <p class="text-muted">
                            Únete a Eventual y lleva la gestión de tus eventos al siguiente nivel
                        </p>
                        <a href="#/register" class="btn btn-primary btn-lg">
                            Crear Cuenta Gratis
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .home-hero {
                min-height: 80vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: var(--space-2xl) var(--space-md);
            }
            
            .hero-content {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .hero-title {
                font-size: 3.5rem;
                margin-bottom: var(--space-lg);
                color: var(--white);
                text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
                line-height: 1.2;
            }
            
            .hero-subtitle {
                font-size: 1.5rem;
                color: var(--text-secondary);
                margin-bottom: var(--space-2xl);
            }
            
            .hero-actions {
                display: flex;
                gap: var(--space-md);
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .home-features {
                padding: var(--space-2xl) var(--space-md);
            }
            
            .section-title {
                text-align: center;
                margin-bottom: var(--space-2xl);
                font-size: 2.5rem;
            }
            
            .feature-card {
                text-align: center;
            }
            
            .feature-icon {
                font-size: 3rem;
                margin-bottom: var(--space-md);
            }
            
            .feature-card h3 {
                margin-bottom: var(--space-sm);
            }
            
            .home-cta {
                padding: var(--space-2xl) var(--space-md);
            }
            
            .cta-content {
                text-align: center;
                padding: var(--space-2xl);
                max-width: 600px;
                margin: 0 auto;
            }
            
            .cta-content h2 {
                margin-bottom: var(--space-md);
            }
            
            .cta-content p {
                margin-bottom: var(--space-xl);
                font-size: 1.125rem;
            }
            
            @media (max-width: 768px) {
                .hero-title {
                    font-size: 2.5rem;
                }
                
                .hero-subtitle {
                    font-size: 1.125rem;
                }
            }
        </style>
    `;
}
