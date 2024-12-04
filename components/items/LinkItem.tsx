import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { YStack, Anchor } from "tamagui";
import { auth } from "../../firebaseConfig";
import LinkGraphic from "components/LinkItem/LinkGraphic";
import { LinkDialog } from "components/LinkItem/LinkDialog";
import { LinkContainer, linkStyles } from "styles/LinkStyles";

interface LinkItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    linkName: string;
    link: string;
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

interface LinkItemComponent extends React.FC<LinkItemProps> {
  getInitialData: () => { linkName: string; link: string };
}

const LinkItem: LinkItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkName, setLinkName] = useState(itemData.linkName || "");
  const [link, setLink] = useState(itemData.link || "");
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;

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
    const validTLD =
      /\.(com|org|net|edu|gov|mil|int|aero|asia|biz|cat|coop|info|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)$/i;
    if (
      (linkOption !== "" && linkOption.startsWith("http")) ||
      (linkOption.toLowerCase().startsWith("https") && validTLD.test(linkOption))
    ) {
      setLinkName(linkNameOption);
      setLink(linkOption);
      onDataUpdate({ ...itemData, linkName: linkNameOption, link: linkOption });
    } else {
      alert(
        "Invalid URL. Please enter a valid URL starting with 'http' and ending with a valid top-level domain."
      );
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    onClose();
  };

  const renderLinkContent = () => (
    <LinkContainer>
      <View style={linkStyles.iconContainer}>
        {!isOwner ? (
          <Anchor href={link} height={70}>
            <LinkGraphic linkName={linkName} />
          </Anchor>
        ) : (
          <LinkGraphic linkName={linkName} />
        )}
      </View>
      <View style={linkStyles.ownerNameContainer}>
        {!isOwner && (
          <Text style={linkStyles.linkSubtext}>
            {"Click to visit link"}
          </Text>
        )}
      </View>
    </LinkContainer>
  );

  if (!isActive) {
    return <YStack flex={1}>{renderLinkContent()}</YStack>;
  }

  return (
    <YStack flex={1}>
      {renderLinkContent()}
      {isOwner && (
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
    </YStack>
  );
};

LinkItem.getInitialData = () => ({ linkName: "Google", link: "https://www.google.com/" });

export default LinkItem;