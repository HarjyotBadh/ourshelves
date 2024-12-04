// components/ProfileMenu.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Sheet, Button, XStack, YStack, Switch, Label } from "tamagui";
import { Menu, Tags, Volume2, Music } from "@tamagui/lucide-icons";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "firebaseConfig";

interface ProfileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTags: () => void;
  muteSfx: boolean;
  muteMusic: boolean;
}
// ProfileMenu.tsx
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  open,
  onOpenChange,
  onAddTags,
  muteSfx,
  muteMusic,
}) => {
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