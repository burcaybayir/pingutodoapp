import { Mood, moodFor } from './mood';
import { Todo } from './types';

export type Note = { text: string; mood: Mood };

export type NoteContext = {
  /** What Pingu calls you, or null if he hasn't been told. */
  name: string | null;
  now: Date;
  todos: Todo[];
  fish: number;
  /** Whole days since the previous launch. 0 on the same day. */
  daysAway: number;
  justCompleted: boolean;
  /** Title of the task just finished, when there is one. */
  lastCompletedTitle: string | null;
};

const DAY = 24 * 60 * 60 * 1000;

/** A bucket of interchangeable lines, plus the mood Pingu wears while saying them. */
type Bucket = { mood: Mood; lines: string[] };

function greeting(hour: number): string {
  if (hour < 5) return 'It is the middle of the night';
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

/** "Noot" if he doesn't know your name yet, otherwise your name. */
function you(name: string | null): string {
  return name ?? 'friend';
}

function oldestOpen(todos: Todo[], now: number): { todo: Todo; days: number } | null {
  const open = todos.filter((t) => !t.done);
  if (open.length === 0) return null;
  const todo = open.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b));
  return { todo, days: Math.floor((now - todo.createdAt) / DAY) };
}

/**
 * Buckets in priority order — the first one that applies is the note Pingu
 * leaves. Ordering is the whole design: a milestone should beat a generic
 * greeting, and a task finished a second ago should beat everything.
 */
function buckets(ctx: NoteContext): Bucket[] {
  const { name, todos, fish, daysAway, justCompleted, lastCompletedTitle } = ctx;
  const now = ctx.now.getTime();
  const hour = ctx.now.getHours();
  const open = todos.filter((t) => !t.done);
  const stale = oldestOpen(todos, now);
  const out: Bucket[] = [];

  if (justCompleted) {
    const what = lastCompletedTitle ? `"${lastCompletedTitle}"` : 'that one';
    out.push({
      mood: 'cheering',
      lines: [
        `NOOT NOOT! ${what} is gone. One fish for you, ${you(name)}.`,
        `${what} — destroyed. I watched the whole thing.`,
        `That is ${fish} ${fish === 1 ? 'fish' : 'fish'} now. I am keeping count, ${you(name)}.`,
      ],
    });
  }

  if (daysAway >= 1) {
    out.push({
      mood: daysAway >= 7 ? 'worried' : 'happy',
      lines: [
        daysAway === 1
          ? `You were gone a day, ${you(name)}. I guarded the list.`
          : `${daysAway} days, ${you(name)}. I ate all the fish. Sorry.`,
        `Welcome back. Nothing moved on its own, I checked.`,
      ],
    });
  }

  if (todos.length > 0 && open.length === 0) {
    out.push({
      mood: 'happy',
      lines: [
        `Everything is done, ${you(name)}. I do not know what to do with myself.`,
        `Empty list, full belly. This is the good timeline.`,
        `Nothing left. Go outside. I hear it is warm out there.`,
      ],
    });
  }

  if (stale && stale.days >= 3) {
    out.push({
      mood: 'worried',
      lines: [
        `"${stale.todo.title}" has been sitting there ${stale.days} days, ${you(name)}.`,
        `I am not saying anything about "${stale.todo.title}". I am just pointing at it.`,
        `Day ${stale.days} of "${stale.todo.title}". We are in this together now.`,
      ],
    });
  }

  if (fish > 0 && fish % 10 === 0) {
    out.push({
      mood: 'cheering',
      lines: [
        `${fish} fish, ${you(name)}. That is a serious amount of fish.`,
        `Milestone! ${fish} fish. I have told the other penguins about you.`,
      ],
    });
  }

  if (open.length >= 10) {
    out.push({
      mood: 'panicking',
      lines: [
        `NOOT. NOOT. ${open.length} things, ${you(name)}. THE LIST.`,
        `${open.length} open. I am sliding away on an ice floe. Goodbye.`,
        `Pick one. Any one. I will wait right here, ${you(name)}.`,
      ],
    });
  }

  if (open.length >= 5) {
    out.push({
      mood: 'worried',
      lines: [
        `${open.length} things left, ${you(name)}. The pile is growing.`,
        `Hmm. ${open.length}. We should probably start soon.`,
        `I counted twice. Still ${open.length}.`,
      ],
    });
  }

  if (hour >= 22 || hour < 5) {
    out.push({
      mood: 'worried',
      lines: [
        `It is late, ${you(name)}. The list will still be here tomorrow.`,
        `Penguins sleep. You should try it.`,
      ],
    });
  }

  out.push({
    mood: moodFor(todos, false),
    lines:
      todos.length === 0
        ? [
            `${greeting(hour)}, ${you(name)}. The ice is calm. Add something.`,
            `Empty list. Suspicious, but I allow it.`,
            `${greeting(hour)}. I am here whenever you are.`,
          ]
        : [
            `${greeting(hour)}, ${you(name)}. ${open.length} to go — very manageable.`,
            `A tidy list. I am a tidy penguin.`,
            `Look at us, being functional.`,
          ],
  });

  return out;
}

/**
 * `rotation` advances each time you tap Pingu, so he cycles through the lines
 * of whichever bucket currently applies instead of repeating one forever.
 */
export function pickNote(ctx: NoteContext, rotation: number): Note {
  const bucket = buckets(ctx)[0];
  const index = Math.abs(rotation) % bucket.lines.length;
  return { text: bucket.lines[index], mood: bucket.mood };
}

/** Strips the punctuation that text-to-speech reads as noise. */
export function speakable(text: string): string {
  return text.replace(/"/g, '').replace(/—/g, ',');
}
