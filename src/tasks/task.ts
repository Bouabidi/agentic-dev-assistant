export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory =
  'work' | 'personal' | 'learning' | 'development' | 'other';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
export const DEFAULT_TASK_PRIORITY: TaskPriority = 'medium';
export const TASK_CATEGORIES: TaskCategory[] = [
  'work',
  'personal',
  'learning',
  'development',
  'other',
];
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  category?: TaskCategory;
  status?: TaskStatus;
}
