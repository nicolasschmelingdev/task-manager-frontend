import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Task, TaskListResponse, TaskRequestParams, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDetailDialogComponent } from '../../components/task-detail-dialog/task-detail-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    RouterModule,
    TruncatePipe,
    DatePipe
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  tasks: Task[] = [];
  loading = false;
  error: string | null = null;
  selectedRowIndex: string | null = null;
  statusFilter: TaskStatus | '' = '';
  searchQuery: string = '';
  totalItems = 0;
  pageIndex = 0;
  pageSize = 10;
  displayedColumns: string[] = ['title', 'status', 'updatedAt', 'updatedBy', 'actions'];
  currentTaskForMenu: Task | null = null;
  
  // Sorting
  sortField = 'updatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Make TaskStatus enum available in template
  TaskStatus = TaskStatus;

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Rehidratar filtros/ordenação/paginação da URL
    const qp = this.route.snapshot.queryParamMap;
    const search = qp.get('search');
    const status = qp.get('status') as TaskStatus | '' | null;
    const page = qp.get('page');
    const size = qp.get('size');
    const sort = qp.get('sort'); // formato: field,direction

    if (search) this.searchQuery = search;
    if (status === TaskStatus.PENDING || status === TaskStatus.IN_PROGRESS || status === TaskStatus.COMPLETED || status === '') {
      this.statusFilter = (status as TaskStatus) || '';
    }
    if (page && !isNaN(+page)) this.pageIndex = Math.max(0, +page);
    if (size && !isNaN(+size)) this.pageSize = Math.max(1, +size);
    if (sort && sort.includes(',')) {
      const [field, direction] = sort.split(',');
      this.sortField = field || this.sortField;
      this.sortDirection = (direction === 'asc' || direction === 'desc') ? direction : this.sortDirection;
    }

    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';

    const params: TaskRequestParams = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: `${this.sortField},${this.sortDirection}`,
      ...(this.statusFilter && { status: this.statusFilter as TaskStatus }),
      ...(this.searchQuery && { search: this.searchQuery })
    };

    this.taskService.getTasks(params)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: TaskListResponse) => {
          this.tasks = response.content;
          this.totalItems = response.totalElements;
          
          // Reset selected row when data changes
          this.selectedRowIndex = null;
        },
        error: (error) => {
          this.error = 'Falha ao carregar as tarefas. Tente novamente.';
          console.error('Error loading tasks:', error);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateQueryParams();
    this.loadTasks();
  }

  onSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this.sortField = sortState.active;
      this.sortDirection = sortState.direction;
    } else {
      this.sortField = 'createdAt';
      this.sortDirection = 'desc';
    }
    this.updateQueryParams();
    this.loadTasks();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0; // Reset to first page
    this.updateQueryParams();
    this.loadTasks();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.updateQueryParams();
    this.loadTasks();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.pageIndex = 0;
    this.updateQueryParams();
    this.loadTasks();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.pageIndex = 0;
    this.updateQueryParams();
    this.loadTasks();
  }

  onRowClick(task: Task): void {
    this.selectedRowIndex = task.id ?? null;
    // Optionally add any additional row click behavior here
  }

  /**
   * Confirm task deletion with a dialog
   * @param task The task to delete
   */
  confirmDelete(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Excluir tarefa',
        message: `Tem certeza que deseja excluir "${task.title}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTask(task);
      }
    });
  }

  /**
   * Delete a task
   * @param task The task to delete
   */
  private deleteTask(task: Task): void {
    if (!task.id) {
      this.snackBar.open('Não é possível excluir: ID da tarefa inválido', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    this.taskService.deleteTask(task.id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.snackBar.open('Tarefa excluída com sucesso', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadTasks(); // Refresh the task list
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        const errorMessage = error.error?.message || 'Ocorreu um erro ao excluir a tarefa';
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Opens the create task dialog
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      data: { task: null },
      panelClass: 'task-form-dialog'
    });

    dialogRef.afterClosed().subscribe((result: { success: boolean; task: Task } | undefined) => {
      if (result?.success) {
        // If task was created successfully, reload the task list
        this.loadTasks();
        
        // Show success message
        this.snackBar.open('Tarefa criada com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  /**
   * Opens the edit task dialog
   * @param task The task to edit
   */
  editTask(task: Task): void {
    if (!task?.id) {
      this.snackBar.open('Não foi possível editar. ID da tarefa ausente.', 'Fechar', {
        duration: 3000,
        panelClass: 'error-snackbar',
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }
    
    // Open the task form in edit mode
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      data: { task },
      panelClass: 'task-form-dialog'
    });

    dialogRef.afterClosed().subscribe((result: { success: boolean; task: Task } | undefined) => {
      if (result?.success) {
        // If task was updated successfully, reload the task list
        this.loadTasks();
        
        // Show success message
        this.snackBar.open('Tarefa atualizada com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  viewTask(task: Task): void {
    if (task && task.id) {
      this.dialog.open(TaskDetailDialogComponent, {
        width: '700px',
        maxWidth: '95vw',
        data: { taskId: task.id },
        autoFocus: false,
        panelClass: 'task-detail-dialog'
      });
    } else {
      this.snackBar.open('Não foi possível abrir os detalhes. ID ausente.', 'Fechar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
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

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'Concluída';
      case TaskStatus.IN_PROGRESS:
        return 'Em andamento';
      case TaskStatus.PENDING:
        return 'Pendente';
      default:
        return '';
    }
  }

  private updateQueryParams(): void {
    const queryParams: Record<string, string | number> = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: `${this.sortField},${this.sortDirection}`
    };
    if (this.searchQuery) queryParams['search'] = this.searchQuery;
    if (this.statusFilter) queryParams['status'] = this.statusFilter;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
