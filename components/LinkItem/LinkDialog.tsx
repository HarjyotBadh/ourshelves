import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet, Input, Anchor } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient'

interface LinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLinkSelect: (linkName: string, link: string) => void;
    defaultLinkName: string;
    defaultLink: string;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
    open,
    onOpenChange,
    onLinkSelect,
    defaultLinkName,
    defaultLink
}) => {

    const [selectedLinkName, setSelectedLinkName] = React.useState(defaultLinkName);
    const [selectedLink, setSelectedLink] = React.useState(defaultLink);

    return (
        <Dialog modal open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay key="overlay" />
                <Dialog.Content
                    bordered
                    elevate
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
                    <Dialog.Title>Link Options</Dialog.Title>

                    <YStack padding="$4" gap="$4">
                        <Anchor href={defaultLink} target="_blank">
                            <Text
                                color="blue"
                                textDecorationLine="underline"
                            >
                                {defaultLink}
                            </Text>
                        </Anchor>
                    </YStack>

                    <YStack padding="$4" gap="$4">
                        <XStack width={250} alignItems="center" gap="$4">
                            <Label
                                paddingRight="$0"
                                minWidth={40}
                                justifyContent="flex-end"
                            >
                                Link
                            </Label>
                            <Separator minHeight={20} vertical />
                            <Input
                                flex={1}
                                minWidth={190}
                                placeholder='Link'
                                value={selectedLink}
                                onChangeText={setSelectedLink}
                            />
                        </XStack>

                        <XStack width={250} alignItems="center" gap="$4">
                            <Label
                                paddingRight="$0"
                                minWidth={40}
                                justifyContent="flex-end"
                            >
                                Link Name
                            </Label>
                            <Separator minHeight={20} vertical />
                            <Input
                                flex={1}
                                minWidth={159}
                                placeholder='Link Name'
                                value={selectedLinkName}
                                onChangeText={setSelectedLinkName}
                            />
                        </XStack>

                    </YStack>

                    <Dialog.Close displayWhenAdapted asChild>
                        <Button
                            onPress={() => {
                                onLinkSelect(selectedLinkName, selectedLink);
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