import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Mood } from '../mood';
import { theme } from '../theme';

const { colors } = theme;

type Props = { mood: Mood; size?: number };

/**
 * Pingu, drawn entirely with Views so the app carries no SVG or image
 * dependency. He idles with a slow bob and does a bigger hop when cheering.
 */
export function Pingu({ mood, size = 120 }: Props) {
  const bob = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const s = size / 120;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: mood === 'panicking' ? 380 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: mood === 'panicking' ? 380 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, mood]);

  useEffect(() => {
    if (mood !== 'cheering') return;
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(hop, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [hop, mood]);

  const translateY = Animated.add(
    bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4 * s] }),
    hop.interpolate({ inputRange: [0, 1], outputRange: [0, -22 * s] })
  );
  const rotate = bob.interpolate({
    inputRange: [0, 1],
    outputRange: mood === 'panicking' ? ['-6deg', '6deg'] : ['-2deg', '2deg'],
  });

  // Worried and panicking Pingu narrows his eyes; cheering Pingu squeezes them shut.
  const eyeHeight = mood === 'cheering' ? 3 * s : mood === 'panicking' ? 14 * s : 10 * s;
  const flipperAngle = mood === 'panicking' ? -40 : mood === 'cheering' ? -25 : 12;

  return (
    <Animated.View
      style={[{ width: 120 * s, height: 130 * s, transform: [{ translateY }, { rotate }] }]}
    >
      {/* body */}
      <View
        style={[
          styles.body,
          {
            width: 92 * s,
            height: 108 * s,
            borderRadius: 46 * s,
            left: 14 * s,
            top: 8 * s,
          },
        ]}
      />
      {/* belly */}
      <View
        style={[
          styles.belly,
          { width: 58 * s, height: 74 * s, borderRadius: 29 * s, left: 31 * s, top: 34 * s },
        ]}
      />
      {/* flippers */}
      <View
        style={[
          styles.flipper,
          {
            width: 16 * s,
            height: 46 * s,
            borderRadius: 8 * s,
            left: 4 * s,
            top: 40 * s,
            transform: [{ rotate: `${flipperAngle}deg` }],
          },
        ]}
      />
      <View
        style={[
          styles.flipper,
          {
            width: 16 * s,
            height: 46 * s,
            borderRadius: 8 * s,
            right: 4 * s,
            top: 40 * s,
            transform: [{ rotate: `${-flipperAngle}deg` }],
          },
        ]}
      />
      {/* eyes */}
      <View
        style={[
          styles.eye,
          { width: 10 * s, height: eyeHeight, borderRadius: 5 * s, left: 42 * s, top: 36 * s },
        ]}
      />
      <View
        style={[
          styles.eye,
          { width: 10 * s, height: eyeHeight, borderRadius: 5 * s, right: 42 * s, top: 36 * s },
        ]}
      />
      {/* beak */}
      <View
        style={[
          styles.beak,
          {
            width: 22 * s,
            height: mood === 'cheering' || mood === 'panicking' ? 18 * s : 11 * s,
            borderRadius: 6 * s,
            left: 49 * s,
            top: 52 * s,
          },
        ]}
      />
      {/* feet */}
      <View
        style={[
          styles.foot,
          { width: 26 * s, height: 10 * s, borderRadius: 5 * s, left: 24 * s, bottom: 4 * s },
        ]}
      />
      <View
        style={[
          styles.foot,
          { width: 26 * s, height: 10 * s, borderRadius: 5 * s, right: 24 * s, bottom: 4 * s },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: { position: 'absolute', backgroundColor: colors.coal },
  belly: { position: 'absolute', backgroundColor: colors.snow },
  flipper: { position: 'absolute', backgroundColor: colors.coal },
  eye: { position: 'absolute', backgroundColor: colors.coal, zIndex: 2 },
  beak: { position: 'absolute', backgroundColor: colors.beak, zIndex: 2 },
  foot: { position: 'absolute', backgroundColor: colors.beakDark },
});
