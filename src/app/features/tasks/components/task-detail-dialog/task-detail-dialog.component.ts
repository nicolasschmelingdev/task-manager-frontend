import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

export interface TaskDetailDialogData {
  taskId: string;
}

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './task-detail-dialog.component.html',
  styleUrls: ['./task-detail-dialog.component.scss']
})
export class TaskDetailDialogComponent implements OnInit {
  task: Task | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TaskDetailDialogData,
    private dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.data?.taskId) {
      this.error = 'ID da tarefa não informado.';
      this.loading = false;
      return;
    }
    this.loadTask(this.data.taskId);
  }

  private loadTask(id: string): void {
    this.loading = true;
    this.error = null;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tarefa:', err);
        this.error = 'Falha ao carregar detalhes da tarefa. Tente novamente.';
        this.loading = false;
        this.snackBar.open(this.error, 'Fechar', { duration: 4000, panelClass: 'error-snackbar' });
      }
    });
  }

  getStatusIcon(status: TaskStatus | undefined): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'pending_actions';
      case TaskStatus.IN_PROGRESS:
        return 'hourglass_bottom';
      case TaskStatus.COMPLETED:
        return 'check_circle_outline';
      default:
        return 'help_outline';
    }
  }

  getStatusLabel(status: TaskStatus | undefined): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pendente';
      case TaskStatus.IN_PROGRESS:
        return 'Em andamento';
      case TaskStatus.COMPLETED:
        return 'Concluída';
      default:
        return '';
    }
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
