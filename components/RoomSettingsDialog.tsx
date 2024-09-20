import React from 'react';
import { Dialog, Accordion, YStack, Button, Text, XStack, styled } from 'tamagui';
import { Settings, Users, Shield, ChevronDown, ChevronUp, X } from '@tamagui/lucide-icons';

interface RoomSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const StyledAccordionItem = styled(Accordion.Item, {
    backgroundColor: '$backgroundStrong',
    marginBottom: '$2',
    borderRadius: '$4',
    overflow: 'hidden',
})

const StyledAccordionTrigger = styled(Accordion.Trigger, {
    padding: '$3',
    backgroundColor: '$backgroundStrong',
    borderBottomWidth: 1,
    borderBottomColor: '$borderColor',
})

const StyledAccordionContent = styled(Accordion.Content, {
    padding: '$3',
})

const IconWrapper = styled(XStack, {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: '$2',
})

const RoomSettingsDialog: React.FC<RoomSettingsDialogProps> = ({ open, onOpenChange }) => {
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
                        'quick',
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
                    backgroundColor="$background"
                >
                    <YStack padding="$4" gap="$4">
                        <XStack justifyContent="space-between" alignItems="center">
                            <Dialog.Title>
                                <Text fontSize="$6" fontWeight="bold" color="$color">Room Settings</Text>
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <Button size="$3" circular icon={X} />
                            </Dialog.Close>
                        </XStack>

                        <Accordion type="multiple" overflow="hidden" width="100%">
                            <StyledAccordionItem value="admins">
                                <StyledAccordionTrigger>
                                    {({ open }) => (
                                        <XStack alignItems="center">
                                            <IconWrapper backgroundColor="$blue8">
                                                <Shield color="$blue11" />
                                            </IconWrapper>
                                            <Text flex={1} fontSize="$5" fontWeight="600" color="$color">Admins</Text>
                                            {open ? <ChevronUp color="$color" /> : <ChevronDown color="$color" />}
                                        </XStack>
                                    )}
                                </StyledAccordionTrigger>
                                <StyledAccordionContent>
                                    <Text color="$color">Admin 1</Text>
                                    <Text color="$color">Admin 2</Text>
                                </StyledAccordionContent>
                            </StyledAccordionItem>

                            <StyledAccordionItem value="users">
                                <StyledAccordionTrigger>
                                    {({ open }) => (
                                        <XStack alignItems="center">
                                            <IconWrapper backgroundColor="$green8">
                                                <Users color="$green11" />
                                            </IconWrapper>
                                            <Text flex={1} fontSize="$5" fontWeight="600" color="$color">Users</Text>
                                            {open ? <ChevronUp color="$color" /> : <ChevronDown color="$color" />}
                                        </XStack>
                                    )}
                                </StyledAccordionTrigger>
                                <StyledAccordionContent>
                                    <Text color="$color">User 1</Text>
                                    <Text color="$color">User 2</Text>
                                    <Text color="$color">User 3</Text>
                                </StyledAccordionContent>
                            </StyledAccordionItem>

                            <StyledAccordionItem value="settings">
                                <StyledAccordionTrigger>
                                    {({ open }) => (
                                        <XStack alignItems="center">
                                            <IconWrapper backgroundColor="$orange8">
                                                <Settings color="$orange11" />
                                            </IconWrapper>
                                            <Text flex={1} fontSize="$5" fontWeight="600" color="$color">General Settings</Text>
                                            {open ? <ChevronUp color="$color" /> : <ChevronDown color="$color" />}
                                        </XStack>
                                    )}
                                </StyledAccordionTrigger>
                                <StyledAccordionContent>
                                    <Text color="$color">Setting 1: Value</Text>
                                    <Text color="$color">Setting 2: Value</Text>
                                    <Text color="$color">Setting 3: Value</Text>
                                </StyledAccordionContent>
                            </StyledAccordionItem>
                        </Accordion>
                    </YStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

export default RoomSettingsDialog;
