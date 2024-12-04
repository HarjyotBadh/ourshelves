import React from 'react';
import { View } from 'react-native';
import { Dialog, Button, XStack, YStack, Label, Separator, Input, Text } from 'tamagui';
import { CirclePlus, CircleMinus } from "@tamagui/lucide-icons";
import {
  DialogContent,
  DialogTitle,
  InputGroup,
  votingStyles,
} from 'styles/VotingBoxStyles';

interface VotingBoxOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setOptions: (topic: string, numOptions: number, options: string[]) => void;
}

export const VotingBoxOptionsDialog: React.FC<VotingBoxOptionsDialogProps> = ({
  open,
  onOpenChange,
  setOptions
}) => {
  const [topic, setTopic] = React.useState('');
  const [numOptions, setNumOptions] = React.useState(2);
  const [option1, setOption1] = React.useState('');
  const [option2, setOption2] = React.useState('');
  const [option3, setOption3] = React.useState('');
  const [option4, setOption4] = React.useState('');

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
        <DialogContent
          elevation={10}
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          <DialogTitle>Create Poll</DialogTitle>

          <YStack padding="$4" gap="$2">
            <InputGroup>
              <Label width={80} color="black">Topic</Label>
              <Separator minHeight={20} vertical />
              <Input
                flex={1}
                placeholder="Enter a Topic"
                value={topic}
                onChangeText={setTopic}
                backgroundColor="white"
                color="black"
                height="$5"
                fontSize="$5"
                borderWidth={1}
                borderColor="$gray8"
              />
            </InputGroup>

            {[
              { value: option1, setValue: setOption1, num: 1 },
              { value: option2, setValue: setOption2, num: 2 },
              { value: option3, setValue: setOption3, num: 3 },
              { value: option4, setValue: setOption4, num: 4 },
            ].map((option, index) => (
              index < numOptions && (
                <InputGroup key={index}>
                  <Label width={80} color="black">Option {option.num}</Label>
                  <Separator minHeight={20} vertical />
                  <Input
                    flex={1}
                    placeholder={`Option ${option.num}`}
                    value={option.value}
                    onChangeText={option.setValue}
                    backgroundColor="white"
                    color="black"
                    height="$5"
                    fontSize="$5"
                    borderWidth={1}
                    borderColor="$gray8"
                  />
                </InputGroup>
              )
            ))}

            <XStack justifyContent="center" gap="$4">
              {numOptions > 2 && (
                <Button
                  icon={CircleMinus}
                  size="$4"
                  theme="red"
                  onPress={() => setNumOptions(numOptions - 1)}
                />
              )}
              {numOptions < 4 && (
                <Button
                  icon={CirclePlus}
                  size="$4"
                  theme="blue"
                  onPress={() => setNumOptions(numOptions + 1)}
                />
              )}
            </XStack>

            <XStack justifyContent="center" gap="$4">
              <Button
                theme="red"
                width={120}
                onPress={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                theme="green"
                width={120}
                onPress={() => {
                  setOptions(topic, numOptions, [option1, option2, option3, option4]);
                  onOpenChange(false);
                }}
              >
                Create
              </Button>
            </XStack>
          </YStack>

          <View style={votingStyles.bottomBar} />
        </DialogContent>
      </Dialog.Portal>
    </Dialog>
  );
};