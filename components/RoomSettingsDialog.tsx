import React, { useState } from "react";
import { Button, Dialog, Accordion, YStack, Text, XStack, ScrollView, Avatar, AlertDialog } from "tamagui";
import {
  Settings,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  AlertTriangle,
} from "@tamagui/lucide-icons";
import {
  StyledAccordionItem,
  StyledAccordionTrigger,
  StyledAccordionContent,
  IconWrapper,
  UserItem,
  Header,
  HeaderButton,
  SearchInput,
  StyledAlertDialogContent,
  StyledAlertDialogTitle,
  StyledAlertDialogDescription,
  StyledAlertDialogButton,
  BACKGROUND_COLOR,
  HEADER_BACKGROUND,
} from "../styles/RoomSettingsStyles";
import ColorPickerModal from "./ColorPickerModal";

interface User {
  id: string;
  displayName: string;
  profilePicture?: string;
  isAdmin: boolean;
}

interface RoomSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  roomDescription?: string;
  onRemoveUser: (userId: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  currentUserId: string;
}

const RoomSettingsDialog: React.FC<RoomSettingsDialogProps> = ({
  open,
  onOpenChange,
  users,
  roomDescription,
  onRemoveUser,
  color,
  onColorChange,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveUser = (user: User) => {
    setUserToRemove(user);
    setConfirmationOpen(true);
  };

  const confirmRemoveUser = () => {
    if (userToRemove) {
      onRemoveUser(userToRemove.id);
    }
    setConfirmationOpen(false);
    setUserToRemove(null);
  };

  const renderUserList = () => (
    <YStack gap="$2">
      <SearchInput
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredUsers.map((user) => (
        <UserItem key={user.id}>
          <Avatar circular size="$4" mr="$3">
            {user.profilePicture ? (
              <Avatar.Image source={{ uri: user.profilePicture }} />
            ) : (
              <Avatar.Fallback delayMs={600}>
                <Text fontSize="$2" color="white">
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            )}
          </Avatar>
          <Text flex={1} fontSize="$4" fontWeight="500" color="black">
            {user.displayName}
          </Text>
          {user.isAdmin ? (
            <IconWrapper backgroundColor="$blue8">
              <Shield color="white" size={16} />
            </IconWrapper>
          ) : (
            <IconWrapper
              backgroundColor="$red8"
              onPress={() => handleRemoveUser(user)}
              disabled={currentUserId === user.id}
            >
              <X color="white" size={16} />
            </IconWrapper>
          )}
        </UserItem>
      ))}
    </YStack>
  );

  return (
    <>
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            y={0}
            opacity={1}
            scale={1}
            width="90%"
            maxWidth={500}
            height="80%"
            backgroundColor={BACKGROUND_COLOR}
          >
            <YStack flex={1}>
              <Header>
                <Text fontSize={20} fontWeight="bold" flex={1} textAlign="center" color="white">
                  Room Settings
                </Text>
                <Dialog.Close asChild>
                  <HeaderButton unstyled>
                    <X color="white" size={24} />
                  </HeaderButton>
                </Dialog.Close>
              </Header>
              <ScrollView flex={1}>
                <YStack padding="$4" gap="$4">
                  <Accordion type="multiple" overflow="hidden" width="100%">
                    <StyledAccordionItem value="description">
                      <StyledAccordionTrigger>
                        {({ open }) => (
                          <XStack alignItems="center">
                            <IconWrapper backgroundColor="$blue8">
                              <Info color="white" />
                            </IconWrapper>
                            <Text flex={1} fontSize="$5" fontWeight="600" color="white">
                              Room Description
                            </Text>
                            {open ? <ChevronUp color="white" /> : <ChevronDown color="white" />}
                          </XStack>
                        )}
                      </StyledAccordionTrigger>
                      <StyledAccordionContent>
                        <Text color="black">{roomDescription || "No description available."}</Text>
                      </StyledAccordionContent>
                    </StyledAccordionItem>

                    <StyledAccordionItem value="users">
                      <StyledAccordionTrigger>
                        {({ open }) => (
                          <XStack alignItems="center">
                            <IconWrapper backgroundColor="$green8">
                              <Users color="white" />
                            </IconWrapper>
                            <Text flex={1} fontSize="$5" fontWeight="600" color="white">
                              Users
                            </Text>
                            {open ? <ChevronUp color="white" /> : <ChevronDown color="white" />}
                          </XStack>
                        )}
                      </StyledAccordionTrigger>
                      <StyledAccordionContent>{renderUserList()}</StyledAccordionContent>
                    </StyledAccordionItem>

                    <StyledAccordionItem value="settings">
                      <StyledAccordionTrigger>
                        {({ open }) => (
                          <XStack alignItems="center">
                            <IconWrapper backgroundColor="$orange8">
                              <Settings color="white" />
                            </IconWrapper>
                            <Text flex={1} fontSize="$5" fontWeight="600" color="white">
                              General Settings
                            </Text>
                            {open ? <ChevronUp color="white" /> : <ChevronDown color="white" />}
                          </XStack>
                        )}
                      </StyledAccordionTrigger>
                      <StyledAccordionContent>
                        <XStack margin="$2" gap="$4" justifyContent="center" alignItems="center">
                          <ColorPickerModal
                            isVisible={isColorPickerVisible}
                            onClose={() => setIsColorPickerVisible(false)}
                            onColorSelected={onColorChange}
                            initialColor={color}
                          />
                        </XStack>
                        <Button onPress={() => setIsColorPickerVisible(true)}>
                          <Text>Set Room Color</Text>
                        </Button>
                      </StyledAccordionContent>
                    </StyledAccordionItem>
                  </Accordion>
                </YStack>
              </ScrollView>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <StyledAlertDialogContent
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          >
            <YStack gap="$4" alignItems="center">
              <AlertTriangle color={HEADER_BACKGROUND} size={40} />
              <StyledAlertDialogTitle>Confirm User Removal</StyledAlertDialogTitle>
              <StyledAlertDialogDescription>
                Are you sure you want to remove {userToRemove?.displayName} from this room? This
                action cannot be undone.
              </StyledAlertDialogDescription>

              <XStack gap="$3" justifyContent="center" width="100%">
                <AlertDialog.Cancel asChild>
                  <StyledAlertDialogButton theme="alt1" aria-label="Cancel">
                    Cancel
                  </StyledAlertDialogButton>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <StyledAlertDialogButton
                    theme="active"
                    aria-label="Remove User"
                    onPress={confirmRemoveUser}
                  >
                    Remove User
                  </StyledAlertDialogButton>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </StyledAlertDialogContent>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  );
};

export default RoomSettingsDialog;
