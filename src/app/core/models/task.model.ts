export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface TaskListResponse {
  content: Task[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TaskRequestParams {
  page: number;
  size: number;
  sort?: string;
  status?: TaskStatus;
  search?: string;
}
