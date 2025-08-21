import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Task, TaskListResponse, TaskRequestParams, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
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

  getTasks(params: TaskRequestParams): Observable<TaskListResponse> {
    const { page = 0, size = 10, sort } = params;
    let filteredTasks = [...this.tasks];
    
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

  getTask(id: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }
    return of({...task}).pipe(delay(200));
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>): Observable<Task> {
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

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
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

  deleteTask(id: string): Observable<void> {
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

  getTaskById(id: string): Observable<Task> {
    return this.getTask(id);
  }
}
