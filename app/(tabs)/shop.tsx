import React, { useState, useEffect, useCallback, useRef } from "react";
import { ScrollView } from "react-native";
import {
  Image,
  Text,
  View,
  XStack,
  YStack,
  styled,
  Spinner,
  Progress,
} from "tamagui";
import { doc, DocumentReference, getDoc, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { differenceInSeconds } from "date-fns";
import { db, functions, auth } from "firebaseConfig";
import {
  purchaseItem,
  purchaseShelfColor,
  purchaseWallpaper,
  handleEarnCoins,
  handleLoseCoins,
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
  borderRadius: "$2",
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
  const [nextRefreshTime, setNextRefreshTime] = useState<Date>(new Date());
  const [isDemoRefreshComplete, setIsDemoRefreshComplete] = useState(false);

  const dataFetchedRef = useRef(false);

  const toast = useToastController();

  // Fetch shop metadata from Firestore
  const fetchShopMetadata = async (): Promise<ShopMetadata | null> => {
    const shopMetadataRef = doc(db, "GlobalSettings", "shopMetadata");
    const shopMetadataDoc = await getDoc(shopMetadataRef);
    return shopMetadataDoc.exists()
      ? (shopMetadataDoc.data() as ShopMetadata)
      : null;
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

  //for sprint 1 testing
  const handleDemoRefresh = () => {
    setDemoRefreshTime(10);
    setIsDemoMode(true);
    setIsDemoRefreshComplete(false);

    // Update shopMetadata for demo mode
    if (shopMetadata) {
      const now = new Date();
      const demoNextRefresh = new Date(now.getTime() + 10000); // 10 seconds from now
      setShopMetadata({
        ...shopMetadata,
        nextRefresh: Timestamp.fromDate(demoNextRefresh),
      });
    }
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
        gottenShopMetadata.items.map(async (itemRef: DocumentReference) => {
          const itemDoc = await getDoc(itemRef);
          return { itemId: itemDoc.id, ...itemDoc.data() } as ItemData;
        })
      );

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
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
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

  //for sprint 1 testing
  const performShopRefresh = async (isDemo: boolean) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        // Simulate shop refresh for demo mode
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        // You might want to generate new random items here for demo purposes
      } else {
        // Perform actual shop refresh
        const refreshShop = httpsCallable(functions, "refreshShopManually");
        await refreshShop();
      }
      await fetchData(); // Fetch new data after refresh
      setIsDemoRefreshComplete(true);
    } catch (error) {
      console.error("Error refreshing shop:", error);
      setError("Failed to refresh shop. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDemoMode(false);
      setDemoRefreshTime(null);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (demoRefreshTime !== null && demoRefreshTime > 0) {
      timer = setTimeout(() => {
        setDemoRefreshTime(demoRefreshTime - 1);
      }, 1000);
    } else if (demoRefreshTime === 0) {
      setIsDemoRefreshComplete(true);
      performShopRefresh(true); // Perform demo refresh when timer hits zero
    }
    return () => clearTimeout(timer);
  }, [demoRefreshTime]);

  const handleManualRefresh = () => performShopRefresh(false);

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
    if (!user) return;
    const result = await handleEarnCoins(user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      //alert(result.message);
      toast.show("You earned 50 coins! Great job!", {
        message: result.message,
        duration: 3000,
      });
    } else {
      alert(result.message);
    }
  };

  const handleLoseCoinsClick = async () => {
    if (!user) return;
    const result = await handleLoseCoins(user);
    if (result.success && result.updatedUser) {
      setUser(result.updatedUser);
      //alert(result.message);
      toast.show("You lost 50 coins! Great job!", {
        message: result.message,
        duration: 3000,
      });
    } else {
      alert(result.message);
    }
  };

  const handleDailyGiftClaimClick = async (
    newCoins: number,
    newLastClaimTime: Timestamp
  ) => {
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
        <ShopHeader
          coins={user?.coins || 0}
          onEarnCoins={handleEarnCoinsClick}
          onLoseCoins={handleLoseCoinsClick}
        />

        <CollapsibleSection
          title="Daily Gift"
          isExpanded={expandedSections.dailyGift}
          onToggle={() => toggleSection("dailyGift")}
        >
          {user && shopMetadata && (
            <DailyGift
              user={user}
              shopMetadata={shopMetadata}
              onClaimDailyGift={handleDailyGiftClaimClick}
              isDemoMode={isDemoMode}
              isDemoRefreshComplete={isDemoRefreshComplete}
            />
          )}
        </CollapsibleSection>
        <CollapsibleSection
          title="Shop Items"
          isExpanded={expandedSections.shopItems}
          onToggle={() => toggleSection("shopItems")}
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
          nextRefreshTime={
            shopMetadata ? shopMetadata.nextRefresh.toDate() : new Date()
          }
          isDemoMode={isDemoMode}
          demoRefreshTime={demoRefreshTime}
          onManualRefresh={handleManualRefresh}
          onDemoRefresh={handleDemoRefresh}
        />
      </ContentContainer>
      <ToastViewport name="shop" />
    </ShopContainer>
  );
}
