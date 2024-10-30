import React, { useState, useEffect } from "react";
import { View, styled, YStack, Anchor } from "tamagui";
import { auth } from "../../firebaseConfig";
import { Timestamp } from "@firebase/firestore";
import { NoteBoxOwnerDialog } from "components/NoteBoxItem/NoteBoxOwnerDialog"; // Adjust the import path as necessary
import { Alert } from "react-native";
import { NoteBoxNonOwnerDialog } from "components/NoteBoxItem/NoteBoxNonOwnerDialog";
import { NotepadText } from "@tamagui/lucide-icons";

interface NoteBoxItemProps {
    itemData: {
        id: string; // unique id of the placed item (do not change)
        itemId: string; // id of the item (do not change)
        name: string; // name of the item (do not change)
        imageUri: string; // picture uri of the item (do change)
        placedUserId: string; // user who placed the item (do not change)
        [key: string]: any; // any other properties (do not change)

        // add custom properties below ------
        notes: { sender: string; body: string; timestamp: Timestamp }[];

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

interface NoteBoxItemComponent extends React.FC<NoteBoxItemProps> {
    getInitialData: () => { notes: { sender: string; body: string; timestamp: Timestamp }[] };
}

const NoteBoxItemContainer = styled(View, {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
});

const NoteBoxItem: NoteBoxItemComponent = ({
    itemData,
    onDataUpdate,
    isActive,
    onClose,
    roomInfo,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const [notes, setNotes] = useState(itemData.notes || []);

    // Opens dialog when item is active/clicked
    useEffect(() => {
        if (isActive && !dialogOpen) {
            setDialogOpen(true);
        }
    }, [isActive]);

    const handleAddNote = (body: string) => {
        const sender = auth.currentUser.displayName;

        if (body.length === 0 || body.length > 1000) {
            Alert.alert("Error", "Note must be between 1 and 1000 characters.");
            return;
        }

        const newNote = { sender: sender, body: body, timestamp: Timestamp.now() };
        const updatedNotes = [...notes, newNote];

        setNotes(updatedNotes);
        onDataUpdate({ ...itemData, notes: updatedNotes });

        Alert.alert("Success", `Note added from ${sender}.`);
    }

    const handleDeleteNote = (sender: string, timestamp: Timestamp) => {
        const updatedNotes = notes.filter(note => !(note.sender === sender && note.timestamp.isEqual(timestamp)));

        setNotes(updatedNotes);
        onDataUpdate({ ...itemData, notes: updatedNotes });

        Alert.alert("Success", `Note from ${sender} deleted.`);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
    };






    // Renders item when not active/clicked
    // (default state of item on shelf)
    if (!isActive) {
        return (
            <YStack flex={1}>
                <NoteBoxItemContainer>
                    {itemData.placedUserId !== auth.currentUser.uid ? (
                        <NotepadText color="black" size={80} />
                    ) : (
                        <NotepadText color="white" size={80} />
                    )}
                </NoteBoxItemContainer>
            </YStack>
        );
    }

    const thingy = false;

    // Renders item when active/clicked
    // (item is clicked and dialog is open, feel free to change this return)
    return (
        <YStack flex={1}>
            <NoteBoxItemContainer>
                {itemData.placedUserId !== auth.currentUser.uid ? (
                    <>
                        <NotepadText color="black" size={80} />
                        <NoteBoxNonOwnerDialog
                            open={dialogOpen}
                            onOpenChange={(isOpen) => {
                                setDialogOpen(isOpen);
                                if (!isOpen) {
                                    handleDialogClose();
                                }
                            }}
                            addNote={handleAddNote} />
                    </>
                ) : (
                    <>
                        <NotepadText color="white" size={80} />
                        <NoteBoxOwnerDialog
                            open={dialogOpen}
                            onOpenChange={(isOpen) => {
                                setDialogOpen(isOpen);
                                if (!isOpen) {
                                    handleDialogClose();
                                }
                            }}
                            deleteNote={handleDeleteNote}
                            notes={notes}
                        />
                    </>
                )}
            </NoteBoxItemContainer>
        </YStack>
    );
};

// Initializes item data (default values)
NoteBoxItem.getInitialData = () => ({ notes: [] });

export default NoteBoxItem; // do not remove the export (but change the name of the Item to match the name of the file)
