import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet, Input, Anchor } from 'tamagui';
import { Crown } from "@tamagui/lucide-icons";
import { Alert } from 'react-native';

interface VotingBoxResultsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    topic: string;
    options: { body: string; votes: number }[];
    votes: { voter: string; vote: string }[];
}

export const VotingBoxResultsDialog: React.FC<VotingBoxResultsDialogProps> = ({
    open,
    onOpenChange,
    topic,
    options,
    votes
}) => {

    console.log(topic)

    const winner = options.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);

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
                    <Dialog.Title>Results</Dialog.Title>

                    <YStack marginTop="$3" marginBottom="$3" gap="$2">
                        <Text fontWeight="bold">{topic}</Text>
                        <Separator />

                        {options.map((option, index) => (
                            (option.body === winner.body) ? (
                                <XStack backgroundColor="rgba(255, 246, 201, 0.7)" padding="$1" key={index}>
                                    <Text>{option.body} </Text>
                                    <Crown color="rgba(0,0,0,0.3)" size="$1" />
                                    {(option.votes === 1) ? <Text marginLeft="auto">{option.votes} vote ({votes.length > 0 ? (option.votes / votes.length) * 100 : 0}%)</Text> : <Text marginLeft="auto">{option.votes} votes ({ votes.length > 0 ? (option.votes / votes.length) * 100 : 0}%)</Text>}
                                </XStack>
                            ) : (
                                <XStack padding="$1" key={index} justifyContent="space-between">
                                    <Text>{option.body}</Text>
                                    {(option.votes === 1) ? <Text>{option.votes} vote ({votes.length > 0 ? (option.votes / votes.length) * 100 : 0}%)</Text> : <Text>{option.votes} votes ({votes.length > 0 ? (option.votes / votes.length) * 100 : 0}%)</Text>}
                                </XStack>
                            )
                        ))}
                        <Separator />

                        <XStack padding="$1" justifyContent="space-between">
                            <Text fontWeight="bold">Total</Text>
                            {(votes.length === 1) ? <Text fontWeight="bold">{votes.length} vote</Text> : <Text fontWeight="bold">{votes.length} votes</Text>}
                        </XStack>
                        <Separator />

                        <YStack gap="$2">
                            {votes.map((vote, index) => (
                                <XStack padding="$2" backgroundColor="rgba(252, 232, 204, 0.8)" key={index} justifyContent="space-between">
                                    <Text>{vote.voter}</Text>
                                    <Text>{vote.vote}</Text>
                                </XStack>
                            ))}
                        </YStack>
                    </YStack>

                    <Dialog.Close displayWhenAdapted asChild>
                        <Button
                            onPress={() => {
                                onOpenChange(false);
                            }}
                            theme="alt1"
                            aria-label="Save">
                            Close
                        </Button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};