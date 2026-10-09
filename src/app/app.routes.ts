import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'recuperacion',
    loadComponent: () => import('./pages/recuperacion/recuperacion.page').then((m) => m.RecuperacionPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'tienda',
        loadComponent: () => import('./pages/tienda/tienda.page').then((m) => m.TiendaPage),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./pages/carrito/carrito.page').then((m) => m.CarritoPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: '',
        redirectTo: 'tienda',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'editar-perfil',
    loadComponent: () => import('./pages/configuracion/editar-perfil/editar-perfil.page').then( m => m.EditarPerfilPage)
  },
  {
    path: 'direccion',
    loadComponent: () => import('./pages/configuracion/direccion/direccion.page').then( m => m.DireccionPage)
  },
  {
    path: 'contrasena',
    loadComponent: () => import('./pages/configuracion/contrasena/contrasena.page').then( m => m.ContrasenaPage)
  },
  {
    path: 'metodo-pago',
    loadComponent: () => import('./pages/configuracion/metodo-pago/metodo-pago.page').then( m => m.MetodoPagoPage)
  },
  {
    path: 'cambiar-pregunta',
    loadComponent: () => import('./pages/configuracion/cambiar-pregunta/cambiar-pregunta.page').then( m => m.CambiarPreguntaPage)
  },
];