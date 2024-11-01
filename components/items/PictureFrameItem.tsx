import React, { useState, useCallback } from "react";
import { Modal, StyleSheet, Dimensions } from "react-native";
import { View, YStack, Button, Image, Text } from "tamagui";
import * as ImagePicker from 'expo-image-picker';
import { ToastViewport, useToastController } from "@tamagui/toast";
import { PictureFrameItemComponent } from "models/PictureFrameModel";

import {
  PictureFrameView,
  ButtonContainer,
  ImageContainer,
  BOTTOM_BAR_HEIGHT,
  BottomBar,
  styles,
} from "styles/PictureFrameStyles";
import { auth } from "firebaseConfig";
import { earnCoins } from "project-functions/shopFunctions";

const { width: screenWidth } = Dimensions.get("window");
const FRAME_WIDTH = screenWidth * 1; // 70% of screen width
const FRAME_HEIGHT = FRAME_WIDTH * 1;

const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * (FRAME_HEIGHT / FRAME_WIDTH);
const PREVIEW_PADDING = 5;

interface DefaultItemData {
  imageUri: string;
}

const defaultItemData: DefaultItemData = {
  imageUri: ""
};

const PictureFrameItem: PictureFrameItemComponent = ({
  itemData = defaultItemData,
  onDataUpdate = () => {},
  isActive = false,
  onClose = () => {},
  roomInfo = {}
}) => {
  const [imageUri, setImageUri] = useState(itemData.imageUri || "");
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToastController();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleImageUriChange(result.assets[0].uri);
    }
  };

  const handleImageUriChange = (uri: string) => {
    setImageUri(uri);
    setHasChanges(true);
    onDataUpdate({ ...itemData, imageUri: uri });
  };

  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        earnCoins(auth.currentUser.uid, 10);
        toast.show("You earned 10 coins for updating the picture!", {
          duration: 3000,
        });
        setHasChanges(false);
      }
      onClose();
    } catch (error) {
      console.error("Error closing picture frame:", error);
    }
  }, [itemData, imageUri, onDataUpdate, onClose, hasChanges]);

  const renderPictureFramePreview = () => (
    <View style={{ padding: PREVIEW_PADDING }}>
      <Image
        source={{ uri: imageUri }}
        style={{ 
          width: PREVIEW_WIDTH, 
          height: PREVIEW_HEIGHT,
          borderRadius: 4 
        }}
        resizeMode="cover"
      />
    </View>
  );

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        {imageUri ? renderPictureFramePreview() : (
          <Text style={styles.noImageText}>No image</Text>
        )}
      </YStack>
    );
  }

  return (
    <Modal
      visible={isActive}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="center"
        alignItems="center"
      >
        <PictureFrameView
          padding="$2"
          width={FRAME_WIDTH}
          height={FRAME_HEIGHT + 80}
          position="relative"
        >
          <ImageContainer
            width={FRAME_WIDTH - 20}
            height={FRAME_HEIGHT - 20}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  borderRadius: 4
                }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.noImageText}>No image uploaded yet.</Text>
            )}
          </ImageContainer>
          <ButtonContainer marginTop="$2">
            <Button
              onPress={pickImage}
              backgroundColor="$blue10"
              color="white"
              size="$3"
              marginRight="$2"
            >
              Pick an image
            </Button>
            <Button
              onPress={handleClose}
              backgroundColor="$blue10"
              color="white"
              size="$3"
            >
              Close
            </Button>
          </ButtonContainer>
          <BottomBar />
        </PictureFrameView>
        <ToastViewport name="pictureframe" />
      </YStack>
    </Modal>
  );
};

PictureFrameItem.getInitialData = () => defaultItemData;

const ExportedPictureFrameItem: PictureFrameItemComponent = PictureFrameItem;
export default ExportedPictureFrameItem;