// components/ProfileMenu.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Sheet, Button, XStack, YStack, Switch, Label, Dialog, Input } from "tamagui";
import { Menu, Tags, Volume2, Music } from "@tamagui/lucide-icons";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "firebaseConfig";

interface ProfileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTags: () => void;
  muteSfx: boolean;
  muteMusic: boolean;
  onChangeUsername: () => void;
}
// ProfileMenu.tsx
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  open,
  onOpenChange,
  onAddTags,
  muteSfx,
  muteMusic,
  onChangeUsername,
}) => {

  const [newUsername, setNewUsername] = useState("");
  const [showChangeUsernameDialog, setShowChangeUsernameDialog] = useState(false);
  const handleMuteChange = async (type: "sfx" | "music", isChecked: boolean) => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "Users", auth.currentUser.uid);
    const updateData = type === "sfx" ? { muteSfx: isChecked } : { muteMusic: isChecked };

    try {
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error("Error updating mute settings:", error);
    }
  };

  const NAME_REGEX = /^[a-zA-Z0-9_]+$/; // Define the regex for valid usernames
  const handleChangeUsername = async () => {
    if (newUsername.trim() === "") {
      alert("Username cannot be empty.");
      return;
    } else if (!NAME_REGEX.test(newUsername)) {
      alert("Username can only contain letters, numbers, and underscores.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        await setDoc(userRef, { displayName: newUsername }, { merge: true });
        alert("Username updated successfully!");
      } else {
        alert("No user is signed in.");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username. Please try again.");
    } finally {
      setShowChangeUsernameDialog(false);
      setNewUsername("");
    }
  };

  return (
    <Sheet 
      open={open} 
      onOpenChange={onOpenChange}
      snapPoints={[45]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4">
        <Sheet.Handle />
        <YStack space="$4">
          <Button
            icon={Tags}
            onPress={onAddTags}
            theme="blue"
          >
            Add Tags
          </Button>
          <Button
            onPress={() => setShowChangeUsernameDialog(true)}
            theme="blue"
          >
            Change Username
          </Button>
          <Dialog open={showChangeUsernameDialog} onOpenChange={setShowChangeUsernameDialog}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            bordered
            elevate
            gap="$4"
          >
            <Dialog.Title>Change Username</Dialog.Title>
            <Dialog.Description>Enter your new username:</Dialog.Description>
            <Input
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="New Username"
            />
            <XStack gap="$3" justifyContent="flex-end">
              <Dialog.Close asChild>
                <Button theme="alt1">Cancel</Button>
              </Dialog.Close>
              <Button theme="blue" onPress={handleChangeUsername}>
                Change Username
              </Button>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
          <XStack alignItems="center" justifyContent="space-between">
            <XStack space="$2" alignItems="center">
              <Volume2 size={20} />
              <Label size="$4">Mute SFX</Label>
            </XStack>
            <Switch
              size="$4"
              checked={muteSfx}
              onCheckedChange={(isChecked) => handleMuteChange("sfx", isChecked)}
            >
              <Switch.Thumb />
            </Switch>
          </XStack>

          <XStack alignItems="center" justifyContent="space-between">
            <XStack space="$2" alignItems="center">
              <Music size={20} />
              <Label size="$4">Mute Music</Label>
            </XStack>
            <Switch
              size="$4"
              checked={muteMusic}
              onCheckedChange={(isChecked) => handleMuteChange("music", isChecked)}
            >
              <Switch.Thumb />
            </Switch>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
    
  );
};