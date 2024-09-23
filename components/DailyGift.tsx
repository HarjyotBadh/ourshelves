import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'tamagui';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { differenceInSeconds } from 'date-fns';
import Item from './item';

const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

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
}

const DailyGift: React.FC<DailyGiftProps> = ({ user, shopMetadata, onClaimDailyGift }) => {
  const [canClaimDailyGift, setCanClaimDailyGift] = useState(false);
  const [dailyGiftTimer, setDailyGiftTimer] = useState(0);

  useEffect(() => {
    if (user && shopMetadata) {
      updateDailyGiftStatus();
    }
  }, [user, shopMetadata]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDailyGiftTimer((prevTime) => {
        if (prevTime <= 0) {
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateDailyGiftStatus = () => {
    if (!user || !shopMetadata) return;

    const now = new Date();
    const lastRefreshDate = shopMetadata.lastRefresh.toDate();
    const nextRefreshDate = shopMetadata.nextRefresh.toDate();
    const canClaim = checkCanClaimDailyGift(user, lastRefreshDate);
    setCanClaimDailyGift(canClaim);

    if (!canClaim) {
      const secondsUntilNextClaim = differenceInSeconds(nextRefreshDate, now);
      setDailyGiftTimer(secondsUntilNextClaim > 0 ? secondsUntilNextClaim : 0);
    } else {
      setDailyGiftTimer(0);
    }
  };

  const checkCanClaimDailyGift = (user: User, lastRefresh: Date): boolean => {
    if (!user.lastDailyGiftClaim) return true;
    const lastClaimDate = user.lastDailyGiftClaim.toDate();
    return lastClaimDate < lastRefresh;
  };

  const handleDailyGiftClaim = async () => {
    if (!user || !canClaimDailyGift || !shopMetadata) return;

    try {
      //const userDocRef = doc(db, "Users", user.userId);
      const userDocRef = doc(db, "Users", userId);
      const now = Timestamp.now();
      const newCoins = user.coins + 100;
      await updateDoc(userDocRef, {
        coins: newCoins,
        lastDailyGiftClaim: now,
      });

      onClaimDailyGift(newCoins, now);
      setCanClaimDailyGift(false);
      const secondsUntilNextClaim = differenceInSeconds(shopMetadata.nextRefresh.toDate(), now.toDate());
      setDailyGiftTimer(secondsUntilNextClaim > 0 ? secondsUntilNextClaim : 0);
      alert("Daily gift claimed! You received 100 coins.");
    } catch (error) {
      console.error("Error claiming daily gift:", error);
      alert("Failed to claim daily gift. Please try again later.");
    }
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
          {formatTime(dailyGiftTimer)}
        </Text>
      )}
    </View>
  );
};

export default DailyGift;