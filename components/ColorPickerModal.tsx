import React, { useState, Component } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, YStack, XStack, Text } from 'tamagui';
import { ColorPicker, fromHsv } from 'react-native-color-picker';
import { LinearGradient } from 'expo-linear-gradient';

interface ColorPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onColorSelected: (color: string) => void;
  initialColor: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isVisible,
  onClose,
  onColorSelected,
  initialColor,
}) => {
  const [color, setColor] = useState(initialColor);

  const handleColorChange = (color: any) => {
    setColor(fromHsv(color));
  };

  const handleSubmit = () => {
    onColorSelected(color);
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <YStack
          backgroundColor="$pink6"
          borderRadius={10}
          padding={20}
          width={300}
          height={400}
        >
          <Text fontSize={18} fontWeight="bold" marginBottom={10} color="white">
            Select a Color With the Dot
          </Text>
          <View style={styles.pickerContainer}>
            <ColorPicker
              onColorChange={handleColorChange}
              style={{flex: 1}}
              defaultColor={initialColor}
              hideSliders={false}
              // oldColor={initialColor}
              // onOldColorSelected={(color) => alert(`Old color selected: ${color}`)}
            />
          </View>
          <View style={styles.colorPreview}>
            <View style={[styles.selectedColor, { backgroundColor: color }]} />
            <Text color="white">{color.toUpperCase()}</Text>
          </View>
          <XStack justifyContent="space-between" marginTop={20}>
            <Button onPress={onClose} backgroundColor="$gray8">
              Cancel
            </Button>
            <Button onPress={handleSubmit} backgroundColor="$blue8">
              Select
            </Button>
          </XStack>
          <LinearGradient
            colors={['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF']}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={styles.rainbowGradient}
          />
        </YStack>
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
  pickerContainer: {
    flex: 1,
    width: '100%',
  },
  rainbowGradient: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    marginTop: 10,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  selectedColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
});

export default ColorPickerModal;