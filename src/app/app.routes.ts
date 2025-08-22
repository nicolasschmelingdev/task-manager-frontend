import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'tasks', 
    canActivate: [authGuard],
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule)
  },
  { path: '**', redirectTo: '/tasks' }
];
