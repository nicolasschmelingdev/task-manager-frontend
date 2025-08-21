import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TitleCasePipe
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  loading = true;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
    } else {
      this.error = 'No task ID provided';
      this.loading = false;
    }
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
        console.error('Error loading task:', err);
        this.error = 'Failed to load task details. Please try again.';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onEdit(): void {
    if (this.task) {
      this.router.navigate(['/tasks', this.task.id, 'edit']);
    }
  }

  onDelete(): void {
    if (this.task && confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.taskService.deleteTask(this.task.id!).subscribe({
        next: () => {
          this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          this.snackBar.open('Failed to delete task. Please try again.', 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
          this.loading = false;
        }
      });
    }
  }

  getStatusClass(status: TaskStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusIcon(status: TaskStatus): string {
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

  formatDate(dateInput: Date | string | undefined): string {
    if (!dateInput) return 'N/A';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleString();
  }
}
