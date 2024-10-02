import React, { useState, useEffect } from "react";
import { View, Button, Text } from "tamagui";
import { Timestamp } from "firebase/firestore";
import Item from "./item";

interface User {
  userId: string;
  coins: number;
  lastDailyGiftClaim: Timestamp | null;
}

interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
}

interface DailyGiftProps {
  user: User | null;
  shopMetadata: ShopMetadata | null;
  onClaimDailyGift: (newCoins: number, newLastClaimTime: Timestamp) => void;
  isDemoMode: boolean;
  isDemoRefreshComplete: boolean;
}

const DailyGift: React.FC<DailyGiftProps> = ({
  user,
  shopMetadata,
  onClaimDailyGift,
  isDemoMode,
  isDemoRefreshComplete,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!shopMetadata) return;

    const updateTimer = () => {
      const now = new Date();
      const nextRefresh = shopMetadata.nextRefresh.toDate();
      const diff = nextRefresh.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, Math.floor(diff / 1000)));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [shopMetadata]);

  const canClaimDailyGift =
    user &&
    shopMetadata &&
    (isDemoRefreshComplete || timeRemaining === 0) &&
    (!user.lastDailyGiftClaim ||
      user.lastDailyGiftClaim.toDate() < shopMetadata.lastRefresh.toDate());

  const handleDailyGiftClaim = async () => {
    if (!user || !canClaimDailyGift || !shopMetadata) return;

    const now = Timestamp.now();
    const newCoins = user.coins + 100;
    onClaimDailyGift(newCoins, now);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!user || !shopMetadata) {
    return null;
  }

  return (
    <View width="100%" alignItems="center" marginBottom="$4">
      <Item
        item={{
          itemId: "daily-gift",
          name: "Daily Gift",
          imageUri:
            "https://firebasestorage.googleapis.com/v0/b/ourshelves-33a94.appspot.com/o/items%2Fdailygift.png?alt=media&token=46ad85b5-9fb5-4ef0-b32f-1894091e82f3",
          cost: 0,
        }}
        showName={true}
        showCost={false}
      />
      <View
        height={20}
        marginTop="$1"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="$2" color="$yellow10">
          Free!
        </Text>
      </View>
      {canClaimDailyGift ? (
        <Button
          onPress={handleDailyGiftClaim}
          backgroundColor="$green8"
          color="$white"
          fontSize="$2"
          marginTop="$1"
        >
          Claim
        </Button>
      ) : (
        <Text fontSize="$2" textAlign="center" marginTop="$1">
          {isDemoMode
            ? "Demo refresh in progress..."
            : formatTime(timeRemaining)}
        </Text>
      )}
    </View>
  );
};

export default DailyGift;
