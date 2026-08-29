import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Mood } from '../mood';
import { theme } from '../theme';

const { colors } = theme;

type Props = { mood: Mood; size?: number; speaking?: boolean };

/**
 * Pingu, drawn entirely with Views so the app carries no SVG or image
 * dependency. Everything is positioned inside a 120x140 box and scaled by `s`,
 * so the numbers below can be read as a fixed drawing.
 *
 * Draw order matters: flippers and feet go down first so the body overlaps
 * them, then the head sits on top of the body, then the face on the head.
 */
export function Pingu({ mood, size = 120, speaking = false }: Props) {
  const bob = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const talk = useRef(new Animated.Value(0)).current;
  const s = size / 120;

  useEffect(() => {
    const beat = mood === 'panicking' ? 380 : 1400;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: beat,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: beat,
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

  useEffect(() => {
    if (!speaking) {
      talk.stopAnimation(() => talk.setValue(0));
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(talk, { toValue: 1, duration: 140, useNativeDriver: false }),
        Animated.timing(talk, { toValue: 0, duration: 140, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [speaking, talk]);

  const translateY = Animated.add(
    bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4 * s] }),
    hop.interpolate({ inputRange: [0, 1], outputRange: [0, -20 * s] })
  );
  const rotate = bob.interpolate({
    inputRange: [0, 1],
    outputRange: mood === 'panicking' ? ['-6deg', '6deg'] : ['-2deg', '2deg'],
  });

  const px = (n: number) => n * s;

  const eyesClosed = mood === 'cheering';
  // The white face patch means a white sclera would be invisible, so the pupil
  // *is* the eye: a small one reads as alarm, and angled brows above it carry
  // the rest. Brows are kept short and central so they land on white, not on
  // the dark head.
  const pupil = (mood === 'panicking' ? 9 : 13) * s;
  const pupilTop = px(42) - pupil / 2;
  const browAngle = mood === 'panicking' ? 20 : 11;
  const browTop = px(mood === 'panicking' ? 27 : 29);
  const flipperAngle = mood === 'panicking' ? -50 : mood === 'cheering' ? -30 : 8;
  const restingBeak = (mood === 'cheering' || mood === 'panicking' ? 17 : 12) * s;
  // Height is not a native-driver property, hence useNativeDriver: false above.
  const beakHeight = talk.interpolate({ inputRange: [0, 1], outputRange: [restingBeak, 21 * s] });

  return (
    <Animated.View
      style={{ width: px(120), height: px(142), transform: [{ translateY }, { rotate }] }}
    >
      {/* hair tuft */}
      <View
        style={[
          styles.dark,
          { width: px(7), height: px(14), borderRadius: px(4), left: px(55), top: px(0) },
          { transform: [{ rotate: '-14deg' }] },
        ]}
      />
      <View
        style={[
          styles.dark,
          { width: px(7), height: px(13), borderRadius: px(4), left: px(62), top: px(1) },
          { transform: [{ rotate: '12deg' }] },
        ]}
      />

      {/* flippers */}
      <View
        style={[
          styles.dark,
          {
            width: px(18),
            height: px(46),
            borderRadius: px(9),
            left: px(1),
            top: px(62),
            transform: [{ rotate: `${flipperAngle}deg` }],
          },
        ]}
      />
      <View
        style={[
          styles.dark,
          {
            width: px(18),
            height: px(46),
            borderRadius: px(9),
            right: px(1),
            top: px(62),
            transform: [{ rotate: `${-flipperAngle}deg` }],
          },
        ]}
      />

      {/* feet, tucked under the body */}
      <View
        style={[
          styles.foot,
          { width: px(30), height: px(12), borderRadius: px(6), left: px(22), bottom: px(2) },
        ]}
      />
      <View
        style={[
          styles.foot,
          { width: px(30), height: px(12), borderRadius: px(6), right: px(22), bottom: px(2) },
        ]}
      />

      {/* body + belly */}
      <View
        style={[
          styles.dark,
          { width: px(92), height: px(86), borderRadius: px(44), left: px(14), top: px(48) },
        ]}
      />
      <View
        style={[
          styles.snow,
          { width: px(62), height: px(70), borderRadius: px(31), left: px(29), top: px(58) },
        ]}
      />

      {/* head + face patch */}
      <View
        style={[
          styles.dark,
          { width: px(78), height: px(76), borderRadius: px(39), left: px(21), top: px(6) },
        ]}
      />
      <View
        style={[
          styles.snow,
          { width: px(64), height: px(58), borderRadius: px(32), left: px(28), top: px(20) },
        ]}
      />

      {/* cheeks */}
      <View
        style={[
          styles.cheek,
          { width: px(13), height: px(7), borderRadius: px(4), left: px(28), top: px(53) },
        ]}
      />
      <View
        style={[
          styles.cheek,
          { width: px(13), height: px(7), borderRadius: px(4), right: px(28), top: px(53) },
        ]}
      />

      {/* eyes */}
      {eyesClosed ? (
        <>
          <View
            style={[
              styles.dark,
              { width: px(16), height: px(5), borderRadius: px(3), left: px(30), top: px(40) },
            ]}
          />
          <View
            style={[
              styles.dark,
              { width: px(16), height: px(5), borderRadius: px(3), right: px(30), top: px(40) },
            ]}
          />
        </>
      ) : (
        <>
          {mood === 'worried' || mood === 'panicking' ? (
            <>
              <View
                style={[
                  styles.dark,
                  { width: px(15), height: px(4), borderRadius: px(2), left: px(35), top: browTop },
                  { transform: [{ rotate: `-${browAngle}deg` }] },
                ]}
              />
              <View
                style={[
                  styles.dark,
                  { width: px(15), height: px(4), borderRadius: px(2), right: px(35), top: browTop },
                  { transform: [{ rotate: `${browAngle}deg` }] },
                ]}
              />
            </>
          ) : null}
          <View
            style={[
              styles.dark,
              { width: pupil, height: pupil, borderRadius: pupil / 2, left: px(36), top: pupilTop },
            ]}
          />
          <View
            style={[
              styles.dark,
              { width: pupil, height: pupil, borderRadius: pupil / 2, right: px(36), top: pupilTop },
            ]}
          />
          {/* catchlights — the single detail that makes him look alive */}
          <View
            style={[
              styles.snow,
              { width: px(4), height: px(4), borderRadius: px(2), left: px(38), top: pupilTop + px(2) },
            ]}
          />
          <View
            style={[
              styles.snow,
              { width: px(4), height: px(4), borderRadius: px(2), right: px(38), top: pupilTop + px(2) },
            ]}
          />
        </>
      )}

      {/* beak */}
      <Animated.View
        style={[
          styles.beak,
          {
            width: px(21),
            height: speaking ? beakHeight : restingBeak,
            borderRadius: px(7),
            left: px(50),
            top: px(52),
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dark: { position: 'absolute', backgroundColor: colors.coal },
  snow: { position: 'absolute', backgroundColor: colors.snow },
  cheek: { position: 'absolute', backgroundColor: 'rgba(242,126,99,0.35)' },
  beak: { position: 'absolute', backgroundColor: colors.beak },
  foot: { position: 'absolute', backgroundColor: colors.beakDark },
});
