import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Filter, Todo, emptyState } from './types';
import { Store } from './storage';

let counter = 0;
function newId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

export function useTodos(store: Store) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    store
      .load()
      .then((loadedState) => {
        if (cancelled) return;
        setState(loadedState);
      })
      .finally(() => {
        if (cancelled) return;
        loaded.current = true;
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  // Persist on every change, but never before the initial load has landed —
  // otherwise the empty default would overwrite real data on a slow launch.
  useEffect(() => {
    if (!loaded.current) return;
    void store.save(state);
  }, [state, store]);

  const add = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const todo: Todo = {
      id: newId(),
      title: trimmed,
      done: false,
      createdAt: Date.now(),
      completedAt: null,
    };
    setState((s) => ({ ...s, todos: [todo, ...s.todos] }));
  }, []);

  const toggle = useCallback((id: string) => {
    setState((s) => {
      const target = s.todos.find((t) => t.id === id);
      if (!target) return s;
      const nowDone = !target.done;
      return {
        todos: s.todos.map((t) =>
          t.id === id ? { ...t, done: nowDone, completedAt: nowDone ? Date.now() : null } : t
        ),
        // A fish is earned on completion and handed back on un-completion,
        // so the count always matches what is actually finished.
        fish: Math.max(0, s.fish + (nowDone ? 1 : -1)),
      };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => {
      const target = s.todos.find((t) => t.id === id);
      return {
        todos: s.todos.filter((t) => t.id !== id),
        fish: target?.done ? Math.max(0, s.fish - 1) : s.fish,
      };
    });
  }, []);

  const clearDone = useCallback(() => {
    setState((s) => ({ ...s, todos: s.todos.filter((t) => !t.done) }));
  }, []);

  const visible = state.todos.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  );

  return {
    ready,
    todos: state.todos,
    visible,
    fish: state.fish,
    filter,
    setFilter,
    add,
    toggle,
    remove,
    clearDone,
  };
}
