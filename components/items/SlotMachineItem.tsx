import React, { useState, useEffect } from "react";
import { View, styled, YStack, Anchor } from "tamagui";
import { auth } from "../../firebaseConfig";
import { Timestamp } from "@firebase/firestore";
import { Alert } from "react-native";
import { Dices } from "@tamagui/lucide-icons";
import { SlotMachineDialog } from "components/SlotMachineItem/SlotMachineDialog"; // Adjust the import path as necessary

interface SlotMachineItemProps {
    itemData: {
        id: string; // unique id of the placed item (do not change)
        itemId: string; // id of the item (do not change)
        name: string; // name of the item (do not change)
        imageUri: string; // picture uri of the item (do change)
        placedUserId: string; // user who placed the item (do not change)
        [key: string]: any; // any other properties (do not change)

        // add custom properties below ------

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

interface SlotMachineItemComponent extends React.FC<SlotMachineItemProps> {
    getInitialData: () => {};
}

const SlotMachineItemContainer = styled(View, {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
});

const SlotMachineItem: SlotMachineItemComponent = ({
    itemData,
    onDataUpdate,
    isActive,
    onClose,
    roomInfo,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    // Opens dialog when item is active/clicked
    useEffect(() => {
        if (isActive && !dialogOpen) {
            setDialogOpen(true);
        }
    }, [isActive]);


    const handleDialogClose = () => {
        setDialogOpen(false);
        onClose(); // ensure you call onClose when dialog is closed (important, as it will unlock the item)
    };






    // Renders item when not active/clicked
    // (default state of item on shelf)
    if (!isActive) {
        return (
            <YStack flex={1}>
                <SlotMachineItemContainer>
                    <Dices color="white" size={80} />
                </SlotMachineItemContainer>
            </YStack>
        );
    }

    const thingy = false;

    // Renders item when active/clicked
    // (item is clicked and dialog is open, feel free to change this return)
    return (
        <YStack flex={1}>
            <SlotMachineItemContainer>
                <Dices color="white" size={80} />
                <SlotMachineDialog
                    open={dialogOpen}
                    onOpenChange={(isOpen) => {
                        setDialogOpen(isOpen);
                        if (!isOpen) {
                            handleDialogClose();
                        }
                    }}
                />
            </SlotMachineItemContainer>
        </YStack>
    );
};

// Initializes item data (default values)
SlotMachineItem.getInitialData = () => ({});

export default SlotMachineItem; // do not remove the export (but change the name of the Item to match the name of the file)
