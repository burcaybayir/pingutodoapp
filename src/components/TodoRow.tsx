import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { Todo } from '../types';

const { colors } = theme;

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TodoRow({ todo, onToggle, onRemove }: Props) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, friction: 7, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={() => onToggle(todo.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.done }}
        accessibilityLabel={todo.title}
      >
        <View style={[styles.check, todo.done && styles.checkDone]}>
          {todo.done ? <Text style={styles.tick}>✓</Text> : null}
        </View>
        <Text style={[styles.title, todo.done && styles.titleDone]} numberOfLines={3}>
          {todo.title}
        </Text>
        <Pressable
          onPress={() => onRemove(todo.id)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${todo.title}`}
        >
          <Text style={styles.remove}>✕</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    backgroundColor: colors.snow,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space(3.5),
    paddingHorizontal: theme.space(4),
    marginBottom: theme.space(2.5),
  },
  rowPressed: { backgroundColor: colors.ice },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.iceDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.done, borderColor: colors.done },
  tick: { color: colors.snow, fontWeight: '900', fontSize: 15, lineHeight: 18 },
  title: { flex: 1, fontSize: 16, color: colors.night },
  titleDone: { color: colors.slate, textDecorationLine: 'line-through' },
  remove: { color: colors.iceDeep, fontSize: 18, fontWeight: '700', paddingHorizontal: 4 },
});
