import { Platform, Alert } from 'react-native';

// react-native's Alert.alert is a no-op on react-native-web, which silently
// hides errors from users. Route web to window.alert so failures are visible.
export function showAlert(title, message) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message ? `${title}\n\n${message}` : title);
    } else {
      console.warn('[showAlert]', title, message);
    }
    return;
  }
  Alert.alert(title, message);
}
