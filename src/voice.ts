import * as Speech from 'expo-speech';
import { speakable } from './notes';

/**
 * Pingu's voice: high pitch, slightly slow, so it lands somewhere between
 * "penguin" and "understandable". Speech is decorative — every failure path
 * (no TTS engine, no voices installed, a browser that needs a user gesture
 * first) is silently fine.
 */
export function say(text: string) {
  try {
    Speech.stop();
    Speech.speak(speakable(text), { pitch: 1.6, rate: 0.92 });
  } catch {
    // no voice on this device; the note is still on screen
  }
}

export function hush() {
  try {
    Speech.stop();
  } catch {
    // nothing to stop
  }
}
