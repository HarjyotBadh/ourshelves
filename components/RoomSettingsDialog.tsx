import React, { useState } from "react";
import {
  Dialog,
  Accordion,
  YStack,
  Text,
  XStack,
  ScrollView,
  Avatar,
  AlertDialog,
  Switch,
  Button,
} from "tamagui";
import {
  Settings,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  AlertTriangle,
  List,
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
import { DraggableShelfList } from "./DraggableShelfList";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useRouter, useLocalSearchParams } from "expo-router";

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
  currentUserId: string;
  hasPersonalShelves: boolean;
  onPersonalShelvesToggle: (value: boolean) => void;
  shelves: { id: string; name: string; position: number }[];
  onShelvesReorder: (newOrder: { id: string; position: number }[]) => void;
}

const RoomSettingsDialog: React.FC<RoomSettingsDialogProps> = ({
  open,
  onOpenChange,
  users,
  roomDescription,
  onRemoveUser,
  currentUserId,
  hasPersonalShelves,
  onPersonalShelvesToggle,
  shelves,
  onShelvesReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [personalShelvesConfirmOpen, setPersonalShelvesConfirmOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const { roomId } = useLocalSearchParams<{ roomId: string }>();


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

  const handlePromoteUser = async (roomId: string, userIdToPromote: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('You must be logged in to promote a user.');
      return;
    }

    try {
      // Step 1: Check if the current user is an admin of the room
      const db = getFirestore(getApp());
      const roomRef = doc(db, 'Rooms', roomId);
      console.log("Fetched roomId:", roomId);
      const roomDoc = await getDoc(roomRef);
      console.log("Fetched room document:", roomDoc.data());
      if (!roomDoc.exists()) {
        alert('Room does not exist.');
        return;
      }

      const roomData = roomDoc.data();
      const admins = roomData?.admins || [];
      const userRef = doc(db, "Users", userIdToPromote);
      // Step 2: Add the user to the admins array
      if (!admins.includes(userIdToPromote)) {
        await updateDoc(roomRef, {
          admins: arrayUnion(userRef), // Use the reference to the user document
        });
        alert('User successfully promoted to admin.');
      } else {
        alert('User is already an admin.');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('There was an error promoting the user.');
    }
  };

  const handlePersonalShelvesChange = (value: boolean) => {
    if (!value) {
      setPersonalShelvesConfirmOpen(true);
    } else {
      onPersonalShelvesToggle(true);
    }
  };

  const confirmDisablePersonalShelves = () => {
    onPersonalShelvesToggle(false);
    setPersonalShelvesConfirmOpen(false);
  };

  const isCurrentUserAdmin = users.some((user) => user.id === currentUserId && user.isAdmin);

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
                    <StyledAccordionItem value="promotions">
  <StyledAccordionTrigger>
    {({ open }) => (
      <XStack alignItems="center">
        <IconWrapper backgroundColor="$green8">
          <Users color="white" />
        </IconWrapper>
        <Text flex={1} fontSize="$5" fontWeight="600" color="white">
          Promotions
        </Text>
        {open ? <ChevronUp color="white" /> : <ChevronDown color="white" />}
      </XStack>
    )}
  </StyledAccordionTrigger>
  <StyledAccordionContent>
    <YStack gap="$2">
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
          {/* Show promote button only for non-admins and if the current user is an admin */}
          {isCurrentUserAdmin && !user.isAdmin && (
            <Button
              onPress={() => handlePromoteUser(roomId, user.id)} // Pass roomId and user.id
              backgroundColor={HEADER_BACKGROUND}
              color="white"
              size="$2"
            >
              Promote
            </Button>
          )}
        </UserItem>
      ))}
    </YStack>
  </StyledAccordionContent>
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
                        <YStack gap="$3">
                          {isCurrentUserAdmin && (
                            <>
                              <XStack alignItems="center" justifyContent="space-between">
                                <Text color="black" flex={1}>
                                  Personal Shelves
                                </Text>
                                <Switch
                                  checked={hasPersonalShelves}
                                  onCheckedChange={handlePersonalShelvesChange}
                                  backgroundColor={
                                    hasPersonalShelves ? HEADER_BACKGROUND : "$gray5"
                                  }
                                >
                                  <Switch.Thumb animation="quick" />
                                </Switch>
                              </XStack>

                              <XStack alignItems="center" justifyContent="space-between">
                                <Text color="black" flex={1}>
                                  Reorder Shelves
                                </Text>
                                <Button
                                  onPress={() => setReorderDialogOpen(true)}
                                  backgroundColor={HEADER_BACKGROUND}
                                  color="white"
                                  icon={List}
                                >
                                  Reorder
                                </Button>
                              </XStack>
                            </>
                          )}
                        </YStack>
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

      <AlertDialog open={personalShelvesConfirmOpen} onOpenChange={setPersonalShelvesConfirmOpen}>
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
              <StyledAlertDialogTitle>Disable Personal Shelves?</StyledAlertDialogTitle>
              <StyledAlertDialogDescription>
                Are you sure you want to disable personal shelves? This will remove all personal
                shelves from the room and their contents will be lost.
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
                    aria-label="Disable Personal Shelves"
                    onPress={confirmDisablePersonalShelves}
                  >
                    Disable
                  </StyledAlertDialogButton>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </StyledAlertDialogContent>
        </AlertDialog.Portal>
      </AlertDialog>

      <Dialog modal open={reorderDialogOpen} onOpenChange={setReorderDialogOpen}>
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
                  Reorder Shelves
                </Text>
                <Dialog.Close asChild>
                  <HeaderButton unstyled>
                    <X color="white" size={24} />
                  </HeaderButton>
                </Dialog.Close>
              </Header>
              <YStack flex={1} padding="$4">
                <DraggableShelfList
                  shelves={shelves}
                  onReorder={onShelvesReorder}
                  onClose={() => setReorderDialogOpen(false)}
                />
              </YStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
};

export default RoomSettingsDialog;
