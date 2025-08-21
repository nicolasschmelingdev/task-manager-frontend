import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskDetailDialogComponent } from '../../components/task-detail-dialog/task-detail-dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-kanban',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DragDropModule,
    MatDialogModule
  ],
  templateUrl: './task-kanban.component.html',
  styleUrls: ['./task-kanban.component.scss']
})
export class TaskKanbanComponent implements OnInit {
  loading = false;
  error: string | null = null;

  pending: Task[] = [];
  inProgress: Task[] = [];
  completed: Task[] = [];

  TaskStatus = TaskStatus;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    this.taskService.getTasks({ page: 0, size: 1000 })
      .subscribe({
        next: (resp) => {
          const tasks = resp.content || [];
          this.pending = tasks.filter(t => t.status === TaskStatus.PENDING);
          this.inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
          this.completed = tasks.filter(t => t.status === TaskStatus.COMPLETED);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar tarefas:', err);
          this.error = 'Falha ao carregar tarefas. Tente novamente.';
          this.loading = false;
        }
      });
  }

  drop(event: CdkDragDrop<Task[]>, newStatus?: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    if (!item) return;

    // Atualiza visualmente imediatamente
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    if (newStatus && item.id) {
      const prevStatus = item.status;
      item.status = newStatus;
      this.taskService.updateTask(item.id, { status: newStatus }).subscribe({
        next: () => {
          this.snackBar.open('Status atualizado', 'Fechar', { duration: 2000 });
        },
        error: (err) => {
          console.error('Falha ao atualizar status:', err);
          // Reverte visualmente em caso de erro
          item.status = prevStatus;
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.snackBar.open('Erro ao atualizar status', 'Fechar', { duration: 3000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'Pendente';
      case TaskStatus.IN_PROGRESS: return 'Em andamento';
      case TaskStatus.COMPLETED: return 'Concluída';
      default: return '';
    }
  }

  openDetails(task: Task): void {
    if (!task.id) return;
    this.dialog.open(TaskDetailDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { taskId: task.id },
      autoFocus: false,
      panelClass: 'task-detail-dialog'
    });
  }

  openCreate(status: TaskStatus): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { isEditMode: false, presetStatus: status }
    });

    dialogRef.afterClosed().subscribe((created: Task | undefined) => {
      if (created) {
        // Se o formulário não setar status, garantimos aqui
        const s = created.status ?? status;
        created.status = s;
        if (s === TaskStatus.PENDING) this.pending = [created, ...this.pending];
        else if (s === TaskStatus.IN_PROGRESS) this.inProgress = [created, ...this.inProgress];
        else if (s === TaskStatus.COMPLETED) this.completed = [created, ...this.completed];
        this.snackBar.open('Tarefa criada', 'Fechar', { duration: 2500 });
      }
    });
  }
}
