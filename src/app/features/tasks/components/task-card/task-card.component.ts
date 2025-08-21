import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  templateUrl: './task-card.component.html',
  imports: [
    CommonModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatIconModule,
    TitleCasePipe,
    DatePipe
  ],
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() view = new EventEmitter<Task>();

  onEdit(): void {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task);
  }

  onView(): void {
    this.view.emit(this.task);
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
}
