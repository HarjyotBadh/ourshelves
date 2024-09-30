import React, { useState, useEffect } from 'react';
import { Text, XStack, Button, YStack } from 'tamagui';

interface ShopRefreshTimerProps {
  nextRefreshTime: Date;
  isDemoMode: boolean;
  demoRefreshTime: number | null;
  onManualRefresh: () => void;
  onDemoRefresh: () => void;
}

const ShopRefreshTimer: React.FC<ShopRefreshTimerProps> = ({
  nextRefreshTime,
  isDemoMode,
  demoRefreshTime,
  onManualRefresh,
  onDemoRefresh
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = nextRefreshTime.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, Math.floor(diff / 1000)));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [nextRefreshTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <YStack>
      <Text fontSize="$4" textAlign="center" marginTop="$4">
        Next Refresh In:
      </Text>
      <Text
        fontSize="$5"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$4"
      >
        {isDemoMode ? `Demo: ${formatTime(demoRefreshTime || 0)}` : formatTime(timeRemaining)}
      </Text>
      <XStack justifyContent="space-between" marginTop="$4">
        <Button
          onPress={onManualRefresh}
          backgroundColor="$orange8"
          color="$white"
          fontSize="$3"
          flex={1}
          marginRight="$2"
        >
          Refresh Shop
        </Button>
        <Button
          onPress={onDemoRefresh}
          backgroundColor="$purple8"
          color="$white"
          fontSize="$3"
          flex={1}
          marginLeft="$2"
          disabled={demoRefreshTime !== null}
        >
          Demo Refresh (10s)
        </Button>
      </XStack>
    </YStack>
  );
};

export default ShopRefreshTimer;