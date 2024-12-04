import React, { useState, useEffect } from "react";
import { Alert, View } from "react-native";
import { YStack } from "tamagui";
import { auth } from "../../firebaseConfig";
import { Vote } from "@tamagui/lucide-icons";
import { VotingBoxOptionsDialog } from "components/VotingBoxItem/VotingBoxOptionsDialog";
import { VotingBoxVoteDialog } from "components/VotingBoxItem/VotingBoxVoteDialog";
import { VotingBoxResultsDialog } from "components/VotingBoxItem/VotingBoxResultsDialog";
import { Text } from "tamagui";
import { VotingBoxContainer, votingStyles } from "styles/VotingBoxStyles";

interface VotingBoxItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    topic: string;
    options: { body: string; votes: number }[];
    votes: { voter: string; vote: string }[];
    [key: string]: any;
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  };
}

interface VotingBoxItemComponent extends React.FC<VotingBoxItemProps> {
  getInitialData: () => { topic: string; options: { body: string; votes: number }[]; votes: { voter: string; vote: string }[] };
}

const VotingBoxItem: VotingBoxItemComponent = ({
  itemData,
  onDataUpdate,
  isActive,
  onClose,
  roomInfo,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topic, setTopic] = useState(itemData.topic || "");
  const [options, setOptions] = useState(itemData.options || []);
  const [votes, setVotes] = useState(itemData.votes || []);
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    setTopic(itemData.topic || "");
    setOptions(itemData.options || []);
    setVotes(itemData.votes || []);
  }, [itemData]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const handleVote = (submittedVote: string) => {
    if (votes.some(vote => vote.voter === auth.currentUser?.displayName)) {
      Alert.alert("You have already voted.");
      return;
    }

    const updatedVotes = [...votes, { voter: auth.currentUser?.displayName || "Unknown", vote: submittedVote }];
    setVotes(updatedVotes);

    const updatedOptions = options.map(option =>
      option.body === submittedVote ? { ...option, votes: option.votes + 1 } : option
    );
    setOptions(updatedOptions);

    onDataUpdate({ ...itemData, options: updatedOptions, votes: updatedVotes });
  };

  const handleSetOptions = (newTopic: string, numOptions: number, options: string[]) => {
    const newOptions = options.slice(0, numOptions).map((option) => ({ body: option, votes: 0 }));
    setOptions(newOptions);
    setTopic(newTopic);
    onDataUpdate({ ...itemData, topic: newTopic, options: newOptions });
  };

  const renderVotingContent = () => (
    <VotingBoxContainer>
      <View style={votingStyles.iconContainer}>
        <Vote color={isOwner ? "#FFD700" : "#64b5f6"} size={70} />
      </View>
      <View style={votingStyles.ownerNameContainer}>
        <Text style={votingStyles.ownerNameText}>
          {isOwner ? "My Vote Box" : `${roomInfo.users.find(user => user.id === itemData.placedUserId)?.displayName || 'Unknown'}'s Vote Box`}
        </Text>
        {!isOwner && options && options.length > 0 && !votes.some(vote => vote.voter === auth.currentUser?.displayName) && (
          <Text style={votingStyles.voteSubtext}>
            Tap to vote on "{topic}"
          </Text>
        )}
        {!isOwner && options && options.length > 0 && votes.some(vote => vote.voter === auth.currentUser?.displayName) && (
          <Text style={votingStyles.voteSubtext}>
            View results
          </Text>
        )}
      </View>
    </VotingBoxContainer>
  );

  const renderDialog = () => {
    if (isOwner) {
      return options.length === 0 ? (
        <VotingBoxOptionsDialog
          open={dialogOpen}
          onOpenChange={(isOpen) => {
            setDialogOpen(isOpen);
            if (!isOpen) handleDialogClose();
          }}
          setOptions={handleSetOptions}
        />
      ) : (
        <VotingBoxResultsDialog
          open={dialogOpen}
          onOpenChange={(isOpen) => {
            setDialogOpen(isOpen);
            if (!isOpen) handleDialogClose();
          }}
          topic={topic}
          options={options}
          votes={votes}
        />
      );
    } else if (options.length > 0) {
      return votes.some(vote => vote.voter === auth.currentUser?.displayName) ? (
        <VotingBoxResultsDialog
          open={dialogOpen}
          onOpenChange={(isOpen) => {
            setDialogOpen(isOpen);
            if (!isOpen) handleDialogClose();
          }}
          topic={topic}
          options={options}
          votes={votes}
        />
      ) : (
        <VotingBoxVoteDialog
          open={dialogOpen}
          onOpenChange={(isOpen) => {
            setDialogOpen(isOpen);
            if (!isOpen) handleDialogClose();
          }}
          topic={topic}
          voteOptions={options.map((option) => option.body)}
          submitVote={handleVote}
        />
      );
    }
    return null;
  };

  if (!isActive) {
    return <YStack flex={1}>{renderVotingContent()}</YStack>;
  }

  return (
    <YStack flex={1}>
      {renderVotingContent()}
      {renderDialog()}
    </YStack>
  );
};

VotingBoxItem.getInitialData = () => ({ topic: "", options: [], votes: [] });

export default VotingBoxItem;