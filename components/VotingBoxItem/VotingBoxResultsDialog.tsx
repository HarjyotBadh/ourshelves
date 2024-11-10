import React from 'react';
import { View } from 'react-native';
import { Dialog, Button, YStack, Text, ScrollView, XStack } from 'tamagui';
import { Crown } from "@tamagui/lucide-icons";
import {
  DialogContent,
  DialogTitle,
  ResultRow,
  WinnerRow,
  VoteItem,
  votingStyles,
} from 'styles/VotingBoxStyles';

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
  const winner = options.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
  const totalVotes = votes.length;

  const formatPercentage = (votes: number) => {
    if (totalVotes === 0) return '0%';
    return `${Math.round((votes / totalVotes) * 100)}%`;
  };

  const formatVoteCount = (count: number) => {
    return `${count} vote${count !== 1 ? 's' : ''}`;
  };

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
          <DialogTitle>Poll Results</DialogTitle>

          <YStack padding="$4" gap="$4">
            <Text style={votingStyles.topic}>{topic}</Text>

            <YStack gap="$2">
              {options.map((option, index) => (
                option.body === winner.body ? (
                  <WinnerRow key={index}>
                    <XStack flex={1} gap="$2" alignItems="center">
                      <Text fontWeight="500" fontSize="$4">{option.body}</Text>
                      <Crown color="#FFB74D" size={16} />
                    </XStack>
                    <XStack gap="$2">
                      <Text color="$gray8">{formatVoteCount(option.votes)}</Text>
                      <Text color="$gray8">({formatPercentage(option.votes)})</Text>
                    </XStack>
                  </WinnerRow>
                ) : (
                  <ResultRow key={index}>
                    <Text flex={1} fontSize="$4">{option.body}</Text>
                    <XStack gap="$2">
                      <Text color="$gray8">{formatVoteCount(option.votes)}</Text>
                      <Text color="$gray8">({formatPercentage(option.votes)})</Text>
                    </XStack>
                  </ResultRow>
                )
              ))}
            </YStack>

            <ResultRow backgroundColor="$yellow9">
              <Text fontWeight="bold" fontSize="$4">Total Votes</Text>
              <Text fontWeight="bold" color="$gray8">{formatVoteCount(totalVotes)}</Text>
            </ResultRow>

            <ScrollView maxHeight={200} showsVerticalScrollIndicator={true}>
              <YStack gap="$2">
                {votes.map((vote, index) => (
                  <VoteItem key={index}>
                    <Text flex={1}>{vote.voter}</Text>
                    <Text color="$gray8">{vote.vote}</Text>
                  </VoteItem>
                ))}
              </YStack>
            </ScrollView>

            <XStack justifyContent="center">
              <Button
                theme="red"
                width={120}
                onPress={() => onOpenChange(false)}
              >
                Close
              </Button>
            </XStack>
          </YStack>

          <View style={votingStyles.bottomBar} />
        </DialogContent>
      </Dialog.Portal>
    </Dialog>
  );
};