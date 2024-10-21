import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface AudioTrack {
  sound: Audio.Sound;
  isPlaying: boolean;
  trackId: string;
  trackUrl: string;
}

interface AudioContextType {
  tracks: { [key: string]: AudioTrack };
  play: (trackUrl: string, trackId: string, itemId: string) => Promise<void>;
  stop: (itemId: string) => Promise<void>;
  isPlaying: (itemId: string) => boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<{ [key: string]: AudioTrack }>({});

  useEffect(() => {
    return () => {
      Object.values(tracks).forEach(track => {
        if (track.sound) {
          track.sound.unloadAsync();
        }
      });
    };
  }, []);

  const play = async (trackUrl: string, trackId: string, itemId: string) => {
    try {
      let track = tracks[itemId];
      
      if (track && track.trackUrl === trackUrl && track.isPlaying) {
        return;
      }

      if (track) {
        await track.sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackUrl },
        { shouldPlay: true, isLooping: true }
      );

      setTracks(prev => ({
        ...prev,
        [itemId]: { sound: newSound, isPlaying: true, trackId, trackUrl }
      }));

      await newSound.playAsync();
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  };

  const stop = async (itemId: string) => {
    const track = tracks[itemId];
    if (track && track.isPlaying) {
      await track.sound.stopAsync();
      setTracks(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], isPlaying: false }
      }));
    }
  };

  const isPlaying = (itemId: string) => {
    return tracks[itemId]?.isPlaying || false;
  };

  return (
    <AudioContext.Provider value={{ tracks, play, stop, isPlaying }}>
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