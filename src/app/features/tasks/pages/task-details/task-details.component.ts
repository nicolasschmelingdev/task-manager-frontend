import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { finalize } from 'rxjs/operators';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-task-details',
  standalone: true,
  templateUrl: './task-details.component.html',
  imports: [
    CommonModule,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatCard,
    MatCardContent,
    MatIcon,
    MatProgressSpinner,
    TitleCasePipe,
    DatePipe
  ],
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit {
  task: Task | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
    }
  }

  loadTask(id: string): void {
    this.loading = true;
    this.error = '';

    this.taskService.getTask(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (task) => {
          this.task = task;
        },
        error: (err) => {
          this.error = 'Failed to load task details. Please try again later.';
          console.error('Error loading task:', err);
        }
      });
  }

  openEditDialog(): void {
    if (!this.task) return;

    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { task: this.task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved' && this.task) {
        this.loadTask(this.task.id!);
      }
    });
  }

  deleteTask(): void {
    if (!this.task || !confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.loading = true;
    this.taskService.deleteTask(this.task.id!)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open('Task deleted successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          this.snackBar.open('Failed to delete task. Please try again.', 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'status-completed';
      case TaskStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TaskStatus.PENDING:
        return 'status-pending';
      default:
        return '';
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}
