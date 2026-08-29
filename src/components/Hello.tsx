import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NoteCard } from './NoteCard';
import { Pingu } from './Pingu';
import { noFocusRing, theme } from '../theme';

const { colors } = theme;

/**
 * First launch. Pingu introduces himself and asks what to call you — the name
 * is what makes every later note feel addressed to someone.
 */
export function Hello({ onDone }: { onDone: (name: string) => void }) {
  const [draft, setDraft] = useState('');

  return (
    <View style={styles.wrap}>
      <NoteCard text="Noot noot! I am Pingu. What should I call you?" speaking={false} />
      <Pingu mood="happy" size={148} />
      <TextInput
        style={[styles.input, noFocusRing]}
        value={draft}
        onChangeText={setDraft}
        placeholder="your name"
        placeholderTextColor={colors.slate}
        returnKeyType="done"
        maxLength={24}
        autoFocus
        onSubmitEditing={() => onDone(draft)}
        accessibilityLabel="Your name"
      />
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={() => onDone(draft)}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>{draft.trim() ? 'Nice to meet you' : 'Skip for now'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(3),
    padding: theme.space(6),
  },
  input: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: colors.snow,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(3.5),
    fontSize: 17,
    textAlign: 'center',
    color: colors.night,
  },
  btn: {
    backgroundColor: colors.sky,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.space(7),
    paddingVertical: theme.space(3.5),
  },
  btnPressed: { backgroundColor: colors.iceDeep },
  btnText: { color: colors.snow, fontWeight: '800', fontSize: 16 },
});
