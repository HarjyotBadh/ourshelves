import React, { useState, useEffect, useCallback, useRef } from "react";
import { ScrollView } from "react-native";
import { Image, Text, View, XStack, YStack, styled, Spinner, Progress } from "tamagui";
import { doc, DocumentReference, getDoc, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { differenceInSeconds } from "date-fns";
import { db, functions, auth } from "firebaseConfig";
import {
  purchaseItem,
  purchaseShelfColor,
  purchaseWallpaper,
  earnCoins,
  loseCoins,
  handleDailyGiftClaim,
} from "project-functions/shopFunctions";
import { ItemData } from "components/item";
import DailyGift from "components/DailyGift";
import ShopHeader from "components/ShopHeader";
import ShopItemsList from "components/ShopItemsList";
import WallpapersList from "components/WallpapersList";
import ShelfColorsList from "components/ShelfColorsList";
import ShopRefreshTimer from "components/ShopRefreshTimer";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { ShopMetadata } from "models/ShopMetadata";
import { WallpaperData, ShelfColorData } from "models/RoomData";
import { UserData } from "models/UserData";
import { ToastViewport, useToastController } from "@tamagui/toast";
import { refreshShopManually } from "functions/src";

const BACKGROUND_COLOR = "$pink6";

const LoadingContainer = styled(YStack, {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: BACKGROUND_COLOR,
  padding: 20,
});

const SectionHeader = styled(XStack, {
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: "$2",
  paddingHorizontal: "$4",
  backgroundColor: "$pink7",
  marginBottom: "$2",
});

const SectionTitle = styled(Text, {
  fontSize: "$6",
  fontWeight: "bold",
});

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => {
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
  const [items, setItems] = useState<ItemData[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loadedItems, setLoadedItems] = useState(0);
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([]);
  const [shelfColors, setShelfColors] = useState<ShelfColorData[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    dailyGift: true,
    shopItems: true,
    wallpapers: true,
    shelfColors: true,
  });
  const [shopMetadata, setShopMetadata] = useState<ShopMetadata | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date>(new Date());

  const dataFetchedRef = useRef(false);

  const toast = useToastController();

  // Fetch shop metadata from Firestore
  const fetchShopMetadata = async (): Promise<ShopMetadata | null> => {
    const shopMetadataRef = doc(db, "GlobalSettings", "shopMetadata");
    const shopMetadataDoc = await getDoc(shopMetadataRef);
    return shopMetadataDoc.exists() ? (shopMetadataDoc.data() as ShopMetadata) : null;
  };

  const preloadImages = async (items: ItemData[]) => {
    setTotalItems(items.length);
    setLoadedItems(0);

    const preloadPromises = items.map((item, index) => {
      return new Promise((resolve) => {
        Image.prefetch(item.imageUri)
          .then(() => {
            setLoadedItems((prevLoaded) => {
              const newLoaded = prevLoaded + 1;
              const progress = (newLoaded / items.length) * 100;

              setLoadingProgress(progress);
              return newLoaded;
            });
            resolve(null);
          })
          .catch(() => {
            setLoadedItems((prevLoaded) => {
              const newLoaded = prevLoaded + 1;
              const progress = (newLoaded / items.length) * 100;

              setLoadingProgress(progress);
              return newLoaded;
            });
            resolve(null);
          });
      });
    });

    await Promise.all(preloadPromises);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    try {
      setError(null);

      const gottenShopMetadata = await fetchShopMetadata();
      setShopMetadata(gottenShopMetadata);
      if (!gottenShopMetadata) throw new Error("Shop metadata not found");

      const now = new Date();
      const nextRefreshDate = gottenShopMetadata.nextRefresh.toDate();
      setNextRefreshTime(nextRefreshDate);

      // Fetch items
      const fetchedItems = await Promise.all(
        gottenShopMetadata.items.map(async (itemWithStyle, index) => {
          const itemDoc = await getDoc(itemWithStyle.ref);
          if (!itemDoc.exists()) {
            throw new Error(`Item document not found: ${itemWithStyle.ref.path}`);
          }

          const baseItemData = itemDoc.data() as ItemData;

          // Update progress for each item
          setLoadingProgress(20 + ((index + 1) / gottenShopMetadata.items.length) * 30);

          // If item has style data, override base properties
          const itemData: ItemData = itemWithStyle.styleData
            ? {
                ...baseItemData,
                itemId: itemDoc.id, // Override with doc ID
                name: baseItemData.name,
                styleName: itemWithStyle.styleData.styleName,
                cost: itemWithStyle.styleData.cost,
                imageUri: itemWithStyle.styleData.imageUri,
                styleId: itemWithStyle.styleData.id,
              }
            : {
                ...baseItemData,
                itemId: itemDoc.id, // Override with doc ID
              };

          return itemData;
        })
      );

      setLoadingProgress(50);

      // Fetch wallpapers (unchanged)
      const fetchedWallpapers = await Promise.all(
        gottenShopMetadata.wallpapers.map(async (wallpaperId: string) => {
          const wallpaperDoc = await getDoc(doc(db, "Wallpapers", wallpaperId));
          return { id: wallpaperId, ...wallpaperDoc.data() } as WallpaperData;
        })
      );

      // Fetch shelf colors (unchanged)
      const fetchedShelfColors = await Promise.all(
        gottenShopMetadata.shelfColors.map(async (shelfColorId: string) => {
          const shelfColorDoc = await getDoc(doc(db, "ShelfColors", shelfColorId));
          return { id: shelfColorId, ...shelfColorDoc.data() } as ShelfColorData;
        })
      );

      await preloadImages(fetchedItems);

      setItems(fetchedItems);
      setWallpapers(fetchedWallpapers);
      setShelfColors(fetchedShelfColors);

      // Fetch user data
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "Users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUser(userData);
        } else {
          throw new Error("User data not found");
        }
      } else {
        throw new Error("User not authenticated");
      }

      // Set refresh timer
      const secondsUntilRefresh = differenceInSeconds(nextRefreshDate, now);
      setRefreshTime(secondsUntilRefresh > 0 ? secondsUntilRefresh : 0);

      // Add a short delay to ensure smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
      setLoadedItems(0);
      setLoadingProgress(0);
    }
  }, []);

  // Initial data fetch and refresh timer setup
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, [fetchData]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const refreshShop = httpsCallable(functions, "refreshShopManually");
      await refreshShop();
      await fetchData();
    } catch (error) {
      console.error("Error refreshing shop:", error);
      setError("Failed to refresh shop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item: ItemData) => {
    if (!user) return;
    const result = await purchaseItem(item, user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      //alert(result.message);
      toast.show(item.name + " Purchased!", {
        message: result.message,
        duration: 3000,
      });
    } else {
      alert(result.message);
    }
  };

  const handlePurchaseWallpaper = async (wallpaper: WallpaperData) => {
    if (!user) return;
    const result = await purchaseWallpaper(wallpaper, user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      //alert(result.message);
      toast.show(wallpaper.name + " Purchased!", {
        message: result.message,
        duration: 3000,
      });
    } else {
      alert(result.message);
    }
  };

  const handlePurchaseShelfColor = async (shelfColor: ShelfColorData) => {
    if (!user) return;
    const result = await purchaseShelfColor(shelfColor, user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      //alert(result.message);
      toast.show(shelfColor.name + " Purchased!", {
        message: result.message,
        duration: 3000,
      });
    } else {
      alert(result.message);
    }
  };

  const handleEarnCoinsClick = async () => {
    let userId = auth.currentUser?.uid;
    const result = await earnCoins(userId, 50);
    if (result.success && result.newCoins !== null) {
      setUser((prevUser) =>
        prevUser ? { ...prevUser, coins: result.newCoins ?? prevUser.coins } : prevUser
      );
    } else {
      toast.show("Error", {
        message: result.message,
        duration: 3000,
      });
    }
  };

  const handleLoseCoinsClick = async () => {
    let userId = auth.currentUser?.uid;
    const result = await loseCoins(userId, 50);
    if (result.success && result.newCoins !== null) {
      setUser((prevUser) =>
        prevUser ? { ...prevUser, coins: result.newCoins ?? prevUser.coins } : prevUser
      );
    } else {
      toast.show("Error", {
        message: result.message,
        duration: 3000,
      });
    }
  };

  const handleDailyGiftClaimClick = async (newCoins: number, newLastClaimTime: Timestamp) => {
    if (!user) return;
    const result = await handleDailyGiftClaim(user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
    } else {
      alert(result.message);
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner size="large" color="$blue10" />
        <Text fontSize={18} color="$blue10" marginTop={20} marginBottom={10}>
          Shop is loading...
        </Text>
        <Progress value={loadingProgress} width={200}>
          <Progress.Indicator animation="bouncy" backgroundColor="$blue10" />
        </Progress>
        <Text fontSize={14} color="$blue10" marginTop={10}>
          {loadedItems} / {totalItems} items loaded
        </Text>
      </LoadingContainer>
    );
  }

  if (error) {
    return <Text color="$red10">{error}</Text>;
  }

  return (
    <ShopContainer>
      <ContentContainer>
        <ShopHeader coins={user?.coins || 0} />

        <CollapsibleSection
          title="Daily Gift"
          isExpanded={expandedSections.dailyGift}
          onToggle={() => toggleSection("dailyGift")}
        >
          <DailyGift
            user={user}
            shopMetadata={shopMetadata}
            onClaimDailyGift={handleDailyGiftClaimClick}
            isDemoMode={false}
            isDemoRefreshComplete={false}
          />
        </CollapsibleSection>
        <CollapsibleSection
          title="Shop Items"
          isExpanded={expandedSections.shopItems}
          onToggle={() => toggleSection("shopItems")}
        >
          <ShopItemsList items={items} userCoins={user?.coins || 0} onPurchase={handlePurchase} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Wallpapers"
          isExpanded={expandedSections.wallpapers}
          onToggle={() => toggleSection("wallpapers")}
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
          onToggle={() => toggleSection("shelfColors")}
        >
          <ShelfColorsList
            shelfColors={shelfColors}
            userCoins={user?.coins || 0}
            onPurchase={handlePurchaseShelfColor}
          />
        </CollapsibleSection>

        <ShopRefreshTimer
          nextRefreshTime={shopMetadata ? shopMetadata.nextRefresh.toDate() : new Date()}
          onManualRefresh={handleManualRefresh}
        />
      </ContentContainer>
      <ToastViewport name="shop" />
    </ShopContainer>
  );
}
