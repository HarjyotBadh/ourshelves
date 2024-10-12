import React from "react";
import {
  Dialog,
  Accordion,
  YStack,
  Button,
  Text,
  XStack,
  styled,
  ScrollView,
  Avatar,
} from "tamagui";
import { Settings, Users, Shield, ChevronDown, ChevronUp, X, Info } from "@tamagui/lucide-icons";

const BACKGROUND_COLOR = "$yellow2Light";
const HEADER_BACKGROUND = "#8B4513";
const USER_ITEM_BACKGROUND = "#DEB887";

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
}

const StyledAccordionItem = styled(Accordion.Item, {
  backgroundColor: "$backgroundStrong",
  marginBottom: "$2",
  borderRadius: "$4",
  overflow: "hidden",
});

const StyledAccordionTrigger = styled(Accordion.Trigger, {
  padding: "$3",
  backgroundColor: HEADER_BACKGROUND,
});

const StyledAccordionContent = styled(Accordion.Content, {
  padding: "$3",
  backgroundColor: BACKGROUND_COLOR,
});

const IconWrapper = styled(XStack, {
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 16,
  marginRight: "$2",
});

const UserItem = styled(XStack, {
  alignItems: "center",
  paddingVertical: "$2",
  paddingHorizontal: "$3",
  borderRadius: "$2",
  marginBottom: "$1",
  backgroundColor: USER_ITEM_BACKGROUND,
});

const Header = styled(XStack, {
  height: 60,
  backgroundColor: HEADER_BACKGROUND,
  alignItems: "center",
  paddingHorizontal: "$4",
});

const HeaderButton = styled(Button, {
  width: 50,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
});

const RoomSettingsDialog: React.FC<RoomSettingsDialogProps> = ({
  open,
  onOpenChange,
  users,
  roomDescription,
  onRemoveUser,
  currentUserId,
}) => {
  const renderUserList = () => (
    <YStack gap="$2">
      {users.map((user) => (
        <UserItem key={user.id}>
          <Avatar circular size="$3" mr="$3">
            {user.profilePicture ? (
              <Avatar.Image source={{ uri: user.profilePicture }} />
            ) : (
              <Avatar.Image
                source={{
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.displayName
                  )}&background=random`,
                }}
              />
            )}
            <Avatar.Fallback bc="$blue5" />
          </Avatar>
          <Text flex={1} color="black">
            {user.displayName}
          </Text>
          {user.isAdmin ? (
            <IconWrapper backgroundColor="$blue8">
              <Shield color="$blue11" size={16} />
            </IconWrapper>
          ) : (
            <IconWrapper
              backgroundColor="$red8"
              onPress={() => onRemoveUser(user.id)}
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
          width="80%"
          height="80%"
          backgroundColor={BACKGROUND_COLOR}
        >
          <YStack flex={1}>
            <Header>
              <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center" color="white">
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
                      <Text color="black">Setting 1: Value</Text>
                      <Text color="black">Setting 2: Value</Text>
                      <Text color="black">Setting 3: Value</Text>
                    </StyledAccordionContent>
                  </StyledAccordionItem>
                </Accordion>
              </YStack>
            </ScrollView>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default RoomSettingsDialog;
