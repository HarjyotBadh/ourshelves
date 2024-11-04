import React, { useState, useEffect } from "react";
import { View, styled, YStack, Text, Dialog, Button } from "tamagui";
import { RefreshCw } from "@tamagui/lucide-icons";

interface DailyQuoteItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    [key: string]: any;

    // Custom properties
    currentQuote?: {
      quote: string;
      author: string;
      lastRefreshed?: number; // Unix timestamp in milliseconds
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
      lastRefreshed: number;
    };
  };
}

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const useCountdown = (targetTime?: number) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetTime) return;

    const calculateTimeLeft = () => {
      const difference = targetTime + REFRESH_INTERVAL - Date.now();
      if (difference <= 0) return "Time to refresh!";

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m until next quote`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); // Update every minute

    return () => clearInterval(timer);
  }, [targetTime]);

  return timeLeft;
};

const DailyQuoteItem: DailyQuoteItemComponent = ({ itemData, onDataUpdate, isActive, onClose }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timeLeft = useCountdown(itemData.currentQuote?.lastRefreshed);

  useEffect(() => {
    if (isActive && !dialogOpen) {
      setDialogOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (!itemData.currentQuote?.quote || shouldRefreshQuote(itemData.currentQuote?.lastRefreshed)) {
      fetchNewQuote();
    }
  }, []);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://zenquotes.io/api/random");
      const quoteData = await response.json();

      // Check if the response has the expected structure
      if (Array.isArray(quoteData) && quoteData[0] && quoteData[0].q && quoteData[0].a) {
        onDataUpdate({
          ...itemData,
          currentQuote: {
            quote: quoteData[0].q,
            author: quoteData[0].a,
            lastRefreshed: Date.now(),
          },
        });
      } else {
        // Use fallback if API response is not in expected format
        onDataUpdate({
          ...itemData,
          currentQuote: {
            quote: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            lastRefreshed: Date.now(),
          },
        });
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      // Only update with fallback if there's no existing quote
      if (!itemData.currentQuote?.quote) {
        onDataUpdate({
          ...itemData,
          currentQuote: {
            quote: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            lastRefreshed: Date.now(),
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const truncateQuote = (quote: string, maxLength: number) => {
    return quote.length > maxLength ? `${quote.substring(0, maxLength)}...` : quote;
  };

  const shouldRefreshQuote = (lastRefreshed?: number) => {
    if (!lastRefreshed) return true;
    const timeSinceLastRefresh = Date.now() - lastRefreshed;
    return timeSinceLastRefresh >= REFRESH_INTERVAL;
  };

  if (!isActive) {
    return (
      <YStack flex={1}>
        <QuoteContainer>
          <QuoteText>
            "{truncateQuote(itemData.currentQuote?.quote || "Loading daily quote...", 50)}"
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
              </YStack>

              <Text fontSize="$2" color="$blue8" textAlign="center">
                {timeLeft}
              </Text>

              <StyledButton onPress={fetchNewQuote} disabled={isLoading} icon={RefreshCw}>
                <Text color="white">{isLoading ? "Generating..." : "Generate New Quote"}</Text>
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
    quote: "",
    author: "",
    lastRefreshed: Date.now(),
  },
});

export default DailyQuoteItem;
