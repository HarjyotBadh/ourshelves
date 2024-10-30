import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet, Input, Anchor } from 'tamagui';
import { Trash, CirclePlus, CircleMinus, ChevronDown, ChevronUp, Check } from "@tamagui/lucide-icons";
import { Alert } from 'react-native';
import { LinearGradient } from 'tamagui/linear-gradient'


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
                <Dialog.Overlay key="overlay" />
                <Dialog.Content
                    bordered
                    elevate
                    width={380}
                    key="content"
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                >
                    <Dialog.Title>Select Voting Options</Dialog.Title>

                    <YStack marginTop="$3" marginBottom="$3" gap="$2">
                        <XStack>
                            <Text fontWeight="bold">{topic}</Text>
                        </XStack>
                        <XStack width="100%" alignItems="center" gap="$4">
                            <Label
                                paddingRight="$0"
                                minWidth={40}
                                justifyContent="flex-end"
                            >
                                Vote
                            </Label>
                            <Separator minHeight={20} vertical />
                            <Select onValueChange={(value) => {
                                setVote(value);
                            }}>
                                <Select.Trigger width={150} iconAfter={ChevronDown}>
                                    <Select.Value />
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
                                            <Select.Label>Time Zones</Select.Label>
                                            {/* for longer lists memoizing these is useful */}
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
                        </XStack>
                    </YStack>

                    <Button
                        onPress={() => {
                            submitVote(vote);
                        }}
                        theme="alt1"
                        aria-label="Save">
                        Save
                    </Button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};