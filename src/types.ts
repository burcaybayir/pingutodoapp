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
  /** What Pingu calls you. Null if you skipped the introduction. */
  name: string | null;
  /** Whether Pingu has introduced himself, so he only does it once. */
  greeted: boolean;
  /** Last launch, so Pingu can notice you were gone. */
  lastSeenAt: number | null;
  /** Whether Pingu reads his notes out loud. */
  voiceOn: boolean;
};

export const emptyState: AppState = {
  todos: [],
  fish: 0,
  name: null,
  greeted: false,
  lastSeenAt: null,
  voiceOn: true,
};
