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

import { Hello } from './src/components/Hello';
import { NoteCard } from './src/components/NoteCard';
import { Pingu } from './src/components/Pingu';
import { TodoRow } from './src/components/TodoRow';
import { celebrate, tap } from './src/haptics';
import { pickNote } from './src/notes';
import { asyncStorageStore } from './src/storage';
import { noFocusRing, theme } from './src/theme';
import { Filter } from './src/types';
import { useTodos } from './src/useTodos';
import { hush, say } from './src/voice';

const { colors } = theme;
const FILTERS: Filter[] = ['all', 'active', 'done'];
const CHEER_MS = 2600;
/** Roughly how long Pingu's mouth stays "moving" after he starts a note. */
const SPEAK_MS = 2800;

export default function App() {
  const {
    ready,
    todos,
    visible,
    fish,
    name,
    greeted,
    voiceOn,
    daysAway,
    filter,
    setFilter,
    add,
    toggle,
    remove,
    clearDone,
    setName,
    toggleVoice,
  } = useTodos(asyncStorageStore);

  const [draft, setDraft] = useState('');
  const [rotation, setRotation] = useState(0);
  const [cheering, setCheering] = useState(false);
  const [lastDone, setLastDone] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (cheerTimer.current) clearTimeout(cheerTimer.current);
      if (speakTimer.current) clearTimeout(speakTimer.current);
      hush();
    },
    []
  );

  const openCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - openCount;

  const note = useMemo(
    () =>
      pickNote(
        {
          name,
          now: new Date(),
          todos,
          fish,
          daysAway,
          justCompleted: cheering,
          lastCompletedTitle: lastDone,
        },
        rotation
      ),
    // `rotation` is what makes a tap produce a different line from the same bucket.
    [name, todos, fish, daysAway, cheering, lastDone, rotation]
  );

  /** Says a note out loud (when voice is on) and animates the bubble while he talks. */
  function speak(text: string) {
    if (!voiceOn) return;
    say(text);
    setSpeaking(true);
    if (speakTimer.current) clearTimeout(speakTimer.current);
    speakTimer.current = setTimeout(() => setSpeaking(false), SPEAK_MS);
  }

  function handlePinguTap() {
    tap();
    setRotation((r) => r + 1);
    // The note for the *next* rotation is what the user is about to read, so
    // compute it here rather than speaking the one currently on screen.
    const next = pickNote(
      {
        name,
        now: new Date(),
        todos,
        fish,
        daysAway,
        justCompleted: cheering,
        lastCompletedTitle: lastDone,
      },
      rotation + 1
    );
    speak(next.text);
  }

  function handleToggle(id: string) {
    const target = todos.find((t) => t.id === id);
    toggle(id);
    if (target?.done) {
      tap();
      return;
    }
    celebrate();
    setLastDone(target?.title ?? null);
    setCheering(true);
    if (cheerTimer.current) clearTimeout(cheerTimer.current);
    cheerTimer.current = setTimeout(() => setCheering(false), CHEER_MS);
  }

  // Congratulations are the one note Pingu volunteers without being tapped.
  useEffect(() => {
    if (!cheering) return;
    speak(note.text);
    // Only fire on the transition into cheering, not on every note recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheering]);

  function handleAdd() {
    if (!draft.trim()) return;
    add(draft);
    setDraft('');
    tap();
  }

  function handleHello(chosen: string) {
    setName(chosen);
    tap();
  }

  if (!ready) {
    return <SafeAreaView style={styles.safe} />;
  }

  if (!greeted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <Hello onDone={handleHello} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <NoteCard text={note.text} speaking={speaking} />
          <Pressable
            onPress={handlePinguTap}
            accessibilityRole="button"
            accessibilityLabel="Ask Pingu for another note"
          >
            <Pingu mood={note.mood} size={132} speaking={speaking} />
          </Pressable>
          <View style={styles.stats}>
            <Text style={styles.stat}>
              {openCount} to go · {doneCount} done
            </Text>
            <Text style={styles.fish}>🐟 {fish}</Text>
            <Pressable
              onPress={() => {
                if (voiceOn) hush();
                toggleVoice();
              }}
              hitSlop={8}
              accessibilityRole="switch"
              accessibilityState={{ checked: voiceOn }}
              accessibilityLabel="Pingu's voice"
            >
              <Text style={styles.voice}>{voiceOn ? '🔊' : '🔇'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.composer}>
          <TextInput
            style={[styles.input, noFocusRing]}
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
            <Text style={styles.empty}>
              {todos.length === 0
                ? 'No tasks. Pingu is suspicious of your productivity.'
                : 'Nothing in this filter.'}
            </Text>
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
  stats: { flexDirection: 'row', alignItems: 'center', gap: theme.space(4) },
  stat: { color: colors.slate, fontSize: 14, fontWeight: '600' },
  fish: { color: colors.fish, fontSize: 14, fontWeight: '700' },
  voice: { fontSize: 15 },
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
