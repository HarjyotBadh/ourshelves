import React, { useState, useEffect } from "react";
import { View, styled, YStack, Anchor } from "tamagui";
import { auth } from "../../firebaseConfig";
import LinkGraphic from "components/LinkItem/LinkGraphic";
import { LinkDialog } from "components/LinkItem/LinkDialog";

interface LinkItemProps {
    itemData: {
        id: string; // unique id of the placed item (do not change)
        itemId: string; // id of the item (do not change)
        name: string; // name of the item (do not change)
        imageUri: string; // picture uri of the item (do change)
        placedUserId: string; // user who placed the item (do not change)
        [key: string]: any; // any other properties (do not change)

        // add custom properties below ------
        linkName: string;
        link: string;

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

interface LinkItemComponent extends React.FC<LinkItemProps> {
    getInitialData: () => { linkName: string, link: string };
}

const LinkItemContainer = styled(View, {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
});

const LinkItem: LinkItemComponent = ({
    itemData,
    onDataUpdate,
    isActive,
    onClose,
    roomInfo,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const [linkName, setLinkName] = useState(itemData.linkName || "");
    const [link, setLink] = useState(itemData.link || "");

    // Opens dialog when item is active/clicked
    useEffect(() => {
        if (isActive && !dialogOpen) {
            setDialogOpen(true);
        }
    }, [isActive]);

    useEffect(() => {
        setLinkName(itemData.linkName || "");
        setLink(itemData.link || "");
    }, [itemData]);

    const handleLinkSelect = (linkNameOption: string, linkOption: string) => {
        linkOption = linkOption.toLowerCase();
        const validTLD = /\.(com|org|net|edu|gov|mil|int|aero|asia|biz|cat|coop|info|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)$/i;
        if (linkOption !== "" && linkOption.startsWith("http") && validTLD.test(linkOption)) {
            setLinkName(linkNameOption);
            setLink(linkOption);
            onDataUpdate({ ...itemData, linkName: linkNameOption, link: linkOption }); // updates item data when called
        }
        else {
            alert("Invalid URL. Please enter a valid URL starting with 'http' and ending with a valid top-level domain.");
        }
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
                <LinkItemContainer>
                    {itemData.placedUserId !== auth.currentUser.uid && (
                        <Anchor href={link} height={100}>
                            <LinkGraphic linkName={linkName} />
                        </Anchor>
                    )}

                    {itemData.placedUserId === auth.currentUser.uid && (
                        <LinkGraphic linkName={linkName} />
                    )}
                </LinkItemContainer>
            </YStack>
        );
    }

    // Renders item when active/clicked
    // (item is clicked and dialog is open, feel free to change this return)
    return (
        <YStack flex={1}>
            <LinkItemContainer>
                {itemData.placedUserId !== auth.currentUser.uid && (
                    <Anchor href={link} height={100}>
                        <LinkGraphic linkName={linkName} />
                    </Anchor>
                )}

                {itemData.placedUserId === auth.currentUser.uid && (
                    <LinkGraphic linkName={linkName} />
                )}
                {itemData.placedUserId === auth.currentUser.uid && (
                    <LinkDialog
                        open={dialogOpen}
                        onOpenChange={(isOpen) => {
                            setDialogOpen(isOpen);
                            if (!isOpen) {
                                handleDialogClose();
                            }
                        }}
                        onLinkSelect={handleLinkSelect}
                        defaultLinkName={linkName}
                        defaultLink={link}
                    />
                )}
            </LinkItemContainer>
        </YStack>
    );
};

// Initializes item data (default values)
LinkItem.getInitialData = () => ({ linkName: "Google", link: "https://www.google.com/" });

export default LinkItem; // do not remove the export (but change the name of the Item to match the name of the file)
