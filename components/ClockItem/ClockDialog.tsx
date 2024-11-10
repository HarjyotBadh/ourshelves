import React from 'react';
import { View } from 'react-native';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet } from 'tamagui';
import { ChevronDown, ChevronUp, Check } from "@tamagui/lucide-icons";
import {
  DialogContent,
  DialogTitle,
  InputGroup,
  votingStyles, // reusing from VotingBoxStyles since they share similar patterns
} from 'styles/VotingBoxStyles';

interface ClockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClockOptionsSelect: (isAnalog: boolean, timeZone: number) => void;
  defaultIsAnalog: boolean;
  defaultTimeZone: number;
}

const timeZones = [
  "Samoa Standard Time (UTC-11:00)",
  "Hawaiian Time (UTC-10:00)",
  "Alaskan Time (UTC-09:00)",
  "US Pacific Time (UTC-08:00)",
  "US Mountain Time (UTC-07:00)",
  "US Central Time (UTC-06:00)",
  "US Eastern Time (UTC-05:00)",
  "Venezuelan Time (UTC-04:00)",
  "Brazilian Time (UTC-03:00)",
  "South Georgia Time (UTC-02:00)",
  "Azores Time (UTC-01:00)",
  "Greenwich Mean Time (UTC+00:00)",
  "Central European Time (UTC+01:00)",
  "Eastern European Time (UTC+02:00)",
  "East Africa Time (UTC+03:00)",
  "Gulf Standard Time (UTC+04:00)",
  "Pakistan Standard Time (UTC+05:00)",
  "Bangladesh Standard Time (UTC+06:00)",
  "Indochina Time (UTC+07:00)",
  "China Standard Time (UTC+08:00)",
  "Japan Standard Time (UTC+09:00)",
  "Australian Eastern Time (UTC+10:00)",
  "New Caledonia Time (UTC+11:00)",
  "New Zealand Standard Time (UTC+12:00)",
].map((name) => ({ name }));

export const ClockDialog: React.FC<ClockDialogProps> = ({
  open,
  onOpenChange,
  onClockOptionsSelect,
  defaultIsAnalog,
  defaultTimeZone,
}) => {
  const [selectedIsAnalog, setSelectedIsAnalog] = React.useState(defaultIsAnalog);
  const [selectedTimeZone, setSelectedTimeZone] = React.useState(defaultTimeZone);

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
          <DialogTitle>Clock Options</DialogTitle>

          <YStack padding="$4" gap="$4">
            <InputGroup>
              <Label width={80} color="black">Display</Label>
              <Separator minHeight={20} vertical />
              <XStack flex={1} alignItems="center" gap="$4">
                <Switch
                  checked={selectedIsAnalog}
                  onCheckedChange={setSelectedIsAnalog}
                  backgroundColor={selectedIsAnalog ? 'white' : '#8B4513'}
                >
                  <Switch.Thumb animation="quick" />
                </Switch>
                <Text color="black">{selectedIsAnalog ? 'Analog' : 'Digital'}</Text>
              </XStack>
            </InputGroup>

            <InputGroup>
              <Label width={80} color="black">Time Zone</Label>
              <Separator minHeight={20} vertical />
              <Select
                onValueChange={(value) => {
                  const selectedValue = timeZones.findIndex(
                    (item) => item.name.toLowerCase() === value
                  );
                  setSelectedTimeZone(selectedValue);
                }}
                value={timeZones[selectedTimeZone]?.name.toLowerCase()}
              >
                <Select.Trigger flex={1} iconAfter={ChevronDown}>
                  <Select.Value placeholder="Select time zone..." />
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

                <Select.Content>
                  <Select.ScrollUpButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                  >
                    <ChevronUp size={20} />
                  </Select.ScrollUpButton>

                  <Select.Viewport>
                    <Select.Group>
                      {timeZones.map((item, i) => (
                        <Select.Item
                          index={i}
                          key={item.name}
                          value={item.name.toLowerCase()}
                        >
                          <Select.ItemText>{item.name}</Select.ItemText>
                          <Select.ItemIndicator marginLeft="auto">
                            <Check size={16} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>

                  <Select.ScrollDownButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                  >
                    <ChevronDown size={20} />
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
                onPress={() => {
                  onClockOptionsSelect(selectedIsAnalog, selectedTimeZone);
                  onOpenChange(false);
                }}
              >
                Save
              </Button>
            </XStack>
          </YStack>

          <View style={votingStyles.bottomBar} />
        </DialogContent>
      </Dialog.Portal>
    </Dialog>
  );
};