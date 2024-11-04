import { Check, ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import React from "react";
import {
  Dialog,
  Button,
  XStack,
  YStack,
  Label,
  Switch,
  Select,
  Separator,
  Text,
  Adapt,
  Sheet,
} from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

interface ClockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClockOptionsSelect: (isAnalog: boolean, timeZone: number) => void;
  defaultIsAnalog: boolean;
  defaultTimeZone: number;
}

const items = [
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
        <Dialog.Overlay key="overlay" />
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
        >
          <Dialog.Title>Clock Options</Dialog.Title>

          <YStack padding="$4" gap="$4">
            <XStack width={200} alignItems="center" gap="$4">
              <Label paddingRight="$0" minWidth={90} justifyContent="flex-end">
                Analog clock?
              </Label>
              <Separator minHeight={20} vertical />
              <Switch
                checked={selectedIsAnalog}
                onCheckedChange={(checked) => {
                  setSelectedIsAnalog(checked);
                }}
              >
                <Switch.Thumb animation="quicker" />
              </Switch>
            </XStack>
            <XStack width={280} alignItems="center" gap="$4">
              <Label paddingRight="$0" minWidth={90} justifyContent="flex-end">
                Time zone
              </Label>
              <Separator minHeight={20} vertical />

              <Select
                onValueChange={(value) => {
                  const selectedValue = items.findIndex(
                    (item) => item.name.toLowerCase() === value
                  );
                  setSelectedTimeZone(selectedValue);
                }}
              >
                <Select.Trigger width={150} iconAfter={ChevronDown}>
                  <Select.Value />
                </Select.Trigger>

                <Adapt when="sm" platform="touch">
                  <Sheet
                    modal
                    dismissOnSnapToBottom
                    animationConfig={{
                      type: "spring",
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
                      colors={["$background", "transparent"]}
                      borderRadius="$4"
                    />
                  </Select.ScrollUpButton>

                  <Select.Viewport
                  // to do animations:
                  // animation="quick"
                  // animateOnly={['transform', 'opacity']}
                  // enterStyle={{ o: 0, y: -10 }}
                  // exitStyle={{ o: 0, y: 10 }}
                  // minWidth={100}
                  >
                    <Select.Group>
                      <Select.Label>Time Zones</Select.Label>
                      {/* for longer lists memoizing these is useful */}
                      {React.useMemo(
                        () =>
                          items.map((item, i) => {
                            return (
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
                            );
                          }),
                        [items]
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
                      colors={["transparent", "$background"]}
                      borderRadius="$4"
                    />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select>
            </XStack>
          </YStack>

          <Dialog.Close displayWhenAdapted asChild>
            <Button
              onPress={() => {
                onClockOptionsSelect(selectedIsAnalog, selectedTimeZone);
                onOpenChange(false);
              }}
              theme="alt1"
              aria-label="Save"
            >
              Save
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
