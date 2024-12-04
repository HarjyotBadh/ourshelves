import React, { useState, useEffect } from "react";
import { Modal, View } from "react-native";
import { YStack, Button, Text } from "tamagui";
import { RefreshCw, Quote } from "@tamagui/lucide-icons";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { auth } from "firebaseConfig";
import {
  QuoteView,
  ContentContainer,
  BottomBar,
  QuoteContainer,
  dailyQuoteStyles as styles
} from "styles/DailyQuoteStyles";

interface DailyQuoteItemProps {
  itemData: {
    id: string;
    itemId: string;
    name: string;
    imageUri: string;
    placedUserId: string;
    currentQuote?: {
      quote: string;
      author: string;
      lastRefreshed?: number;
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

interface DailyQuoteItemComponent extends React.FC<DailyQuoteItemProps> {
  getInitialData: () => {
    currentQuote: {
      quote: string;
      author: string;
      lastRefreshed: number;
    };
  };
}

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

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
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return timeLeft;
};

const DailyQuoteItem: DailyQuoteItemComponent = ({ itemData, onDataUpdate, isActive, onClose, roomInfo }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isOwner = itemData.placedUserId === auth.currentUser?.uid;
  const toast = useToastController();
  
  const timeLeft = useCountdown(itemData.currentQuote?.lastRefreshed);

  useEffect(() => {
    if (isActive && !isModalVisible) {
      setIsModalVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (!itemData.currentQuote?.quote || shouldRefreshQuote(itemData.currentQuote?.lastRefreshed)) {
      fetchNewQuote();
    }
  }, []);

  const handleModalClose = () => {
    setIsModalVisible(false);
    onClose();
  };

  const shouldRefreshQuote = (lastRefreshed?: number) => {
    if (!lastRefreshed) return true;
    return Date.now() - lastRefreshed >= REFRESH_INTERVAL;
  };

  const fetchNewQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://zenquotes.io/api/random");
      const quoteData = await response.json();

      if (Array.isArray(quoteData) && quoteData[0] && quoteData[0].q && quoteData[0].a) {
        onDataUpdate({
          ...itemData,
          currentQuote: {
            quote: quoteData[0].q,
            author: quoteData[0].a,
            lastRefreshed: Date.now(),
          },
        });
        toast.show("New quote fetched!", {
          message: "Your daily inspiration has been updated.",
          duration: 3000,
        });
      } else {
        throw new Error("Invalid quote format");
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
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
      toast.show("Failed to fetch new quote", {
        message: "Using backup quote instead.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const truncateQuote = (quote: string, maxLength: number) => {
    return quote.length > maxLength ? `${quote.substring(0, maxLength)}...` : quote;
  };

  if (!isActive) {
    return (
      <View style={styles.inactiveContainer}>
        <Text style={styles.inactiveQuoteText}>
          "{truncateQuote(itemData.currentQuote?.quote || "Loading quote...", 40)}"
        </Text>
        <Text style={styles.inactiveAuthorText}>
          - {itemData.currentQuote?.author || ""}
        </Text>
      </View>
    );
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalContainer}>
        <QuoteView>
          <ContentContainer>
            <Text style={styles.headerText}>Daily Quote</Text>

            <View style={styles.previewContainer}>
              <Text style={styles.quoteText}>
                "{itemData.currentQuote?.quote}"
              </Text>
              <Text style={styles.authorText}>
                - {itemData.currentQuote?.author}
              </Text>
            </View>

            {isOwner && (
              <>
                <Text style={styles.timerText}>{timeLeft}</Text>
                <Button
                  onPress={fetchNewQuote}
                  disabled={isLoading}
                  icon={RefreshCw}
                  backgroundColor="$blue10"
                  color="white"
                  marginBottom="$4"
                >
                  {isLoading ? "Fetching..." : "Get New Quote"}
                </Button>
              </>
            )}

            <Button onPress={handleModalClose} theme="red">
              Close
            </Button>
          </ContentContainer>
          <BottomBar />
        </QuoteView>
        <ToastViewport name="quote" />
      </View>
    </Modal>
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