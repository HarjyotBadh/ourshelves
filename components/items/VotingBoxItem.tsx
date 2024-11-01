import React, { useState, useEffect } from "react";
import { View, styled, YStack, Anchor, Text } from "tamagui";
import { auth } from "../../firebaseConfig";
import { Timestamp } from "@firebase/firestore";
import { Alert } from "react-native";
import { NotepadText } from "@tamagui/lucide-icons";
import { VotingBoxOptionsDialog } from "components/VotingBoxItem/VotingBoxOptionsDialog";
import { VotingBoxVoteDialog } from "components/VotingBoxItem/VotingBoxVoteDialog";
import { VotingBoxResultsDialog } from "components/VotingBoxItem/VotingBoxResultsDialog";
import { Vote } from "@tamagui/lucide-icons";

interface VotingBoxItemProps {
    itemData: {
        id: string; // unique id of the placed item (do not change)
        itemId: string; // id of the item (do not change)
        name: string; // name of the item (do not change)
        imageUri: string; // picture uri of the item (do change)
        placedUserId: string; // user who placed the item (do not change)
        [key: string]: any; // any other properties (do not change)

        // add custom properties below ------
        topic: string;
        options: { body: string; votes: number }[];
        votes: { voter: string; vote: string }[];

        // ---------------------------------
    };
    onDataUpdate: (newItemData: Record<string, any>) => void; // updates item data when called (do not change)
    isActive: boolean; // whether item is active/clicked (do not change)
    onClose: () => void; // called when dialog is closed (important, as it will unlock the item) (do not change)
    roomInfo: {
        name: string;
        users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
        description: string;
    }; // various room info (do not change)
}

interface VotingBoxItemComponent extends React.FC<VotingBoxItemProps> {
    getInitialData: () => { topic: string; options: { body: string; votes: number }[]; votes: { voter: string; vote: string }[] };
}

const VotingBoxItemContainer = styled(View, {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
});

const VotingBoxItem: VotingBoxItemComponent = ({
    itemData,
    onDataUpdate,
    isActive,
    onClose,
    roomInfo,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const [topic, setTopic] = useState(itemData.notes || "");
    const [options, setOptions] = useState(itemData.options || []);
    const [votes, setVotes] = useState(itemData.votes || []);

    // Opens dialog when item is active/clicked
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
        onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
    };








    const handleVote = (submittedVote: string) => {

        if (votes.some(votes => votes.voter === auth.currentUser.displayName)) {
            Alert.alert("You have already voted.");
            return;
        }

        const updatedVotes = [...votes, { voter: auth.currentUser.displayName, vote: submittedVote }];
        setVotes(updatedVotes);

        const updatedOptions = options.map(option =>
            option.body === submittedVote ? { ...option, votes: option.votes + 1 } : option
        );
        setOptions(updatedOptions);

        onDataUpdate({ ...itemData, options: updatedOptions, votes: updatedVotes });
    }

    const handleSetOptions = (newTopic: string, numOptions: number, options: string[]) => {

        const newOptions = options.slice(0, numOptions).map((option) => ({ body: option, votes: 0 }));
        setOptions(newOptions);
        setTopic(newTopic);
        onDataUpdate({ ...itemData, topic: newTopic, options: newOptions });
    }






    // Renders item when not active/clicked
    // (default state of item on shelf)
    if (!isActive) {
        return (
            <YStack flex={1}>
                <VotingBoxItemContainer>
                    {(itemData.placedUserId === auth.currentUser.uid) ? (
                        <Vote color="white" size={80} />
                    ) : (
                        <Vote color="black" size={80} />
                    )}
                </VotingBoxItemContainer>
            </YStack>
        );
    }

    // Renders item when active/clicked
    // (item is clicked and dialog is open, feel free to change this return)
    return (
        <YStack flex={1}>
            <VotingBoxItemContainer>
                {(itemData.placedUserId === auth.currentUser.uid) ? (
                    <>
                        <Vote color="white" size={80} />
                        {(options !== undefined && options.length === 0) ? (
                            <VotingBoxOptionsDialog
                                open={dialogOpen}
                                onOpenChange={(isOpen) => {
                                    setDialogOpen(isOpen);
                                    if (!isOpen) {
                                        handleDialogClose();
                                    }
                                }}
                                setOptions={handleSetOptions}
                            />
                        ) : (
                            <VotingBoxResultsDialog
                                open={dialogOpen}
                                onOpenChange={(isOpen) => {
                                    setDialogOpen(isOpen);
                                    if (!isOpen) {
                                        handleDialogClose();
                                    }
                                }}
                                topic={topic}
                                options={options}
                                votes={votes}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Vote color="black" size={80} />
                        {(options !== undefined && options.length === 0) ? (
                            <Text></Text>
                        ) : (
                            (votes.some(votes => votes.voter === auth.currentUser.displayName)) ? (
                                <VotingBoxResultsDialog
                                    open={dialogOpen}
                                    onOpenChange={(isOpen) => {
                                        setDialogOpen(isOpen);
                                        if (!isOpen) {
                                            handleDialogClose();
                                        }
                                    }}
                                    topic={topic}
                                    options={options}
                                    votes={votes}
                                />
                            ) : (
                                <VotingBoxVoteDialog
                                    open={dialogOpen}
                                    onOpenChange={
                                        (isOpen) => {
                                            setDialogOpen(isOpen);
                                            if (!isOpen) {
                                                handleDialogClose();
                                            }
                                        }}
                                    topic={topic}
                                    voteOptions={options.map((option) => option.body)}
                                    submitVote={handleVote}
                                />
                            )
                            // <VotingBoxVoteDialog
                            //     open={dialogOpen}
                            //     onOpenChange={
                            //         (isOpen) => {
                            //             setDialogOpen(isOpen);
                            //             if (!isOpen) {
                            //                 handleDialogClose();
                            //             }
                            //         }}
                            //     voteOptions={options.map((option) => option.body)}
                            //     submitVote={handleVote}
                            // />
                        )}
                    </>
                )}
            </VotingBoxItemContainer>
        </YStack>
    );
};

// Initializes item data (default values)
VotingBoxItem.getInitialData = () => ({ topic: "", options: [], votes: [] });

export default VotingBoxItem; // do not remove the export (but change the name of the Item to match the name of the file)
