import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  {
    path: 'logueo',
    loadChildren: () => import('./logueo/logueo.module').then(m => m.LogueoPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'reserva/:usuario/:fechaInicio/:fechaFin',
    loadChildren: () => import('./reserva/reserva.module').then(m => m.ReservaPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'horario',
    loadChildren: () => import('./disponibilidad/disponibilidad.module').then(m => m.DisponibilidadPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'servicios',
    loadChildren: () => import('./servicio/servicio.module').then(m => m.ServicioPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'personas',
    loadChildren: () => import('./persona/persona.module').then(m => m.PersonaPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuarios/usuarios.module').then( m => m.UsuariosPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
