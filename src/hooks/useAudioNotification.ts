/**
 * Audio Notification Hook
 * For accessibility - audio alerts for important events
 */

import { useCallback, useRef } from 'react';

interface AudioNotificationOptions {
  volume?: number;
  enabled?: boolean;
}

export const useAudioNotification = (options: AudioNotificationOptions = {}) => {
  const { volume = 0.5, enabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play beep sound
  const playBeep = useCallback(
    (frequency: number = 800, duration: number = 200) => {
      if (!enabled) return;

      try {
        const audioContext = getAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration / 1000
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.error('Audio notification error:', error);
      }
    },
    [enabled, volume, getAudioContext]
  );

  // Predefined notification sounds
  const notifications = {
    // Success sound (ascending)
    success: useCallback(() => {
      playBeep(523, 100); // C
      setTimeout(() => playBeep(659, 100), 100); // E
      setTimeout(() => playBeep(784, 150), 200); // G
    }, [playBeep]),

    // Error sound (descending)
    error: useCallback(() => {
      playBeep(800, 100);
      setTimeout(() => playBeep(600, 100), 100);
      setTimeout(() => playBeep(400, 150), 200);
    }, [playBeep]),

    // Warning sound (double beep)
    warning: useCallback(() => {
      playBeep(700, 100);
      setTimeout(() => playBeep(700, 100), 150);
    }, [playBeep]),

    // Info sound (single beep)
    info: useCallback(() => {
      playBeep(600, 150);
    }, [playBeep]),

    // New message (triple beep)
    newMessage: useCallback(() => {
      playBeep(800, 80);
      setTimeout(() => playBeep(800, 80), 120);
      setTimeout(() => playBeep(800, 80), 240);
    }, [playBeep]),

    // Urgent alert (rapid beeps)
    urgent: useCallback(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => playBeep(1000, 100), i * 150);
      }
    }, [playBeep]),

    // Ride assigned (cheerful)
    rideAssigned: useCallback(() => {
      playBeep(523, 100); // C
      setTimeout(() => playBeep(659, 100), 100); // E
      setTimeout(() => playBeep(784, 100), 200); // G
      setTimeout(() => playBeep(1047, 200), 300); // C (high)
    }, [playBeep]),

    // Ride completed (success melody)
    rideCompleted: useCallback(() => {
      playBeep(659, 100); // E
      setTimeout(() => playBeep(784, 100), 100); // G
      setTimeout(() => playBeep(880, 100), 200); // A
      setTimeout(() => playBeep(1047, 250), 300); // C
    }, [playBeep]),
  };

  // Play audio file (alternative to beeps)
  const playAudioFile = useCallback(
    (audioUrl: string) => {
      if (!enabled) return;

      try {
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.play().catch((error) => {
          console.error('Failed to play audio:', error);
        });
      } catch (error) {
        console.error('Audio file error:', error);
      }
    },
    [enabled, volume]
  );

  // Text-to-Speech (for screen readers)
  const speak = useCallback(
    (text: string, lang: string = 'th-TH') => {
      if (!enabled || !('speechSynthesis' in window)) return;

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.volume = volume;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis error:', error);
      }
    },
    [enabled, volume]
  );

  // Stop all audio
  const stopAll = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    playBeep,
    playAudioFile,
    speak,
    stopAll,
    notifications,
  };
};

// Example usage:
/*
const MyComponent = () => {
  const { notifications, speak } = useAudioNotification({ volume: 0.7 });

  const handleNewRide = () => {
    notifications.rideAssigned();
    speak('มีการเรียกรถใหม่');
  };

  const handleError = () => {
    notifications.error();
    speak('เกิดข้อผิดพลาด');
  };

  return (
    <div>
      <button onClick={handleNewRide}>New Ride</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
};
*/
