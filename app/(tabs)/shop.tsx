import React, { useState, useEffect, useCallback, useRef } from "react";
import { FlatList, ScrollView } from "react-native";
import { Image, Text, View, Button, XStack, YStack, useTheme, styled, Spinner, Progress, Circle } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { differenceInSeconds } from "date-fns";
import { db, functions } from "firebaseConfig";
import { 
  purchaseItem, 
  purchaseShelfColor, 
  purchaseWallpaper, 
  handleEarnCoins, 
  handleLoseCoins,
  handleDailyGiftClaim
} from "project-functions/shopFunctions";
import Item, { ItemData } from "components/item";
import DailyGift from "components/DailyGift";
import ShopHeader from "components/ShopHeader";
import ShopItemsList from "components/ShopItemsList";
import WallpapersList from "components/WallpapersList";
import ShelfColorsList from "components/ShelfColorsList";
import ShopRefreshTimer from "components/ShopRefreshTimer";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";

const BACKGROUND_COLOR = '$pink6';

// Interfaces
interface ShopMetadata {
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  items: string[];
  wallpapers: string[];
  shelfColors: string[];
}

interface WallpaperData {
  id: string;
  name: string;
  cost: number;
  gradientColors: string[];
  description?: string;
}

interface ShelfColorData {
  id: string;
  name: string;
  cost: number;
  color: string;
  description?: string;
}

interface User {
  userId: string;
  coins: number;
  inventory: DocumentReference[];
  wallpapers: DocumentReference[];
  shelfColors: DocumentReference[];
  lastDailyGiftClaim: Timestamp | null;
}

async function fetchItemData(
  itemRef: DocumentReference
): Promise<ItemData | null> {
  const itemDoc = await getDoc(itemRef);
  if (itemDoc.exists()) {
    return { itemId: itemDoc.id, ...itemDoc.data() } as ItemData;
  }
  return null;
}

async function fetchInventoryItems(
  inventory: DocumentReference[]
): Promise<ItemData[]> {
  const inventoryItems = await Promise.all(inventory.map(fetchItemData));
  return inventoryItems.filter((item): item is ItemData => item !== null);
}

const preloadImages = async (items: ItemData[], setLoadingProgress: (progress: number) => void) => {
  const totalImages = items.length;
  let loadedImages = 0;

  const preloadPromises = items.map((item) => {
    return new Promise((resolve) => {
      Image.prefetch(item.imageUri)
        .then(() => {
          loadedImages++;
          setLoadingProgress((loadedImages / totalImages) * 100);
          resolve(null);
        })
        .catch(() => {
          loadedImages++;
          setLoadingProgress((loadedImages / totalImages) * 100);
          resolve(null);
        });
    });
  });

  await Promise.all(preloadPromises);
};

const LoadingContainer = styled(YStack, {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: BACKGROUND_COLOR,
  padding: 20,
});


const SectionHeader = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  backgroundColor: '$pink7',
  borderRadius: '$2',
  marginBottom: '$2',
});

const SectionTitle = styled(Text, {
  fontSize: '$6',
  fontWeight: 'bold',
});

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, isExpanded, onToggle, children }) => {
  return (
    <View marginBottom="$4">
      <SectionHeader onPress={onToggle}>
        <SectionTitle>{title}</SectionTitle>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </SectionHeader>
      {isExpanded && children}
    </View>
  );
};

const ShopContainer = styled(ScrollView, {
  flex: 1,
  backgroundColor: "$pink6",
});

const ContentContainer = styled(YStack, {
  padding: "$4",
});

