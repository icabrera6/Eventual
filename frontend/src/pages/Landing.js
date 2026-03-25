// Página de inicio (landing) con hero animado, eventos destacados y pie de página

import { api } from '../config/api.js';
import { EventCard } from '../components/EventCard.js';

// Renderiza la landing con los 3 eventos más populares
export async function LandingPage() {
    // Obtener eventos populares para el slider
    let events = [];
    try {
        const response = await api.getEvents();
        // La API devuelve un array directamente, no {events: [...]}
        // Obtener los 6 eventos más registrados
        if (Array.isArray(response)) {
            events = response
                .sort((a, b) => b.current_registrations - a.current_registrations)
                .sort((a, b) => b.current_registrations - a.current_registrations)
                .slice(0, 3);
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }

    return `
        <div class="landing-page">
            <!-- Hero Section -->
            <section class="hero-section" id="hero-section">
                <canvas id="particles-canvas" class="particles-canvas"></canvas>
                <div class="hero-background"></div>
                <div class="mouse-glow" id="mouse-glow"></div>
                <div class="container">
                    <div class="hero-content">
                        <h1 class="hero-title">EVENTUAL</h1>
                        <p class="hero-subtitle">
                            La plataforma para gestionar tus eventos de forma sencilla
                        </p>
                        <div class="hero-actions">
                            <a href="#/register" class="btn btn-primary btn-lg">
                                Comenzar Gratis
                            </a>
                            <a href="#/login" class="btn btn-secondary btn-lg">
                                Iniciar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Events Slider Section -->
            <section class="events-section">
                <div class="container">
                    <h2 class="section-title">Eventos Destacados</h2>
                    <p class="section-subtitle text-secondary">
                        Explora los eventos más populares de nuestra plataforma
                    </p>
                    
                    <div class="events-grid">
                        ${events.length > 0 ? events.map(event => `
                            <div>
                                ${EventCard(event, {
        showActions: true,
        onView: true
    })}
                            </div>
                        `).join('') : `
                            <p class="text-center text-secondary">No hay eventos disponibles</p>
                        `}
                    </div>
                </div>
            </section>

            <!-- About Section -->
            <section class="about-section">
                <div class="container">
                    <div class="about-content">
                        <h2 class="section-title">Sobre Eventual</h2>
                        <p class="about-text">
                            Eventual es una plataforma diseñada para simplificar 
                            la gestión de eventos. Ya seas organizador o asistente, te ofrecemos 
                            las herramientas necesarias para crear experiencias memorables.
                        </p>
                        
                        <div class="features-grid">
                            <div class="feature-item card">
                                <span class="feature-icon">📅</span>
                                <h3>Gestión Completa</h3>
                                <p class="text-secondary">
                                    Crea y administra eventos con control total sobre aforo, 
                                    inscripciones y asistencia.
                                </p>
                            </div>
                            
                            <div class="feature-item card">
                                <span class="feature-icon">✨</span>
                                <h3>Diseño Elegante</h3>
                                <p class="text-secondary">
                                    Interfaz moderna y minimalista que prioriza la experiencia 
                                    del usuario.
                                </p>
                            </div>
                            
                            <div class="feature-item card">
                                <span class="feature-icon">📊</span>
                                <h3>Estadísticas en Tiempo Real</h3>
                                <p class="text-secondary">
                                    Monitorea el desempeño de tus eventos con métricas 
                                    actualizadas al instante.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="landing-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-brand">
                            <h3>EVENTUAL</h3>
                            <p class="text-secondary">Gestión de eventos para todos</p>
                        </div>
                        
                        <div class="footer-social">
                            <h4>Síguenos</h4>
                            <div class="social-links">
                                <a href="https://github.com/icabrera6" target="_blank" rel="noopener noreferrer" 
                                   class="social-link" aria-label="GitHub">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/in/icabrerar/" target="_blank" rel="noopener noreferrer" 
                                   class="social-link" aria-label="LinkedIn">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                </a>
                                <a href="mailto:icabrerar06@gmail.com" class="social-link" aria-label="Email">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer-legal">
                            <p class="text-secondary">
                                © 2026 Eventual. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        
    `;
}

// Inicializa efectos visuales: brillo del ratón, partículas y carga lazy de imágenes
export function attachLandingListeners() {
    // Efecto de brillo que sigue al ratón en la sección hero
    const heroSection = document.getElementById('hero-section');
    const mouseGlow = document.getElementById('mouse-glow');

    if (heroSection && mouseGlow) {
        let rafId = null;
        let mouseX = 0;
        let mouseY = 0;

        heroSection.addEventListener('mouseenter', () => {
            mouseGlow.classList.add('active');
        });

        heroSection.addEventListener('mouseleave', () => {
            mouseGlow.classList.remove('active');
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });

        heroSection.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!rafId) {
                rafId = requestAnimationFrame(updateMouseGlow);
            }
        });

        function updateMouseGlow() {
            const rect = heroSection.getBoundingClientRect();
            const x = ((mouseX - rect.left) / rect.width) * 100;
            const y = ((mouseY - rect.top) / rect.height) * 100;

            mouseGlow.style.background = `
                radial-gradient(
                    circle 800px at ${x}% ${y}%,
                    rgba(212, 175, 55, 0.15) 0%,
                    rgba(212, 175, 55, 0.08) 25%,
                    rgba(212, 175, 55, 0.03) 50%,
                    transparent 70%
                )
            `;

            rafId = null;
        }
    }

    // Sistema de partículas para la sección hero
    const particlesCanvas = document.getElementById('particles-canvas');
    const heroSectionForParticles = document.getElementById('hero-section');

    if (particlesCanvas && heroSectionForParticles) {
        const ctx = particlesCanvas.getContext('2d');
        let particles = [];
        let animationFrameId = null;
        let mousePos = { x: 0, y: 0 };
        const particleCount = 80;

        // Redimensionar canvas para coincidir con la sección hero
        function resizeCanvas() {
            const rect = heroSectionForParticles.getBoundingClientRect();
            particlesCanvas.width = rect.width;
            particlesCanvas.height = rect.height;
        }

        // Clase Partícula
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * particlesCanvas.height;
            }

            reset() {
                this.x = Math.random() * particlesCanvas.width;
                this.y = Math.random() * particlesCanvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Envolver alrededor de los bordes
                if (this.x < 0) this.x = particlesCanvas.width;
                if (this.x > particlesCanvas.width) this.x = 0;
                if (this.y < 0) this.y = particlesCanvas.height;
                if (this.y > particlesCanvas.height) this.y = 0;
            }

            draw() {
                // Calcular distancia al ratón
                const dx = mousePos.x - this.x;
                const dy = mousePos.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                // El brillo aumenta cuando el ratón está cerca
                let brightness = this.opacity;
                let size = this.size;

                if (distance < maxDistance) {
                    const influence = 1 - (distance / maxDistance);
                    brightness = this.opacity + (influence * 0.7);
                    size = this.size + (influence * 2);
                }

                // Dibujar partícula con color dorado
                ctx.beginPath();
                ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${brightness})`;
                ctx.shadowBlur = size * 2;
                ctx.shadowColor = `rgba(212, 175, 55, ${brightness * 0.8})`;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Dibujar líneas de conexión con partículas cercanas
                particles.forEach(particle => {
                    if (particle === this) return;

                    const dx2 = this.x - particle.x;
                    const dy2 = this.y - particle.y;
                    const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - dist / 100) * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(particle.x, particle.y);
                        ctx.stroke();
                    }
                });
            }
        }

        // Inicializar partículas
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        // Bucle de animación
        function animate() {
            ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        // Rastrear posición del ratón relativa al canvas
        heroSectionForParticles.addEventListener('mousemove', (e) => {
            const rect = particlesCanvas.getBoundingClientRect();
            mousePos.x = e.clientX - rect.left;
            mousePos.y = e.clientY - rect.top;
        });

        heroSectionForParticles.addEventListener('mouseleave', () => {
            mousePos.x = -1000;
            mousePos.y = -1000;
        });

        // Manejar redimensionamiento
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        // Iniciar animación
        resizeCanvas();
        initParticles();
        animate();

        // Limpieza al descargar
        window.addEventListener('beforeunload', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }

    // Carga lazy para imágenes
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        // El navegador soporta carga lazy de forma nativa
        images.forEach(img => {
            img.loading = 'lazy';
        });
    } else {
        // Alternativa para navegadores que no soportan carga lazy
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}
