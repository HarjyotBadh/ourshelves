import React from "react";
import { Dialog, YStack, ScrollView, Text, styled, XStack, Button } from "tamagui";
import { ItemData } from "./item";
import Item from "./item";

interface StyleSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStyleSelect: (style: ItemData) => void;
  availableStyles: ItemData[];
  currentItemId: string;
}

const GridContainer = styled(XStack, {
  flexWrap: "wrap",
  justifyContent: "space-around",
  gap: "$2",
  paddingHorizontal: "$2",
});

const ItemWrapper = styled(YStack, {
  alignItems: "center",
  marginBottom: 10,
});

const ShelfRow = styled(XStack, {
  backgroundColor: "#8b4513",
  height: 8,
  width: "80%",
  marginTop: "$2",
  borderRadius: 4,
});

export const StyleSwitchDialog: React.FC<StyleSwitchDialogProps> = ({
  open,
  onOpenChange,
  onStyleSelect,
  availableStyles,
  currentItemId,
}) => {
  const filteredStyles = availableStyles.filter((style) => style.itemId === currentItemId);

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
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          width="80%"
          maxWidth={400}
          backgroundColor="#f5deb3"
        >
          <Dialog.Title>
            <Text fontSize={18} fontWeight="bold" color="#8b4513">
              Switch Style
            </Text>
          </Dialog.Title>
          <Dialog.Description>
            <Text color="#8b4513aa">Select a new style for this item</Text>
          </Dialog.Description>
          <YStack padding="$4">
            <ScrollView maxHeight={400}>
              {filteredStyles.length > 0 ? (
                <GridContainer>
                  {filteredStyles.map((style) => (
                    <YStack key={style.styleId} width="30%" alignItems="center" marginBottom="$3">
                      <ItemWrapper>
                        <Item
                          item={style}
                          onPress={() => {
                            onStyleSelect(style);
                            onOpenChange(false);
                          }}
                          showName={false}
                          showCost={false}
                        />
                      </ItemWrapper>
                      <Text fontSize={14} color="#666" textAlign="center" marginTop="$1">
                        {style.styleName || "Default Style"}
                      </Text>
                      <ShelfRow />
                    </YStack>
                  ))}
                </GridContainer>
              ) : (
                <Text textAlign="center" color="#8b4513">
                  No other styles available
                </Text>
              )}
            </ScrollView>
          </YStack>
          <Dialog.Close asChild>
            <Button backgroundColor="#8b4513" color="white" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
