import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskFormComponent } from './pages/task-form/task-form.component';
import { TaskDetailComponent } from './pages/task-detail/task-detail.component';
import { TaskKanbanComponent } from './pages/task-kanban/task-kanban.component';

const routes: Routes = [
  { 
    path: '', 
    component: TaskListComponent,
    pathMatch: 'full'
  },
  {
    path: 'kanban',
    component: TaskKanbanComponent
  },
  { 
    path: 'new', 
    component: TaskFormComponent,
    data: { isEditMode: false }
  },
  { 
    path: ':id', 
    component: TaskDetailComponent 
  },
  { 
    path: ':id/edit', 
    component: TaskFormComponent,
    data: { isEditMode: true }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    
    // Material Modules
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    
    // Feature Components
    TaskListComponent,
    TaskFormComponent,
    TaskDetailComponent,
    TaskKanbanComponent
  ]
})
export class TasksModule { }
