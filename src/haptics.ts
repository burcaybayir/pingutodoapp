import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Haptics are a nicety, never a requirement — web and older devices just skip them. */
export function celebrate() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function tap() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
