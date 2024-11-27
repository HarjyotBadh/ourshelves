import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Separator, Text, Input, Anchor, View } from 'tamagui';
import {
  DialogContent,
  DialogTitle,
  InputGroup,
  StyledInput,
  linkStyles,
} from 'styles/LinkStyles';

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkSelect: (linkName: string, link: string) => void;
  defaultLinkName: string;
  defaultLink: string;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  open,
  onOpenChange,
  onLinkSelect,
  defaultLinkName,
  defaultLink
}) => {
  const [selectedLinkName, setSelectedLinkName] = React.useState(defaultLinkName);
  const [selectedLink, setSelectedLink] = React.useState(defaultLink);

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
          <DialogTitle>Link Options</DialogTitle>
          
          <YStack padding="$4" gap="$4">
            <Anchor href={defaultLink} target="_blank">
              <Text
                color="$blue10"
                textDecorationLine="underline"
                fontSize="$4"
              >
                {defaultLink}
              </Text>
            </Anchor>

            <InputGroup>
              <Label width={80} color={'black'}>Link</Label>
              <Separator minHeight={20} vertical />
              <Input
                flex={1}
                placeholder='Enter URL'
                value={selectedLink}
                onChangeText={setSelectedLink}
                backgroundColor="white"
                color="black"
              />
            </InputGroup>

            <InputGroup>
              <Label width={80} color={'black'}>Link Name</Label>
              <Separator minHeight={20} vertical />
              <Input
                flex={1}
                placeholder='Enter name'
                value={selectedLinkName}
                onChangeText={setSelectedLinkName}
                backgroundColor="white"
                color="black"
              />
            </InputGroup>

            <XStack paddingTop="$2" justifyContent="center" gap="$4">
              <Button
                theme="red"
                onPress={() => onOpenChange(false)}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                backgroundColor="$green10"
                onPress={() => {
                  onLinkSelect(selectedLinkName, selectedLink);
                  onOpenChange(false);
                }}
                aria-label="Save"
              >
                Save
              </Button>
            </XStack>
          </YStack>

          <View style={linkStyles.bottomBar} />
        </DialogContent>
      </Dialog.Portal>
    </Dialog>
  );
};