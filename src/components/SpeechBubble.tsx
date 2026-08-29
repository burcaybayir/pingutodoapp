import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const { colors } = theme;

export function SpeechBubble({ text }: { text: string }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [fade, text]);

  return (
    <Animated.View style={[styles.wrap, { opacity: fade }]}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.tail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', maxWidth: 260 },
  bubble: {
    backgroundColor: colors.snow,
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(4),
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: colors.iceDeep,
  },
  text: { color: colors.night, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.iceDeep,
  },
});
