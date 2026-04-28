import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function getWebDeviceInfo() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return {
      isWeb: false,
      isAndroid: false,
      isIOS: false,
      isSafari: false,
      isStandalone: false,
    };
  }

  const userAgent = window.navigator.userAgent || '';
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isSafari =
    isIOS && /safari/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  return {
    isWeb: true,
    isAndroid,
    isIOS,
    isSafari,
    isStandalone,
  };
}

function getInstructionSteps({ isAndroid, isIOS, isSafari, canPromptInstall }) {
  if (isAndroid) {
    if (canPromptInstall) {
      return [
        'Tap "Install on Android" below.',
        'Confirm the browser prompt to add WhatToEat to your home screen.',
        'Open it from your home screen like a regular app.',
      ];
    }

    return [
      'Open this page in Chrome on your Android device.',
      'Tap the browser menu in the top-right corner.',
      'Choose "Install app" or "Add to Home screen".',
    ];
  }

  if (isIOS) {
    if (isSafari) {
      return [
        'Tap the Share button in Safari.',
        'Scroll down and choose "Add to Home Screen".',
        'Tap "Add" to install WhatToEat on your iPhone or iPad.',
      ];
    }

    return [
      'Open this page in Safari on your iPhone or iPad.',
      'Tap the Share button in Safari.',
      'Choose "Add to Home Screen" and then tap "Add".',
    ];
  }

  return [];
}

export default function WebInstallPrompt() {
  const [deviceInfo, setDeviceInfo] = useState(() => getWebDeviceInfo());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }

    const refreshDeviceInfo = () => {
      setDeviceInfo(getWebDeviceInfo());
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      refreshDeviceInfo();
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstructions(false);
      refreshDeviceInfo();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const displayModeQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = () => refreshDeviceInfo();

    if (displayModeQuery?.addEventListener) {
      displayModeQuery.addEventListener('change', handleDisplayModeChange);
    } else if (displayModeQuery?.addListener) {
      displayModeQuery.addListener(handleDisplayModeChange);
    }

    refreshDeviceInfo();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);

      if (displayModeQuery?.removeEventListener) {
        displayModeQuery.removeEventListener('change', handleDisplayModeChange);
      } else if (displayModeQuery?.removeListener) {
        displayModeQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const canPromptInstall = Boolean(deferredPrompt);

  const steps = useMemo(
    () => getInstructionSteps({ ...deviceInfo, canPromptInstall }),
    [canPromptInstall, deviceInfo]
  );

  if (
    !deviceInfo.isWeb ||
    deviceInfo.isStandalone ||
    (!deviceInfo.isAndroid && !deviceInfo.isIOS)
  ) {
    return null;
  }

  const title = deviceInfo.isAndroid ? 'Install on Android' : 'Install on iPhone';
  const subtitle = deviceInfo.isAndroid
    ? canPromptInstall
      ? 'Save WhatToEat to your home screen for one-tap access.'
      : 'Use Chrome on Android to install WhatToEat like an app.'
    : deviceInfo.isSafari
    ? 'Add WhatToEat to your home screen from Safari.'
    : 'Open this page in Safari to install WhatToEat on iPhone.';

  const handleInstallPress = async () => {
    if (deviceInfo.isAndroid && canPromptInstall) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    setShowInstructions(true);
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleInstallPress}>
          <Text style={styles.primaryButtonText}>{title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowInstructions(true)}
        >
          <Text style={styles.secondaryButtonText}>See install steps</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showInstructions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInstructions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Install WhatToEat</Text>
            {steps.map((step, index) => (
              <View style={styles.stepRow} key={step}>
                <Text style={styles.stepIndex}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 360,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD9D9',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 22,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  stepIndex: {
    width: 22,
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  closeButton: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: '#111827',
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
