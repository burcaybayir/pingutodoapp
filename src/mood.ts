import { Todo } from './types';

export type Mood = 'idle' | 'happy' | 'cheering' | 'worried' | 'panicking';

/** The baseline mood implied by the list alone, before any note overrides it. */
export function moodFor(todos: Todo[], justCompleted: boolean): Mood {
  if (justCompleted) return 'cheering';
  const open = todos.filter((t) => !t.done).length;
  if (open === 0) return todos.length === 0 ? 'idle' : 'happy';
  if (open <= 4) return 'happy';
  if (open <= 9) return 'worried';
  return 'panicking';
}
