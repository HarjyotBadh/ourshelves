import React from 'react';
import { View } from 'react-native';
import { Dialog, Button, XStack, YStack, Label, Separator, Select, Text, Adapt, Sheet } from 'tamagui';
import { ChevronDown, ChevronUp, Check } from "@tamagui/lucide-icons";
import { LinearGradient } from 'tamagui/linear-gradient';
import {
  DialogContent,
  DialogTitle,
  InputGroup,
  votingStyles,
} from 'styles/VotingBoxStyles';

interface VotingBoxVoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  voteOptions: string[];
  submitVote: (option: string) => void;
}

export const VotingBoxVoteDialog: React.FC<VotingBoxVoteDialogProps> = ({
  open,
  onOpenChange,
  topic,
  voteOptions,
  submitVote
}) => {
  const [vote, setVote] = React.useState('');

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
          <DialogTitle>Cast Your Vote</DialogTitle>

          <YStack padding="$4" gap="$4">
            <Text style={votingStyles.topic}>{topic}</Text>
            
            <InputGroup>
              <Label width={40} color="black">Vote</Label>
              <Separator minHeight={20} vertical />
              <Select 
                onValueChange={setVote}
                value={vote}
              >
                <Select.Trigger width={200} iconAfter={ChevronDown}>
                  <Select.Value placeholder="Select option..." />
                </Select.Trigger>

                <Adapt when="sm" platform="touch">
                  <Sheet
                    modal
                    dismissOnSnapToBottom
                    animationConfig={{
                      type: 'spring',
                      damping: 20,
                      mass: 1.2,
                      stiffness: 250,
                    }}
                  >
                    <Sheet.Frame>
                      <Sheet.ScrollView>
                        <Adapt.Contents />
                      </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay
                      animation="lazy"
                      enterStyle={{ opacity: 0 }}
                      exitStyle={{ opacity: 0 }}
                    />
                  </Sheet>
                </Adapt>

                <Select.Content zIndex={200000}>
                  <Select.ScrollUpButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                  >
                    <YStack zIndex={10}>
                      <ChevronUp size={20} />
                    </YStack>
                    <LinearGradient
                      start={[0, 0]}
                      end={[0, 1]}
                      fullscreen
                      colors={['$background', 'transparent']}
                      borderRadius="$4"
                    />
                  </Select.ScrollUpButton>

                  <Select.Viewport>
                    <Select.Group>
                      {React.useMemo(
                        () =>
                          voteOptions.map((item, i) => {
                            return (
                              <Select.Item
                                index={i}
                                key={item}
                                value={item}
                              >
                                <Select.ItemText>{item}</Select.ItemText>
                                <Select.ItemIndicator marginLeft="auto">
                                  <Check size={16} />
                                </Select.ItemIndicator>
                              </Select.Item>
                            )
                          }),
                        [voteOptions]
                      )}
                    </Select.Group>
                  </Select.Viewport>

                  <Select.ScrollDownButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                  >
                    <YStack zIndex={10}>
                      <ChevronDown size={20} />
                    </YStack>
                    <LinearGradient
                      start={[0, 0]}
                      end={[0, 1]}
                      fullscreen
                      colors={['transparent', '$background']}
                      borderRadius="$4"
                    />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select>
            </InputGroup>

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
                disabled={!vote}
                onPress={() => {
                  submitVote(vote);
                  onOpenChange(false);
                }}
              >
                Vote
              </Button>
            </XStack>
          </YStack>

          <View style={votingStyles.bottomBar} />
        </DialogContent>
      </Dialog.Portal>
    </Dialog>
  );
};