import { PlusCircle, X } from "@tamagui/lucide-icons";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { SizeTokens} from 'tamagui';
import {
  Adapt,
  Button,
  Dialog,
  Fieldset,
  Input,
  Label,
  Sheet,
  Separator,
  Switch, 
  TextArea,
  Unspaced,
  View,
  XStack,
} from "tamagui";
import ColorPicker from "./ColorPicker";

const CreateHomeTile = ({ handleCreateRoom }) => {
  const [roomName, setRoomName] = React.useState("");
  const [roomDescription, setRoomDescription] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false)
  const [roomColor, setRoomColor] = React.useState("#ffffff");

  const createRoom = () => {
    handleCreateRoom(roomName, roomDescription, isPublic);
  };

  const handleDescriptionChange = useCallback((text) => {
    setRoomDescription(text);
  }, []);

  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <Pressable style={styles.pressable}>
          <View style={styles.pressableSquare}>
            <PlusCircle size={75} color="rgba(0, 0, 0, 0.2)" />
          </View>
          <Text style={styles.pressableText}>Create Room</Text>
        </Pressable>
      </Dialog.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quicker",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Create Room</Dialog.Title>
          <Dialog.Description>Create a room here.</Dialog.Description>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Name
            </Label>
            <Input flex={1} placeholder="Room name" value={roomName} onChangeText={setRoomName} />
          </Fieldset>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="description">
              Description
            </Label>
            <TextArea
              flex={1}
              placeholder="Room description"
              defaultValue={roomDescription}
              onChangeText={handleDescriptionChange}
            />
          </Fieldset>
          <Fieldset gap="$5" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="description">
              Room Privacy
            </Label>
            <SwitchWithLabel size="$4" onToggle={(checked) => setIsPublic(checked)} />
          </Fieldset>


          <XStack alignSelf="flex-end" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              <Button theme="active" aria-label="Close" onPress={createRoom}>
                Create room
              </Button>
            </Dialog.Close>
          </XStack>

          <Unspaced>
            <Dialog.Close asChild>
              <Button position="absolute" top="$3" right="$3" size="$2" circular icon={X} />
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  createHomeContainer: {},
  pressable: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  pressableSquare: {
    width: 150,
    height: 150,
    borderWidth: 8,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 15,
    borderStyle: "dashed",

    justifyContent: "center",
    alignItems: "center",
  },
  pressableText: {
    color: "#000",
    fontSize: 16,
  },
});

export default CreateHomeTile;

export function SwitchWithLabel(props: { 
  size: SizeTokens; 
  defaultChecked?: boolean; 
  onToggle: (checked: boolean) => void; 
}) {
const id = `switch-${props.size.toString().slice(1)}-${props.defaultChecked ?? ''}}`;

return (
  <XStack width={200} alignItems="center" gap="$2">
    <Label
      paddingRight="$0"
      minWidth={90}
      justifyContent="flex-end"
      size={props.size}
      htmlFor={id}
    >
      Room is Public
    </Label>
    <Separator minHeight={20} vertical />
    <Switch 
      id={id} 
      size={props.size} 
      defaultChecked={props.defaultChecked} 
      onCheckedChange={props.onToggle}
    >
      <Switch.Thumb animation="quicker" />
    </Switch>
  </XStack>
);
}


