import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Task, TaskListResponse, TaskRequestParams, TaskStatus } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = `${environment.apiBaseUrl}/tasks`;
  private tasks: Task[] = [
    {
      id: '1',
      title: 'Complete project setup',
      description: 'Set up the project structure and dependencies',
      status: TaskStatus.COMPLETED,
      createdAt: new Date('2025-08-15'),
      updatedAt: new Date('2025-08-16'),
      updatedBy: 'admin@example.com'
    },
    {
      id: '2',
      title: 'Implement task list',
      description: 'Create task list component with sorting and pagination',
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date('2025-08-16'),
      updatedAt: new Date('2025-08-17'),
      updatedBy: 'dev@example.com'
    },
    {
      id: '3',
      title: 'Add task creation form',
      description: 'Implement form for creating new tasks',
      status: TaskStatus.PENDING,
      createdAt: new Date('2025-08-17'),
      updatedAt: new Date('2025-08-17'),
      updatedBy: 'dev@example.com'
    }
  ];

  constructor(private http: HttpClient) {}

  getTasks(params: TaskRequestParams): Observable<TaskListResponse> {
    if (environment.mockApi) {
      const { page = 0, size = 10, sort, status, search } = params;
      let filteredTasks = [...this.tasks];

      // Apply status filter when provided
      if (status) {
        filteredTasks = filteredTasks.filter(t => t.status === status);
      }

      // Apply search filter on title or description (case-insensitive)
      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
          (t.title ?? '').toLowerCase().includes(term) ||
          (t.description ?? '').toLowerCase().includes(term)
        );
      }

      if (sort) {
        const [field, direction] = sort.split(',');
        filteredTasks.sort((a, b) => {
          const aValue = a[field as keyof Task];
          const bValue = b[field as keyof Task];
          if (aValue === undefined || bValue === undefined) return 0;
          if (aValue < bValue) return direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      const startIndex = page * size;
      const paginatedTasks = filteredTasks.slice(startIndex, startIndex + size);

      return of({
        content: paginatedTasks,
        totalElements: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / size),
        size: size,
        number: page
      }).pipe(delay(300));
    }

    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 10));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(
        map(res => ({
          content: (res.content ?? []).map((t: any) => this.toTask(t)),
          totalElements: res.totalElements ?? 0,
          totalPages: res.totalPages ?? 0,
          size: res.size ?? (params.size ?? 10),
          number: res.number ?? (params.page ?? 0)
        }))
      );
  }

  getTask(id: string): Observable<Task> {
    if (environment.mockApi) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) {
        return throwError(() => new Error('Task not found'));
      }
      return of({ ...task }).pipe(delay(200));
    }
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(dto => this.toTask(dto)));
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>): Observable<Task> {
    if (environment.mockApi) {
      const newTask: Task = {
        ...task,
        id: (this.tasks.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: 'current-user@example.com'
      };
      this.tasks = [...this.tasks, newTask];
      return of(newTask).pipe(delay(300));
    }
    const payload = {
      title: task.title,
      description: task.description,
      status: task.status
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(map(dto => this.toTask(dto)));
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    if (environment.mockApi) {
      const index = this.tasks.findIndex(t => t.id === id);
      if (index === -1) {
        return throwError(() => new Error('Task not found'));
      }

      const updatedTask = {
        ...this.tasks[index],
        ...task,
        id,
        updatedAt: new Date(),
        updatedBy: 'current-user@example.com'
      };

      this.tasks = [
        ...this.tasks.slice(0, index),
        updatedTask,
        ...this.tasks.slice(index + 1)
      ];

      return of(updatedTask).pipe(delay(300));
    }
    const payload: any = {};
    if (task.title !== undefined) payload.title = task.title;
    if (task.description !== undefined) payload.description = task.description;
    if (task.status !== undefined) payload.status = task.status;
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(map(dto => this.toTask(dto)));
  }

  deleteTask(id: string): Observable<void> {
    if (environment.mockApi) {
      const index = this.tasks.findIndex(t => t.id === id);
      if (index === -1) {
        return throwError(() => new Error('Task not found'));
      }

      this.tasks = [
        ...this.tasks.slice(0, index),
        ...this.tasks.slice(index + 1)
      ];

      return of(undefined).pipe(delay(200));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTaskById(id: string): Observable<Task> {
    return this.getTask(id);
  }

  private toTask(dto: any): Task {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status as TaskStatus,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
      updatedBy: dto.updatedBy
    };
  }
}
