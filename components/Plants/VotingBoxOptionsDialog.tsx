import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet, Input, Anchor } from 'tamagui';
import { Trash, CirclePlus, CircleMinus } from "@tamagui/lucide-icons";
import { Alert } from 'react-native';

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
                        <XStack width="100%" alignItems="center" gap="$4">
                            <Label
                                paddingRight="$0"
                                minWidth={40}
                                justifyContent="flex-end"
                            >
                                Topic
                            </Label>
                            <Separator minHeight={20} vertical />
                            <Input
                                flex={1}
                                minWidth={190}
                                placeholder='What is your favorite color?'
                                value={topic}
                                onChangeText={setTopic}
                            />
                        </XStack>

                        <XStack width="100%" alignItems="center" gap="$4">
                            <Label
                                paddingRight="$0"
                                minWidth={40}
                                justifyContent="flex-end"
                            >
                                Option 1
                            </Label>
                            <Separator minHeight={20} vertical />
                            <Input
                                flex={1}
                                minWidth={190}
                                placeholder='Option 1'
                                value={option1}
                                onChangeText={setOption1}
                            />
                        </XStack>

                        <XStack width="100%" alignItems="center" gap="$4">
                            <Label
                                paddingRight="$0"
                                minWidth={40}
                                justifyContent="flex-end"
                            >
                                Option 2
                            </Label>
                            <Separator minHeight={20} vertical />
                            <Input
                                flex={1}
                                minWidth={190}
                                placeholder='Option 2'
                                value={option2}
                                onChangeText={setOption2}
                            />
                        </XStack>

                        {(numOptions >= 3) && (
                            <XStack width="100%" alignItems="center" gap="$4">
                                <Label
                                    paddingRight="$0"
                                    minWidth={40}
                                    justifyContent="flex-end"
                                >
                                    Option 3
                                </Label>
                                <Separator minHeight={20} vertical />
                                <Input
                                    flex={1}
                                    minWidth={190}
                                    placeholder='Option 3'
                                    value={option3}
                                    onChangeText={setOption3}
                                />
                            </XStack>
                        )}

                        {(numOptions >= 4) && (
                            <XStack width="100%" alignItems="center" gap="$4">
                                <Label
                                    paddingRight="$0"
                                    minWidth={40}
                                    justifyContent="flex-end"
                                >
                                    Option 4
                                </Label>
                                <Separator minHeight={20} vertical />
                                <Input
                                    flex={1}
                                    minWidth={190}
                                    placeholder='Option 4'
                                    value={option4}
                                    onChangeText={setOption4}
                                />
                            </XStack>
                        )}

                        <XStack width="100%" justifyContent="center" alignItems="center" gap="$4">
                            {(numOptions >= 3) && (
                                <Button
                                    icon={CircleMinus}
                                    size="$4"
                                    onPress={() => { setNumOptions(numOptions - 1); }}
                                />
                            )}
                            {(numOptions <= 3) && (
                                <Button
                                    icon={CirclePlus}
                                    size="$4"
                                    onPress={() => { setNumOptions(numOptions + 1); }}
                                />
                            )}
                        </XStack>
                    </YStack>

                    <Dialog.Close displayWhenAdapted asChild>
                        <Button
                            onPress={() => {
                                setOptions(topic, numOptions, [option1, option2, option3, option4]);
                                onOpenChange(false);
                            }}
                            theme="alt1"
                            aria-label="Save">
                            Save
                        </Button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};