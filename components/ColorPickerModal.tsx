import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Modal, View, StyleSheet, PanResponder, PanResponderGestureState } from 'react-native';
import { Button, YStack, XStack, Text } from 'tamagui';
import { Canvas, Rect, LinearGradient as SkiaLinearGradient, vec } from '@shopify/react-native-skia';
import tinycolor from 'tinycolor2';

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
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(1);
  const [val, setVal] = useState(1);
  const colorSquareSize = 200;
  const hueSliderHeight = 20;
  const sliderWidth = colorSquareSize;

  const colorSquareRef = useRef<View>(null);
  const hueSliderRef = useRef<View>(null);

  useEffect(() => {
    if (isVisible) {
      const color = tinycolor(initialColor);
      const { h, s, v } = color.toHsv();
      setHue(h);
      setSat(s);
      setVal(v);
    }
  }, [isVisible, initialColor]);

  const updateColor = useCallback((h: number, s: number, v: number) => {
    setHue(h);
    setSat(s);
    setVal(v);
  }, []);

  const handleSubmit = () => {
    const color = hsvToHex(hue, sat, val);
    onColorSelected(color);
    onClose();
  };

  const updateColorSquare = (pageX: number, pageY: number) => {
    colorSquareRef.current?.measure((x, y, width, height, pageXOffset, pageYOffset) => {
      const newSat = Math.max(0, Math.min(1, (pageX - pageXOffset) / width));
      const newVal = Math.max(0, Math.min(1, 1 - (pageY - pageYOffset) / height));
      updateColor(hue, newSat, newVal);
    });
  };

  const updateHueSlider = (pageX: number) => {
    hueSliderRef.current?.measure((x, y, width, height, pageXOffset) => {
      const newHue = Math.max(0, Math.min(359, ((pageX - pageXOffset) / width) * 360));
      updateColor(newHue, sat, val);
    });
  };

  const colorSquarePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      event.persist();
      updateColorSquare(event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
    onPanResponderGrant: (event) => {
      event.persist();
      updateColorSquare(event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
  });

  const hueSliderPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event) => {
      event.persist();
      updateHueSlider(event.nativeEvent.pageX);
    },
    onPanResponderGrant: (event) => {
      event.persist();
      updateHueSlider(event.nativeEvent.pageX);
    },
  });

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
            Select a Color
          </Text>
          <View style={styles.pickerContainer}>
            <View ref={colorSquareRef} {...colorSquarePanResponder.panHandlers}>
              <Canvas style={{ width: colorSquareSize, height: colorSquareSize }}>
                <Rect x={0} y={0} width={colorSquareSize} height={colorSquareSize}>
                  <SkiaLinearGradient
                    start={vec(0, 0)}
                    end={vec(colorSquareSize, 0)}
                    colors={['#fff', `hsl(${hue}, 100%, 50%)`]}
                  />
                </Rect>
                <Rect x={0} y={0} width={colorSquareSize} height={colorSquareSize}>
                  <SkiaLinearGradient
                    start={vec(0, 0)}
                    end={vec(0, colorSquareSize)}
                    colors={['rgba(0, 0, 0, 0)', '#000']}
                  />
                </Rect>
                <Rect
                  x={sat * colorSquareSize - 5}
                  y={(1 - val) * colorSquareSize - 5}
                  width={10}
                  height={10}
                  color="white"
                  style="stroke"
                  strokeWidth={2}
                />
              </Canvas>
            </View>
            <View style={{ height: 20 }} />
            <View ref={hueSliderRef} {...hueSliderPanResponder.panHandlers}>
              <Canvas style={{ width: sliderWidth, height: hueSliderHeight }}>
                <Rect x={0} y={0} width={sliderWidth} height={hueSliderHeight}>
                  <SkiaLinearGradient
                    start={vec(0, 0)}
                    end={vec(sliderWidth, 0)}
                    colors={[
                      'rgb(255, 0, 0)', 'rgb(255, 255, 0)', 'rgb(0, 255, 0)',
                      'rgb(0, 255, 255)', 'rgb(0, 0, 255)', 'rgb(255, 0, 255)',
                    ]}
                  />
                </Rect>
                <Rect
                  x={(hue / 360) * sliderWidth - 2}
                  y={0}
                  width={4}
                  height={hueSliderHeight}
                  color="white"
                  style="stroke"
                  strokeWidth={2}
                />
              </Canvas>
            </View>
          </View>
          <View style={styles.colorPreview}>
            <View style={[styles.selectedColor, { backgroundColor: hsvToHex(hue, sat, val) }]} />
            <Text color="white">{hsvToHex(hue, sat, val).toUpperCase()}</Text>
          </View>
          <XStack justifyContent="space-between" marginTop={20}>
            <Button onPress={onClose} backgroundColor="$gray8">
              Cancel
            </Button>
            <Button onPress={handleSubmit} backgroundColor="$blue8">
              Select
            </Button>
          </XStack>
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
    alignItems: 'center',
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


// Helper function to convert HSV to HEX
function hsvToHex(h: number, s: number, v: number): string {
  const hsvColor = tinycolor({ h, s, v });
  return hsvColor.toHexString();
}

export default ColorPickerModal;