import React from 'react';
import { Text, XStack, Button } from 'tamagui';

interface ShopRefreshTimerProps {
  refreshTime: number;
  isDemoMode: boolean;
  demoRefreshTime: number | null;
  onManualRefresh: () => void;
  onDemoRefresh: () => void;
}

const ShopRefreshTimer: React.FC<ShopRefreshTimerProps> = ({
  refreshTime,
  isDemoMode,
  demoRefreshTime,
  onManualRefresh,
  onDemoRefresh
}) => {
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Text fontSize="$4" textAlign="center" marginTop="$4">
        Shop Refreshes In:
      </Text>
      <Text
        fontSize="$5"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$4"
      >
        {isDemoMode ? `Demo: ${formatTime(demoRefreshTime)}` : formatTime(refreshTime)}
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
    </>
  );
};

export default ShopRefreshTimer;