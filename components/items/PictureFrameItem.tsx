import React, { useState, useCallback, useEffect } from "react";
import { Modal, View, Alert, TextInput } from "react-native";
import { YStack, Button, Image, Text } from "tamagui";
import * as ImagePicker from "expo-image-picker";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "firebaseConfig";
import { Image as ImageIcon, Trash } from "@tamagui/lucide-icons";
import { earnCoins } from "project-functions/shopFunctions";

import {
  PictureFrameView,
  ButtonContainer,
  ImageContainer,
  BottomBar,
  styles,
} from "styles/PictureFrameStyles";

const PREVIEW_WIDTH = 110;
const PREVIEW_HEIGHT = 100;
const PREVIEW_PADDING = 20;

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

const DEFAULT_IMAGE_URI = "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/items%2Fpicture_frame.png?alt=media&token=16688f79-a4ba-41d2-a345-8e018a3ad7a1";

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
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;
  const [location, setLocation] = useState<string>(itemData.location || "");
  const [isLocationValid, setIsLocationValid] = useState<boolean>(true);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    setImageUri(itemData.imageUri || "");
  }, [itemData]);

  const uploadImage = async (uri: string) => {
    if (!roomInfo.roomId) {
      toast.show("Room ID is missing", {
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `pictures/${roomInfo.roomId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

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

  const validateLocation = (location: string): boolean => {
    // Example: Ensure location is not empty and contains only letters and spaces
    const locationRegex = /^[a-zA-Z\s,]+$/;
    return locationRegex.test(location.trim());
  }; 

  const onUploadImage = async () => {
    if (!imageUri) {
      Alert.alert("No image selected!");
      return;
    }

    if (!validateLocation(location)) {
      setIsLocationValid(false); // Explicitly mark location as invalid
      Alert.alert("Invalid location! Please enter a valid location.");
      return;
    }

    setIsLocationValid(true); // Mark as valid if this point is reached

    try {
      const uploadedImageUri = await uploadImage(imageUri);
      const updatedData = { ...itemData, imageUri: uploadedImageUri, location };
      onDataUpdate(updatedData);
      Alert.alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Failed to upload image. Please try again.");
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    setIsLocationValid(validateLocation(text)); // Update validity state in real-time
  };



  const pickImage = async () => {
    try {
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
        setHasChanges(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      toast.show("Failed to pick image", {
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
  }, [hasChanges, onClose]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <View style={styles.iconContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: PREVIEW_WIDTH,
                height: PREVIEW_HEIGHT,
                borderRadius: 8,
                marginTop: PREVIEW_PADDING,
              }}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={{ uri: DEFAULT_IMAGE_URI }}
              style={{
                width: PREVIEW_WIDTH,
                height: PREVIEW_HEIGHT,
                borderRadius: 8,
                marginTop: PREVIEW_PADDING,
              }}
              resizeMode="cover"
            />
          )}
        </View>
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
      <View style={styles.modalContainer}>
        <PictureFrameView>
          <Text style={styles.headerText}>
            {isOwner ? "Your Picture Frame" : "View Picture"}
          </Text>
          
          <ImageContainer>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.noImageText}>No image uploaded yet.</Text>
            )}
          </ImageContainer>
          <TextInput
        style={[styles.textInput, !isLocationValid && styles.invalidInput]}
        placeholder="Enter location (e.g., City, Country)"
        value={location}
        onChangeText={handleLocationChange}
      />
      {!isLocationValid && (
        <Text style={styles.errorText}>Please enter a valid location.</Text>
      )}
          <ButtonContainer>
            {isOwner && (
              <>
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
                {imageUri && (
                  <Button
                    onPress={async () => {
                      try {
                        // Update state and parent component
                        setImageUri("");
                        onDataUpdate({ ...itemData, imageUri: "" });
                        setHasChanges(true);
                        toast.show("Image removed successfully!", {
                          duration: 3000,
                        });
                      } catch (error) {
                        console.error("Error removing image:", error);
                        toast.show("Failed to remove image", {
                          duration: 3000,
                        });
                      }
                    }}
                    backgroundColor="$red10"
                    color="white"
                    size="$3"
                    marginRight="$2"
                    icon={Trash}
                  />
                )}
              </>
            )}
            <Button
              onPress={handleClose}
              backgroundColor={isOwner ? "$gray10" : "$red10"}
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
      </View>
    </Modal>
  );
};

PictureFrameItem.getInitialData = () => ({ imageUri: "" });

export default PictureFrameItem;