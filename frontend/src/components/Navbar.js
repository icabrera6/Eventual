// Barra de navegación con menú responsivo y hamburguesa para móvil

import { isAuthenticated, getCurrentUser, logout, isOrganizer } from '../utils/auth.js';
import { showConfirmModal } from './Notifications.js';

// Genera el HTML del navbar según el estado de autenticación y rol del usuario
export function Navbar() {
    const isAuth = isAuthenticated();
    const user = getCurrentUser();
    const isOrg = user ? isOrganizer() : false;
    const isAdmin = user && user.role === 'Admin';
    const userName = user ? user.name : '';
    const userRole = user ? user.role : '';

    return `
        <nav class="navbar glass">
            <div class="container">
                <div class="navbar-content">
                    <div class="navbar-brand">
                        <a href="#/" class="brand-link"><h2>EVENTUAL</h2></a>
                    </div>
                    
                    <button class="hamburger" id="hamburger-btn" aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    
                    <div class="navbar-menu" id="navbar-menu">
                        ${isAuth ? `
                            <a href="#/dashboard" class="nav-link">Explorar Eventos</a>
                            ${isOrg ? `<a href="#/my-events" class="nav-link">Mis Eventos</a>` : ''}
                            ${isAdmin ? `<a href="#/admin" class="nav-link">Panel Admin</a>` : ''}
                            <a href="#/my-registrations" class="nav-link">Mis Inscripciones</a>
                            
                            <div class="navbar-user">
                                <span class="user-name">${userName}</span>
                                <span class="badge ${isOrg ? 'badge-primary' : 'badge-success'}">${userRole}</span>
                                <button class="btn btn-ghost btn-sm" id="logout-btn">
                                    Salir
                                </button>
                            </div>
                        ` : `
                            <a href="#/login" class="btn btn-ghost btn-sm">Iniciar Sesión</a>
                            <a href="#/register" class="btn btn-primary btn-sm">Registrarse</a>
                        `}
                    </div>
                </div>
            </div>
        </nav>
        
        <style>
            .navbar {
                position: sticky;
                top: 0;
                z-index: 100;
                padding: var(--space-md) 0;
                margin-bottom: var(--space-xl);
            }
            
            .navbar-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--space-lg);
            }
            
            .navbar-brand h2 {
                margin: 0;
                color: var(--primary);
                font-weight: 800;
            }
            
            .brand-link {
                text-decoration: none;
                cursor: pointer;
                transition: all var(--transition-base);
            }
            
            .brand-link:hover h2 {
                color: var(--primary-light);
                text-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
            }
            
            .navbar-menu {
                display: flex;
                align-items: center;
                gap: var(--space-lg);
            }
            
            .nav-link {
                color: var(--text-secondary);
                font-weight: 600;
                transition: color var(--transition-fast);
            }
            
            .nav-link:hover {
                color: var(--text-primary);
            }
            
            .navbar-user {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                padding-left: var(--space-lg);
                border-left: 1px solid var(--border);
            }
            
            .user-name {
                font-weight: 600;
            }
            
            /* Botón hamburguesa - oculto en escritorio */
            .hamburger {
                display: none;
                flex-direction: column;
                gap: 6px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
                z-index: 101;
            }
            
            .hamburger span {
                display: block;
                width: 28px;
                height: 3px;
                background: var(--primary);
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            
            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(8px, 8px);
            }
            
            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -7px);
            }
            
            /* Estilos móvil */
            @media (max-width: 768px) {
                .hamburger {
                    display: flex;
                }
                
                .navbar-menu {
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100vh;
                    width: 280px;
                    max-width: 85vw;
                    background: rgba(10, 10, 15, 0.98);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-left: 1px solid var(--border);
                    flex-direction: column;
                    align-items: flex-start;
                    padding: 80px 24px 24px;
                    transform: translateX(100%);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow-y: auto;
                    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
                }
                
                .navbar-menu.active {
                    transform: translateX(0);
                }
                
                .nav-link {
                    width: 100%;
                    padding: 12px 0;
                    font-size: 1.1rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .navbar-user {
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                    border-left: none;
                    padding-left: 0;
                    padding-top: var(--space-md);
                    margin-top: var(--space-md);
                    border-top: 1px solid var(--border);
                    gap: var(--space-md);
                }
                
                .navbar-user .btn {
                    width: 100%;
                }
                
                /* Fondo oscuro cuando el menú está abierto */
                .navbar-menu.active::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 280px;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: -1;
                }
            }
        </style>
    `;
}

// Vincula los eventos del navbar (cierre de sesión, hamburguesa, clic fuera)
export function attachNavbarListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    const hamburger = document.getElementById('hamburger-btn');
    const navbarMenu = document.getElementById('navbar-menu');

    // Funcionalidad de cierre de sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showConfirmModal('¿Estás seguro de que quieres cerrar sesión?', () => {
                logout();
                window.location.href = '/#/login';
            });
        });
    }

    // Botón de menú hamburguesa
    if (hamburger && navbarMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navbarMenu.querySelectorAll('.nav-link, .btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (navbarMenu.classList.contains('active') &&
                !navbarMenu.contains(e.target) &&
                !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        });

        // Cerrar menú al redimensionar a escritorio
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        });
    }
}
