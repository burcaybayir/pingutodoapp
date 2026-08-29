import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, emptyState } from './types';

/**
 * Everything the app knows about persistence lives behind this interface.
 * Swapping local storage for a synced backend later means writing one more
 * implementation, not touching the UI.
 */
export interface Store {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
}

const KEY = 'pingu.state.v1';

function isTodoish(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return typeof t.id === 'string' && typeof t.title === 'string' && typeof t.done === 'boolean';
}

/** Tolerates corrupt or partial data rather than crashing on launch. */
export function parseState(raw: string | null): AppState {
  if (!raw) return emptyState;
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const todos = Array.isArray(parsed.todos) ? parsed.todos.filter(isTodoish) : [];
    const fish = typeof parsed.fish === 'number' && parsed.fish >= 0 ? parsed.fish : 0;
    return { todos: todos as AppState['todos'], fish };
  } catch {
    return emptyState;
  }
}

export const asyncStorageStore: Store = {
  async load() {
    return parseState(await AsyncStorage.getItem(KEY));
  },
  async save(state) {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  },
};
