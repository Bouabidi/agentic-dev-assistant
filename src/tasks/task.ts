export type TaskPriority = 'low' | 'medium' | 'high';

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
export const DEFAULT_TASK_PRIORITY: TaskPriority = 'medium';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  estimateMinutes?: number;
}
