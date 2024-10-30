import React, { useState, useEffect } from 'react';
import { Modal, FlatList } from 'react-native';
import { Button, Text, YStack, XStack, View } from 'tamagui';
import { collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';

interface Track {
  id: string;
  name: string;
  filename: string;
}

interface TrackSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onTrackSelect: (trackId: string, trackUrl: string) => void;
}

export const TrackSelectionModal: React.FC<TrackSelectionModalProps> = ({
  isVisible,
  onClose,
  onTrackSelect,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      const tracksCollection = collection(db, 'Tracks');
      const tracksSnapshot = await getDocs(tracksCollection);
      const tracksList = tracksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Track));
      setTracks(tracksList);
    };

    fetchTracks();
  }, []);

  const handleTrackSelect = async (track: Track) => {
    try {
      const storage = getStorage();
      const musicRef = ref(storage, `music/${track.filename}.mp3`);
      const trackUrl = await getDownloadURL(musicRef);
      onTrackSelect(track.id, trackUrl);
    } catch (error) {
      console.error('Error getting download URL:', error);
      // Handle error (e.g., show a toast message)
    }
  };

  const renderTrackItem = ({ item }: { item: Track }) => (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <Text>{item.name}</Text>
      <Button onPress={() => handleTrackSelect(item)}>Select</Button>
    </XStack>
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <YStack space backgroundColor="$background" padding="$4" borderRadius="$4" width={300} maxHeight={400}>
          <Text fontSize="$6" fontWeight="bold">
            Select a Track
          </Text>
          <FlatList
            data={tracks}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
          />
          <Button theme="red" onPress={onClose}>
            Close
          </Button>
        </YStack>
      </View>
    </Modal>
  );
};