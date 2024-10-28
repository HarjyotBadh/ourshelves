import React, { useState, useEffect } from "react";
import { View, styled, YStack, Text, Dialog, Button } from "tamagui";
import { Timestamp } from "firebase/firestore";
import { RefreshCw } from "@tamagui/lucide-icons";

interface DailyQuoteItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;

    currentQuote?: {
      quote: string;
      author: string;
      category: string;
      lastUpdated: Timestamp;
    };
  };
  onDataUpdate: (newItemData: Record<string, any>) => void;
  isActive: boolean;
  onClose: () => void;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

const QuoteContainer = styled(View, {
  padding: "$2",
  backgroundColor: "$blue2",
  borderRadius: "$2",
  borderWidth: 1,
  borderColor: "$blue6",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const QuoteText = styled(Text, {
  fontSize: "$2",
  color: "$blue11",
  textAlign: "center",
  fontStyle: "italic",
  lineHeight: "$1",
});

const AuthorText = styled(Text, {
  fontSize: "$1",
  color: "$blue9",
  textAlign: "center",
  marginTop: "$1",
});

const StyledDialog = styled(Dialog.Content, {
  backgroundColor: "$blue2",
  borderRadius: "$6",
  paddingVertical: "$3",
  paddingHorizontal: "$3",
  shadowColor: "$shadowColor",
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  width: "90%",
  maxWidth: 420,
  minWidth: 380,
  borderWidth: 2,
  borderColor: "$blue6",
});

const StyledButton = styled(Button, {
  backgroundColor: "$blue9",
  borderRadius: "$4",
  paddingHorizontal: "$4",
  borderWidth: 2,
  borderColor: "$blue10",
  marginBottom: "$4",
});

interface DailyQuoteItemComponent extends React.FC<DailyQuoteItemProps> {
  getInitialData: () => {
    currentQuote: {
      quote: string;
      author: string;
      category: string;
      lastUpdated: Timestamp;
    };
  };
}

const DailyQuoteItem: DailyQuoteItemComponent = ({ itemData, onDataUpdate, isActive, onClose }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes?category=inspirational', {
        headers: {
          'X-Api-Key': 'Wm3OyBRMHTqd1kVQIqpQlA==Nya1opSU7fWyJcqZ'
        }
      });
      
      const [quoteData] = await response.json();
      
      onDataUpdate({
        ...itemData,
        currentQuote: {
          quote: quoteData.quote,
          author: quoteData.author,
          category: quoteData.category,
          lastUpdated: Timestamp.now()
        }
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateQuote = (quote: string, maxLength: number) => {
    return quote.length > maxLength ? `${quote.substring(0, maxLength)}...` : quote;
  };

  if (!isActive) {
    return (
      <YStack flex={1}>
        <QuoteContainer>
          <QuoteText>
            "{truncateQuote(itemData.currentQuote?.quote || 'Loading daily quote...', 50)}"
          </QuoteText>
          {itemData.currentQuote?.author && (
            <AuthorText>- {itemData.currentQuote.author}</AuthorText>
          )}
        </QuoteContainer>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      <Dialog
        modal
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <StyledDialog>
            <YStack gap="$4" padding="$4">
              <Dialog.Title>
                <Text fontSize="$6" fontWeight="bold" color="$blue11" textAlign="center">
                  Daily Quote
                </Text>
              </Dialog.Title>
              
              <YStack gap="$2" backgroundColor="$blue3" padding="$4" borderRadius="$4">
                <Text fontSize="$4" color="$blue11" fontStyle="italic" textAlign="center">
                  "{itemData.currentQuote?.quote}"
                </Text>
                <Text fontSize="$3" color="$blue9" textAlign="right">
                  - {itemData.currentQuote?.author}
                </Text>
                <Text fontSize="$2" color="$blue8" textAlign="right">
                  Category: {itemData.currentQuote?.category}
                </Text>
              </YStack>

              <StyledButton 
                onPress={fetchNewQuote} 
                disabled={isLoading}
                icon={RefreshCw}
              >
                <Text color="white">
                  {isLoading ? "Generating..." : "Generate New Quote"}
                </Text>
              </StyledButton>

              <Dialog.Close asChild>
                <Button backgroundColor="$red9" borderColor="$red10">
                  <Text color="white">Close</Text>
                </Button>
              </Dialog.Close>
            </YStack>
          </StyledDialog>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
};

DailyQuoteItem.getInitialData = () => ({
  currentQuote: {
    quote: "Loading your first daily quote...",
    author: "",
    category: "",
    lastUpdated: Timestamp.now()
  }
});

export default DailyQuoteItem;
