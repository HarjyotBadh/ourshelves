import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

interface TagsModalProps {
  visible: boolean;
  onClose: () => void;
  tags: string[];
}

const TagsModal: React.FC<TagsModalProps> = ({ visible, onClose, tags }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>User Tags:</Text>
          <Text>{tags.join(', ') || 'No tags available'}</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TagsModal;
