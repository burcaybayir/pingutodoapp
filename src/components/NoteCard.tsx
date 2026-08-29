import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const { colors } = theme;

type Props = { text: string; speaking: boolean };

/**
 * Pingu's note to you: a slightly crooked paper card with a signature, plus a
 * speech tail pointing down at him. It flips in whenever the text changes, so
 * a new note reads as a new note rather than a silent text swap.
 */
export function NoteCard({ text, speaking }: Props) {
  const enter = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, [enter, text]);

  useEffect(() => {
    if (!speaking) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 420, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, speaking]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: enter,
          transform: [
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
            { rotate: '-1.5deg' },
          ],
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.signRow}>
          <Animated.Text
            style={[
              styles.sign,
              speaking && {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
              },
            ]}
          >
            {speaking ? '🔊 noot noot' : '— Pingu'}
          </Animated.Text>
        </View>
      </View>
      <View style={styles.tail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', maxWidth: 300 },
  card: {
    backgroundColor: colors.snow,
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(4.5),
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: colors.iceDeep,
    shadowColor: colors.night,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  text: { color: colors.night, fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 21 },
  signRow: { alignItems: 'flex-end', marginTop: theme.space(1) },
  sign: { color: colors.slate, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
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
