import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-table',
  standalone: true,
  templateUrl: './task-table.component.html',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    TitleCasePipe,
    DatePipe
  ],
  styleUrls: ['./task-table.component.scss']
})
export class TaskTableComponent {
  @Input() tasks: Task[] = [];
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() loading = false;
  
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() view = new EventEmitter<Task>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'status', 'updatedAt', 'updatedBy', 'actions'];
  dataSource = new MatTableDataSource<Task>();

  ngOnChanges(): void {
    this.dataSource.data = this.tasks;
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sortState: Sort): void {
    this.sortChange.emit(sortState);
  }

  onEdit(task: Task): void {
    this.edit.emit(task);
  }

  onDelete(task: Task): void {
    this.delete.emit(task);
  }

  onView(task: Task): void {
    this.view.emit(task);
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
