// AudioContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

interface AudioContextType {
  isPlaying: boolean;
  currentTrackId: string | null;
  play: (trackUrl: string, trackId: string) => Promise<void>;
  stop: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const currentTrackUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const play = async (trackUrl: string, trackId: string) => {
    try {
      if (currentTrackUrlRef.current === trackUrl && isPlaying) {
        // Already playing this track, do nothing
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackUrl },
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setCurrentTrackId(trackId);
      currentTrackUrlRef.current = trackUrl;
      await newSound.playAsync();
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  };

  const stop = async () => {
    if (sound && isPlaying) {
      await sound.stopAsync();
      setIsPlaying(false);
      setCurrentTrackId(null);
      currentTrackUrlRef.current = null;
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, currentTrackId, play, stop }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};