export default function ShopScreen() {
  // State variables
  const [items, setItems] = useState<ItemData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const [canClaimDailyGift, setCanClaimDailyGift] = useState(false);
  const [dailyGiftTimer, setDailyGiftTimer] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [demoRefreshTime, setDemoRefreshTime] = useState<number | null>(null); //for sprint 1 testing
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([]);
  const [shelfColors, setShelfColors] = useState<ShelfColorData[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    dailyGift: true,
    shopItems: true,
    wallpapers: true,
    shelfColors: true,
  });
  const [shopMetadata, setShopMetadata] = useState<ShopMetadata | null>(null);

  // TODO: Replace with actual user authentication
  const userId = "DAcD1sojAGTxQcYe7nAx"; // Placeholder

  // Fetch shop metadata from Firestore
  const fetchShopMetadata = async (): Promise<ShopMetadata | null> => {
    const shopMetadataRef = doc(db, "GlobalSettings", "shopMetadata");
    const shopMetadataDoc = await getDoc(shopMetadataRef);
    return shopMetadataDoc.exists()
      ? (shopMetadataDoc.data() as ShopMetadata)
      : null;
  };

  //for sprint 1 testing
  const handleDemoRefresh = () => {
    setDemoRefreshTime(10);
    setIsDemoMode(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setError(null);

      const gottenShopMetadata = await fetchShopMetadata();
      setShopMetadata(gottenShopMetadata);
      if (!gottenShopMetadata) throw new Error("Shop metadata not found");

      const now = new Date();
      const nextRefreshDate = gottenShopMetadata.nextRefresh.toDate();


      // Fetch items
      const fetchedItems = await Promise.all(gottenShopMetadata.items.map(async (itemId) => {
        const itemDoc = await getDoc(doc(db, "Items", itemId));
        return { itemId, ...itemDoc.data() } as ItemData;
      }));

      // Fetch wallpapers
      const fetchedWallpapers = await Promise.all(gottenShopMetadata.wallpapers.map(async (wallpaperId) => {
        const wallpaperDoc = await getDoc(doc(db, "Wallpapers", wallpaperId));
        return { id: wallpaperId, ...wallpaperDoc.data() } as WallpaperData;
      }));

      // Fetch shelf colors
      const fetchedShelfColors = await Promise.all(gottenShopMetadata.shelfColors.map(async (shelfColorId) => {
        const shelfColorDoc = await getDoc(doc(db, "ShelfColors", shelfColorId));
        return { id: shelfColorId, ...shelfColorDoc.data() } as ShelfColorData;
      }));

      await preloadImages(fetchedItems, setLoadingProgress);

      setItems(fetchedItems);
      setWallpapers(fetchedWallpapers);
      setShelfColors(fetchedShelfColors);


      // Fetch user data
      if (userId) {
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
        } else {
          throw new Error("User not found");
        }
      } else {
        throw new Error("User not authenticated");
      }

      // Set refresh timer
      const secondsUntilRefresh = differenceInSeconds(nextRefreshDate, now);
      setRefreshTime(secondsUntilRefresh > 0 ? secondsUntilRefresh : 0);

      // Add a short delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial data fetch and refresh timer setup
  useEffect(() => {
    fetchData();

    const timer = setInterval(() => {
      setRefreshTime((prevTime) => {
        if (prevTime <= 0) {
          fetchData();
          return 0;
        }
        return prevTime - 1;
      });

      setDailyGiftTimer((prevTime) => {
        if (prevTime <= 0) {
          setCanClaimDailyGift(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [fetchData]);

  //for sprint 1 testing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (demoRefreshTime !== null && demoRefreshTime > 0) {
      timer = setTimeout(() => {
        setDemoRefreshTime(demoRefreshTime - 1);
      }, 1000);
    } else if (demoRefreshTime === 0) {
      handleManualRefresh();
      setDemoRefreshTime(null);
      setIsDemoMode(false);
    }
    return () => clearTimeout(timer);
  }, [demoRefreshTime]);

  // Handle manual shop refresh
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const refreshShop = httpsCallable(functions, "refreshShopManually");
      await refreshShop();
      await fetchData();
    } catch (error) {
      console.error("Error refreshing shop:", error);
      setError("Failed to refresh shop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: ItemData) => {
    if (!user) return;
    const result = await purchaseItem(item, user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handlePurchaseWallpaper = async (wallpaper: WallpaperData) => {
    if (!user) return;
    const result = await purchaseWallpaper(wallpaper, user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handlePurchaseShelfColor = async (shelfColor: ShelfColorData) => {
    if (!user) return;
    const result = await purchaseShelfColor(shelfColor, user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleEarnCoinsClick = async () => {
    if (!user) return;
    const result = await handleEarnCoins(user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleLoseCoinsClick = async () => {
    if (!user) return;
    const result = await handleLoseCoins(user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleDailyGiftClaimClick = async (newCoins: number, newLastClaimTime: Timestamp) => {
    if (!user) return;
    const result = await handleDailyGiftClaim(user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="large" color="$blue10" />
        <Text fontSize={18} color="$blue10" marginTop={20} marginBottom={10}>
          Shop is loading...
        </Text>
        <Progress value={loadingProgress} width={200}>
          <Progress.Indicator animation="bouncy" backgroundColor="$blue10" />
        </Progress>
      </LoadingContainer>
    );
  }

  if (error) {
    return <Text color="$red10">{error}</Text>;
  }

  return (
    <ShopContainer>
      <ContentContainer>
        <ShopHeader
          coins={user?.coins || 0}
          onEarnCoins={handleEarnCoinsClick}
          onLoseCoins={handleLoseCoinsClick}
        />

        <CollapsibleSection
          title="Daily Gift"
          isExpanded={expandedSections.dailyGift}
          onToggle={() => toggleSection('dailyGift')}
        >
          {user && shopMetadata && (
            <DailyGift
              user={user}
              shopMetadata={shopMetadata}
              onClaimDailyGift={handleDailyGiftClaimClick}
            />
          )}
        </CollapsibleSection>
        <CollapsibleSection
          title="Shop Items"
          isExpanded={expandedSections.shopItems}
          onToggle={() => toggleSection('shopItems')}
        >
          <ShopItemsList
            items={items}
            userCoins={user?.coins || 0}
            onPurchase={handlePurchase}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Wallpapers"
          isExpanded={expandedSections.wallpapers}
          onToggle={() => toggleSection('wallpapers')}
        >
          <WallpapersList
            wallpapers={wallpapers}
            userCoins={user?.coins || 0}
            onPurchase={handlePurchaseWallpaper}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Shelf Colors"
          isExpanded={expandedSections.shelfColors}
          onToggle={() => toggleSection('shelfColors')}
        >
          <ShelfColorsList
            shelfColors={shelfColors}
            userCoins={user?.coins || 0}
            onPurchase={handlePurchaseShelfColor}
          />
        </CollapsibleSection>

        <ShopRefreshTimer
          refreshTime={refreshTime}
          isDemoMode={isDemoMode}
          demoRefreshTime={demoRefreshTime}
          onManualRefresh={handleManualRefresh}
          onDemoRefresh={handleDemoRefresh}
        />
      </ContentContainer>
    </ShopContainer>
  );
}
