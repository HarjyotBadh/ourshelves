import React, { useState, useCallback, useEffect, useRef } from "react";
import { Modal, View, Alert, TextInput, ActivityIndicator, Platform } from "react-native";
import { YStack, Button, Image, Text } from "tamagui";
import * as ImagePicker from "expo-image-picker";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { ref, uploadBytes, getDownloadURL, UploadTask } from "firebase/storage";
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

// Constants
const PREVIEW_WIDTH = 110;
const PREVIEW_HEIGHT = 100;
const PREVIEW_PADDING = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_RETRIES = 3;
const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const DEFAULT_IMAGE_URI = "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/items%2Fpicture_frame.png?alt=media&token=16688f79-a4ba-41d2-a345-8e018a3ad7a1";

// Types
interface PictureFrameItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    location?: string;
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
  getInitialData: () => { imageUri: string; location: string };
}

const PictureFrameItem: PictureFrameItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  // State management
  const [imageUri, setImageUri] = useState<string>(itemData.imageUri || "");
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [location, setLocation] = useState<string>(itemData.location || "");
  const [isLocationValid, setIsLocationValid] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Refs
  const uploadTaskRef = useRef<UploadTask | null>(null);
  
  // Hooks
  const toast = useToastController();
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;

  // Effects
  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    setImageUri(itemData.imageUri || "");
    setLocation(itemData.location || "");
  }, [itemData]);

  useEffect(() => {
    return () => {
      // Cleanup function
      if (uploadTaskRef.current) {
        // Cancel any ongoing upload
        uploadTaskRef.current.cancel();
      }
      setIsUploading(false);
      setUploadProgress(0);
    };
  }, []);

  // Helper functions
  const validateLocation = (location: string): boolean => {
    const locationRegex = /^[a-zA-Z\s,]+$/;
    return location.trim().length > 0 && locationRegex.test(location.trim());
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    if (!roomInfo.roomId) {
      throw new Error("Room ID is missing");
    }
  
    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
  
        // Validate file type
        const fileExtension = uri.split('.').pop()?.toLowerCase();
        if (!fileExtension || !VALID_EXTENSIONS.includes(fileExtension)) {
          throw new Error('Invalid file type. Please use JPG or PNG images.');
        }
  
        // Fetch and validate file size
        const response = await fetch(uri);
        const blob = await response.blob();
        if (blob.size > MAX_FILE_SIZE) {
          throw new Error('File too large. Please use an image under 5MB.');
        }
  
        // Upload to Firebase
        const filename = `pictures/${roomInfo.roomId}/${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, filename);
        
        // Perform the upload without storing the task
        const uploadResult = await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        return downloadUrl;
      } catch (error) {
        retryCount++;
        if (retryCount === MAX_RETRIES) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    return null;
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        toast.show("Permission to access gallery was denied", { duration: 3000 });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Lower quality to reduce file size
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        try {
          const downloadUrl = await uploadImage(result.assets[0].uri);
          if (downloadUrl) {
            setImageUri(downloadUrl);
            setHasChanges(true);
            onDataUpdate({ ...itemData, imageUri: downloadUrl, location });
            toast.show("Image uploaded successfully!", { duration: 3000 });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
          toast.show(errorMessage, { duration: 3000 });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      toast.show("Failed to pick image", { duration: 3000 });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    setIsLocationValid(validateLocation(text));
  };

  const handleClose = useCallback(async () => {
    try {
      if (hasChanges) {
        await earnCoins(auth.currentUser!.uid, 10);
        toast.show("You earned 10 coins for updating the picture!", {
          duration: 3000,
        });
        setHasChanges(false);
      }
      onClose();
    } catch (error) {
      console.error("Error closing picture frame:", error);
      toast.show("Error while closing", { duration: 3000 });
    }
  }, [hasChanges, onClose]);

  const handleDialogClose = () => {
    if (!isUploading) {
      setDialogOpen(false);
      onClose();
    }
  };

  // Render inactive state
  if (!isActive) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <View style={styles.iconContainer}>
          <Image
            source={{ uri: imageUri || DEFAULT_IMAGE_URI }}
            style={{
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              borderRadius: 8,
              marginTop: PREVIEW_PADDING,
            }}
            resizeMode="cover"
          />
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
            
            {isUploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Uploading image... {Math.round(uploadProgress)}%</Text>
              </View>
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

PictureFrameItem.getInitialData = () => ({
  imageUri: "",
  location: "",
});

export default PictureFrameItem;