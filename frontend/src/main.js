// Punto de entrada de la aplicación: importa estilos, configura el router SPA y define las rutas

import './style.css';
import './styles/Landing.css';
import './styles/Auth.css';
import './styles/Dashboard.css';
import './styles/Admin.css';
import { Navbar, attachNavbarListeners } from './components/Navbar.js';


// Router SPA simple
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  async navigate(path) {
    // Extraer parámetros dinámicos (ej: /event/:id)
    let handler = null;
    let params = {};

    for (const routePath in this.routes) {
      const routeParts = routePath.split('/');
      const pathParts = path.split('/');

      if (routeParts.length === pathParts.length) {
        let match = true;
        const tempParams = {};

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            const paramName = routeParts[i].slice(1);
            tempParams[paramName] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          handler = this.routes[routePath];
          params = tempParams;
          break;
        }
      }
    }

    if (!handler) {
      handler = this.routes['/'] || (() => '<h1>404 - Page Not Found</h1>');
    }

    this.currentRoute = path;
    await this.render(handler, params);
  }

  async render(handler, params = {}) {
    const app = document.getElementById('app');

    try {
      // Renderizar contenido de la página
      const result = await handler(params);
      console.log('Handler Result:', result);
      console.log('Navbar result:', Navbar());
      console.log('Is Navbar promise?', Navbar() instanceof Promise);

      let content = result;
      let onMount = null;

      // Soporte para retorno de objeto { html, onMount }
      if (typeof result === 'object' && result !== null && result.html !== undefined) {
        content = result.html;
        if (content instanceof Promise) {
          content = await content;
        }
        onMount = result.onMount;
      }

      app.innerHTML = Navbar() + content;

      // Vincular listeners del navbar
      attachNavbarListeners();

      // Vincular listeners de la página
      if (onMount) {
        onMount();
      }

    } catch (error) {
      console.error('Error rendering page:', error);
      app.innerHTML = `
                <div class="container" style="padding: var(--space-xl);">
                    <div class="alert alert-danger">
                        Error al cargar la página. Por favor, intenta de nuevo.
                    </div>
                </div>
            `;
    }
  }
}

// Inicializar router
const router = new Router();

// Definir rutas con carga lazy
router.addRoute('/', async () => {
  const { LandingPage, attachLandingListeners } = await import('./pages/Landing.js');
  return {
    html: LandingPage(),
    onMount: attachLandingListeners
  };
});

router.addRoute('/login', async () => {
  const { LoginPage, attachLoginListeners } = await import('./pages/Login.js');
  return {
    html: LoginPage(),
    onMount: attachLoginListeners
  };
});

router.addRoute('/register', async () => {
  const { RegisterPage, attachRegisterListeners } = await import('./pages/Register.js');
  return {
    html: RegisterPage(),
    onMount: attachRegisterListeners
  };
});

router.addRoute('/dashboard', async () => {
  const { DashboardPage, attachDashboardListeners } = await import('./pages/Dashboard.js');
  return {
    html: DashboardPage(),
    onMount: attachDashboardListeners
  };
});

router.addRoute('/create-event', async () => {
  const { CreateEventPage, attachCreateEventListeners } = await import('./pages/CreateEvent.js');
  return {
    html: CreateEventPage(),
    onMount: attachCreateEventListeners
  };
});

router.addRoute('/my-events', async () => {
  const { MyEventsPage, attachMyEventsListeners } = await import('./pages/MyEvents.js');
  return {
    html: MyEventsPage(),
    onMount: attachMyEventsListeners
  };
});

router.addRoute('/my-registrations', async () => {
  const { MyRegistrationsPage, attachMyRegistrationsListeners } = await import('./pages/MyRegistrations.js');
  return {
    html: MyRegistrationsPage(),
    onMount: attachMyRegistrationsListeners
  };
});

router.addRoute('/event/:id', async (params) => {
  const { EventDetailPage, attachEventDetailListeners } = await import('./pages/EventDetail.js');
  return {
    html: EventDetailPage(params.id),
    onMount: () => attachEventDetailListeners(params.id)
  };
});

router.addRoute('/edit-event/:id', async (params) => {
  const { EditEventPage, attachEditEventListeners } = await import('./pages/EditEvent.js');
  return {
    html: await EditEventPage(params.id),
    onMount: () => attachEditEventListeners(params.id)
  };
});

router.addRoute('/admin', async () => {
  const { AdminDashboardPage, attachAdminListeners } = await import('./pages/AdminDashboard.js');
  return {
    html: AdminDashboardPage(),
    onMount: attachAdminListeners
  };
});

// Manejar cambios de hash
window.addEventListener('hashchange', () => {
  const path = window.location.hash.slice(1) || '/';
  router.navigate(path);
});

// Manejar carga inicial
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.hash.slice(1) || '/';
  router.navigate(path);
});

// Exportar router para uso externo
window.router = router;
