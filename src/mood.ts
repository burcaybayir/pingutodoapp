import { Todo } from './types';

export type Mood = 'idle' | 'happy' | 'cheering' | 'worried' | 'panicking';

const LINES: Record<Mood, string[]> = {
  idle: [
    'Noot noot. What are we doing today?',
    'Empty list. Suspicious, but I allow it.',
    'The ice is calm. Add something.',
  ],
  happy: [
    'A tidy list. I am a tidy penguin.',
    'This is very manageable. Noot.',
    'Look at us, being functional.',
  ],
  cheering: [
    'NOOT NOOT! One fish for you.',
    'Task destroyed. I saw everything.',
    'Excellent. I am telling the other penguins.',
  ],
  worried: [
    'That is a lot of items, friend.',
    'Hmm. The pile is growing.',
    'We should probably start soon. Noot.',
  ],
  panicking: [
    'NOOT. NOOT. THE LIST. THE LIST.',
    'I am sliding away on an ice floe. Goodbye.',
    'This is officially a situation.',
  ],
};

export function moodFor(todos: Todo[], justCompleted: boolean): Mood {
  if (justCompleted) return 'cheering';
  const open = todos.filter((t) => !t.done).length;
  if (open === 0) return todos.length === 0 ? 'idle' : 'happy';
  if (open <= 4) return 'happy';
  if (open <= 9) return 'worried';
  return 'panicking';
}

/**
 * Picks a line deterministically from a seed so the bubble stays stable across
 * re-renders and only changes when the mood or the list actually changes.
 */
export function lineFor(mood: Mood, seed: number): string {
  const lines = LINES[mood];
  return lines[Math.abs(seed) % lines.length];
}
