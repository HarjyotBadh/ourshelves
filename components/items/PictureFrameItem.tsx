import React, { useState, useCallback, useEffect } from "react";
import { Modal, StyleSheet, Dimensions } from "react-native";
import { View, YStack, Button, Image, Text } from "tamagui";
import * as ImagePicker from "expo-image-picker";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "firebaseConfig";

import {
  PictureFrameView,
  ButtonContainer,
  ImageContainer,
  BOTTOM_BAR_HEIGHT,
  BottomBar,
  styles,
} from "styles/PictureFrameStyles";
import { earnCoins } from "project-functions/shopFunctions";

const { width: screenWidth } = Dimensions.get("window");
const FRAME_WIDTH = screenWidth * 1;
const FRAME_HEIGHT = FRAME_WIDTH * 1;

const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * (FRAME_HEIGHT / FRAME_WIDTH);
const PREVIEW_PADDING = 5;

interface DefaultItemData {
  imageUri: string;
}
interface RoomInfo {
  roomId: string;
}
const defaultItemData: DefaultItemData = {
  imageUri: "",
};

interface PictureFrameItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

interface PictureFrameItemComponent extends React.FC<PictureFrameItemProps> {
  getInitialData: () => { imageUri: string };
}

const PictureFrameItem: PictureFrameItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [imageUri, setImageUri] = useState(itemData.imageUri || "");
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const toast = useToastController();

  useEffect(() => {
    setImageUri(itemData.imageUri || "");
  }, [itemData]);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive, dialogOpen]);

  useEffect(() => {
    if (hasChanges) {
      onDataUpdate({
        ...itemData,
        imageUri,
      });
      setHasChanges(false);
    }
  }, [hasChanges, imageUri, itemData, onDataUpdate]);

  const uploadImage = async (uri: string) => {
    if (!roomInfo.roomId) {
      toast.show("Room ID is missing", {
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create unique filename
      const filename = `pictures/${roomInfo.roomId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      // Update state and parent component with the storage URL
      setImageUri(downloadUrl);
      setHasChanges(true);
      onDataUpdate({ ...itemData, imageUri: downloadUrl });

      toast.show("Image uploaded successfully!", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.show("Failed to upload image", {
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      // First, request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.show("Permission to access gallery was denied", {
          duration: 3000,
        });
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      toast.show("Failed to pick image: " + (error.message || "Unknown error"), {
        duration: 3000,
      });
    }
  };

  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        await earnCoins(auth.currentUser.uid, 10);
        toast.show("You earned 10 coins for updating the picture!", {
          duration: 3000,
        });
        setHasChanges(false);
      }
      onClose();
    } catch (error) {
      console.error("Error closing picture frame:", error);
      toast.show("Error while closing", {
        duration: 3000,
      });
    }
  }, [itemData, imageUri, onDataUpdate, onClose, hasChanges]);

  const renderPictureFramePreview = () => (
    <View style={{ padding: PREVIEW_PADDING }}>
      <Image
        source={{ uri: imageUri }}
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          borderRadius: 4,
        }}
        resizeMode="cover"
      />
    </View>
  );

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        {imageUri ? renderPictureFramePreview() : <Text style={styles.noImageText}>No image</Text>}
      </YStack>
    );
  }

  return (
    <Modal
      visible={dialogOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDialogClose}
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
          <ImageContainer width={FRAME_WIDTH - 20} height={FRAME_HEIGHT - 20}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
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
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Pick an image"}
            </Button>
            <Button
              onPress={handleClose}
              backgroundColor="$blue10"
              color="white"
              size="$3"
              disabled={isUploading}
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

export default PictureFrameItem;
