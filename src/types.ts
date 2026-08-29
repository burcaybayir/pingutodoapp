export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  completedAt: number | null;
};

export type Filter = 'all' | 'active' | 'done';

/** Everything we persist between launches. */
export type AppState = {
  todos: Todo[];
  /** One fish earned per completed task. Pingu's currency. */
  fish: number;
};

export const emptyState: AppState = { todos: [], fish: 0 };
