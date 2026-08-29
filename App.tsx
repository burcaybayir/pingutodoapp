import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Pingu } from './src/components/Pingu';
import { SpeechBubble } from './src/components/SpeechBubble';
import { TodoRow } from './src/components/TodoRow';
import { celebrate, tap } from './src/haptics';
import { lineFor, moodFor } from './src/mood';
import { asyncStorageStore } from './src/storage';
import { theme } from './src/theme';
import { Filter } from './src/types';
import { useTodos } from './src/useTodos';

const { colors } = theme;
const FILTERS: Filter[] = ['all', 'active', 'done'];
const CHEER_MS = 1800;

export default function App() {
  const { ready, todos, visible, fish, filter, setFilter, add, toggle, remove, clearDone } =
    useTodos(asyncStorageStore);
  const [draft, setDraft] = useState('');
  const [cheering, setCheering] = useState(false);
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (cheerTimer.current) clearTimeout(cheerTimer.current);
  }, []);

  const openCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - openCount;
  const mood = moodFor(todos, cheering);
  const line = useMemo(() => lineFor(mood, todos.length + fish), [mood, todos.length, fish]);

  function handleToggle(id: string) {
    const wasDone = todos.find((t) => t.id === id)?.done;
    toggle(id);
    if (wasDone) {
      tap();
      return;
    }
    celebrate();
    setCheering(true);
    if (cheerTimer.current) clearTimeout(cheerTimer.current);
    cheerTimer.current = setTimeout(() => setCheering(false), CHEER_MS);
  }

  function handleAdd() {
    if (!draft.trim()) return;
    add(draft);
    setDraft('');
    tap();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <SpeechBubble text={line} />
          <Pingu mood={mood} size={132} />
          <View style={styles.stats}>
            <Text style={styles.stat}>
              {openCount} to go · {doneCount} done
            </Text>
            <Text style={styles.fish}>🐟 {fish}</Text>
          </View>
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="What should Pingu nag you about?"
            placeholderTextColor={colors.slate}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessibilityLabel="New task"
          />
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Add task"
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filter, filter === f && styles.filterActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f }}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
          {doneCount > 0 ? (
            <Pressable onPress={clearDone} style={styles.clear} accessibilityRole="button">
              <Text style={styles.clearText}>clear done</Text>
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={visible}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TodoRow todo={item} onToggle={handleToggle} onRemove={remove} />
          )}
          ListEmptyComponent={
            ready ? (
              <Text style={styles.empty}>
                {todos.length === 0
                  ? 'No tasks. Pingu is suspicious of your productivity.'
                  : 'Nothing in this filter.'}
              </Text>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ice },
  flex: { flex: 1 },
  header: { alignItems: 'center', paddingTop: theme.space(4), gap: theme.space(2) },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(4),
  },
  stat: { color: colors.slate, fontSize: 14, fontWeight: '600' },
  fish: { color: colors.fish, fontSize: 14, fontWeight: '700' },
  composer: {
    flexDirection: 'row',
    gap: theme.space(2),
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(4),
  },
  input: {
    flex: 1,
    backgroundColor: colors.snow,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(3.5),
    fontSize: 16,
    color: colors.night,
  },
  addBtn: {
    backgroundColor: colors.sky,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space(5),
    justifyContent: 'center',
  },
  addBtnPressed: { backgroundColor: colors.iceDeep },
  addBtnText: { color: colors.snow, fontWeight: '800', fontSize: 16 },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(3),
  },
  filter: {
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(1.5),
    borderRadius: theme.radius.pill,
  },
  filterActive: { backgroundColor: colors.iceDeep },
  filterText: { color: colors.slate, fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: colors.night },
  clear: { marginLeft: 'auto' },
  clearText: { color: colors.slate, fontSize: 13, textDecorationLine: 'underline' },
  list: { padding: theme.space(4), paddingBottom: theme.space(10) },
  empty: {
    textAlign: 'center',
    color: colors.slate,
    marginTop: theme.space(8),
    paddingHorizontal: theme.space(8),
    lineHeight: 22,
  },
});
