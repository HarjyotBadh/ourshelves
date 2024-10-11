import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Image,
  Progress,
  Spinner,
  Card,
  H4,
} from "tamagui";
import { ArrowLeft, X } from "@tamagui/lucide-icons";
import Feather from "@expo/vector-icons/Feather";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  writeBatch,
  updateDoc,
  DocumentReference,
  DocumentData,
  query,
  where,
  onSnapshot,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "firebaseConfig";
import Shelf from "../../components/Shelf";
import ItemSelectionSheet from "../../components/ItemSelectionSheet";
import RoomSettingsDialog from "../../components/RoomSettingsDialog";
import items from "../../components/items";
import { PlacedItemData, ItemData, ShelfData } from "../../models/RoomData";
import { UserData } from "../../models/UserData";
import { PurchasedItem } from "models/PurchasedItem";
import {
  BACKGROUND_COLOR,
  HEADER_BACKGROUND,
  HeaderButton,
  Header,
  Content,
  SafeAreaWrapper,
  Container,
} from "../../styles/RoomStyles";

// ==================================================== //

interface RoomData extends DocumentData {
  name: string;
  description?: string;
  users: DocumentReference[];
  admins: DocumentReference[];
  shelfList: DocumentReference[];
}

const RoomScreen = () => {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [roomName, setRoomName] = useState<string>("");
  const [roomDescription, setRoomDescription] = useState<string | undefined>(undefined);
  const [shelves, setShelves] = useState<ShelfData[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<{
    shelfId: string;
    position: number;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableItems, setAvailableItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [users, setUsers] = useState<
    {
      id: string;
      displayName: string;
      profilePicture?: string;
      isAdmin: boolean;
    }[]
  >([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [roomInfo, setRoomInfo] = useState<{
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  }>({ name: "", users: [], description: "" });

  const initializeShelves = async (roomId: string) => {
    const batch = writeBatch(db);
    const newShelves: ShelfData[] = [];
    const shelfRefs: DocumentReference[] = [];

    for (let i = 0; i < 10; i++) {
      const newShelfRef = doc(collection(db, "Shelves"));
      const newShelfData: ShelfData = {
        id: newShelfRef.id,
        roomId,
        position: i,
        name: `Shelf ${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        itemList: [],
      };
      batch.set(newShelfRef, newShelfData);
      newShelves.push(newShelfData);
      shelfRefs.push(newShelfRef);
    }

    const roomRef = doc(db, "Rooms", roomId);
    batch.update(roomRef, { shelfList: shelfRefs });

    await batch.commit();
    return newShelves;
  };

  const preloadImages = async (items: ItemData[]) => {
    let loadedImages = 0;

    const preloadPromises = items.map((item) => {
      return new Promise((resolve) => {
        Image.prefetch(item.imageUri)
          .then(() => {
            loadedImages++;
            resolve(null);
          })
          .catch(() => {
            loadedImages++;
            resolve(null);
          });
      });
    });

    await Promise.all(preloadPromises);
  };

  useEffect(() => {
    if (!roomId) return;

    setIsLoading(true);
    setLoadingProgress(0);

    // Array to hold unsubscribe functions for shelf listeners
    let unsubscribeShelves: (() => void)[] = [];
    let unsubscribePlacedItems: () => void;

    const roomRef = doc(db, "Rooms", roomId);

    const fetchRoomData = async () => {
      try {
        setLoadingProgress(10);
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          const roomData = roomDoc.data() as RoomData;

          setRoomName(roomData.name);
          setRoomDescription(roomData.description);

          setLoadingProgress(20);

          // Handle users and admins
          const userRefs = roomData.users || [];
          const adminRefs = roomData.admins || [];

          const userMap = new Map<
            string,
            {
              id: string;
              displayName: string;
              profilePicture?: string;
              isAdmin: boolean;
            }
          >();

          setLoadingProgress(30);

          // Fetch regular users
          for (const ref of userRefs) {
            const userDoc = await getDoc(ref);
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              userMap.set(userDoc.id, {
                id: userDoc.id,
                displayName: userData.displayName || "Unknown User",
                profilePicture: userData.profilePicture,
                isAdmin: false,
              });
            }
          }

          setLoadingProgress(40);

          // Check if the current user is authorized
          const currentUser = auth.currentUser;
          if (currentUser && userMap.has(currentUser.uid)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }

          // Fetch admin users and update their status
          for (const ref of adminRefs) {
            const userDoc = await getDoc(ref);
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              const existingUser = userMap.get(userDoc.id);
              if (existingUser) {
                existingUser.isAdmin = true;
              } else {
                userMap.set(userDoc.id, {
                  id: userDoc.id,
                  displayName: userData.displayName || "Unknown User",
                  profilePicture: userData.profilePicture,
                  isAdmin: true,
                });
              }
            }
          }

          setLoadingProgress(50);

          // Update users state
          const combinedUsers = Array.from(userMap.values());
          setUsers(combinedUsers);

          // Fetch shelves using references from shelfList
          const shelfRefs = roomData.shelfList || [];

          if (shelfRefs.length === 0) {
            // Initialize shelves if shelfList is empty
            const newShelves = await initializeShelves(roomId);
            setShelves(newShelves);

            setLoadingProgress(60);

            // Optionally, set up listeners for newly created shelves
            newShelves.forEach((shelf) => {
              const shelfRef = doc(db, "Shelves", shelf.id);
              const unsubscribe = onSnapshot(shelfRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                  setShelves((prevShelves) =>
                    prevShelves.map((prevShelf) =>
                      prevShelf.id === docSnapshot.id
                        ? ({
                            ...prevShelf,
                            ...docSnapshot.data(),
                          } as ShelfData)
                        : prevShelf
                    )
                  );
                }
              });
              unsubscribeShelves.push(unsubscribe);
            });

            setLoadingProgress(75);
          } else {
            // Fetch existing shelves using their references
            const shelvesSnapshot = await Promise.all(shelfRefs.map((ref) => getDoc(ref)));

            setLoadingProgress(60);

            const shelvesData: ShelfData[] = shelvesSnapshot
              .filter((docSnap) => docSnap.exists())
              .map((docSnap) => ({
                // @ts-ignore
                id: docSnap.id,
                ...(docSnap.data() as ShelfData),
              }));

            setShelves(shelvesData);

            // Set up real-time listeners for each shelf
            shelfRefs.forEach((ref) => {
              const unsubscribe = onSnapshot(ref, (docSnapshot) => {
                if (docSnapshot.exists()) {
                  setShelves((prevShelves) =>
                    prevShelves.map((shelf) =>
                      shelf.id === docSnapshot.id
                        ? ({ ...shelf, ...docSnapshot.data() } as ShelfData)
                        : shelf
                    )
                  );
                }
              });
              unsubscribeShelves.push(unsubscribe);
            });

            setLoadingProgress(75);
          }

          // Set up listener on PlacedItems
          const placedItemsQuery = query(
            collection(db, "PlacedItems"),
            where("roomId", "==", roomId)
          );
          unsubscribePlacedItems = onSnapshot(placedItemsQuery, (snapshot) => {
            const placedItems = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as PlacedItemData)
            );

            setShelves((prevShelves) => {
              if (!prevShelves) return prevShelves;

              const shelvesMap = new Map<string, ShelfData>();
              for (const shelf of prevShelves) {
                shelvesMap.set(shelf.id, { ...shelf, placedItems: [] });
              }

              for (const item of placedItems) {
                const shelf = shelvesMap.get(item.shelfId);
                if (shelf && shelf.placedItems) {
                  shelf.placedItems.push(item);
                }
              }

              return Array.from(shelvesMap.values());
            });
          });

          setLoadingProgress(80);

          if (!currentUser) {
            console.error("No user logged in");
            return;
          }

          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (!userDoc.exists()) {
            console.error("User document not found");
            return;
          }

          const userData = userDoc.data();
          const inventoryRefs: DocumentReference[] = userData.inventory || [];

          setLoadingProgress(90);

          if (inventoryRefs.length === 0) {
            setAvailableItems([]);
          } else {
            const purchasedItemDocs = await Promise.all(inventoryRefs.map((ref) => getDoc(ref)));
            const itemsList: ItemData[] = purchasedItemDocs
              .filter((docSnap) => docSnap.exists())
              .map((docSnap) => {
                const purchasedItemData = docSnap.data() as PurchasedItem;
                return {
                  itemId: purchasedItemData.itemId,
                  name: purchasedItemData.name,
                  imageUri: purchasedItemData.imageUri,
                  cost: purchasedItemData.cost,
                  shouldLock: purchasedItemData.shouldLock || false,
                };
              });

            setAvailableItems(itemsList);

            await preloadImages(itemsList);

            setLoadingProgress(99);
          }

          await new Promise((resolve) => setTimeout(resolve, 500));

          setRoomInfo({
            name: roomData.name,
            description: roomData.description || "",
            users: combinedUsers,
          });
        } else {
          console.error("Room not found");
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();

    // Cleanup listeners on unmount or when roomId changes
    return () => {
      unsubscribeShelves.forEach((unsub) => unsub());
      if (unsubscribePlacedItems) unsubscribePlacedItems();
    };
  }, [roomId]);

  const handleItemSelect = async (item: ItemData) => {
    if (selectedSpot) {
      const { shelfId, position } = selectedSpot;

      const ItemComponent = items[item.itemId];
      let initialItemData = {};
      if (ItemComponent && ItemComponent.getInitialData) {
        initialItemData = ItemComponent.getInitialData();
      }

      console.log(item.itemId);

      const newPlacedItem: Omit<PlacedItemData, "id"> = {
        roomId,
        shelfId,
        itemId: item.itemId,
        position,
        createdAt: new Date(),
        updatedAt: new Date(),
        shouldLock: item.shouldLock || false,
        itemData: {
          ...initialItemData,
          name: item.name,
          imageUri: item.imageUri,
        },
      };

      const docRef = await addDoc(collection(db, "PlacedItems"), newPlacedItem);

      // Update the shelf's itemList in Firestore
      await updateDoc(doc(db, "Shelves", shelfId), {
        itemList: arrayUnion(docRef),
        updatedAt: new Date(),
      });

      // Close the item selection sheet
      setIsSheetOpen(false);
      setSelectedSpot(null);
    }
  };

  const handleItemRemove = async (shelfId: string, position: number) => {
    const shelf = shelves.find((shelf) => shelf.id === shelfId);
    if (!shelf) return;

    const itemToRemove = shelf.placedItems?.find((item) => item.position === position);
    if (itemToRemove) {
      await deleteDoc(doc(db, "PlacedItems", itemToRemove.id));

      // Update the shelf's itemList in Firestore
      await updateDoc(doc(db, "Shelves", shelfId), {
        itemList: arrayRemove(doc(db, "PlacedItems", itemToRemove.id)),
        updatedAt: new Date(),
      });
    }
  };

  const handleItemDataUpdate = async (
    shelfId: string,
    position: number,
    newItemData: Record<string, any>
  ) => {
    const shelfIndex = shelves.findIndex((shelf) => shelf.id === shelfId);
    if (shelfIndex === -1) return;

    const shelf = shelves[shelfIndex];
    const placedItem = shelf.placedItems?.find((item) => item.position === position);
    if (placedItem) {
      const updatedShelves = [...shelves];
      const updatedPlacedItem = {
        ...placedItem,
        itemData: { ...placedItem.itemData, ...newItemData },
        updatedAt: new Date(),
      };
      updatedShelves[shelfIndex].placedItems = updatedShelves[shelfIndex].placedItems?.map((item) =>
        item.id === placedItem.id ? updatedPlacedItem : item
      );

      await updateDoc(doc(db, "PlacedItems", placedItem.id), {
        itemData: updatedPlacedItem.itemData,
        updatedAt: new Date(),
      });

      setShelves(updatedShelves);
    }
  };

  const handleLongPress = () => {
    setIsEditMode(true);
  };

  const disableEditMode = () => {
    setIsEditMode(false);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" backgroundColor={BACKGROUND_COLOR}>
        <Card
          elevate
          size="$4"
          bordered
          animation="bouncy"
          scale={0.9}
          hoverStyle={{ scale: 0.925 }}
          pressStyle={{ scale: 0.875 }}
          backgroundColor={BACKGROUND_COLOR}
        >
          <Card.Header padded jc="center" ai="center">
            <H4 color={HEADER_BACKGROUND}>Entering Room</H4>
          </Card.Header>
          <Card.Footer padded>
            <YStack gap="$4" alignItems="center">
              <XStack gap="$4" alignItems="center">
                <Spinner size="large" color={HEADER_BACKGROUND} />
              </XStack>
              <Text fontSize="$4" color={HEADER_BACKGROUND} textAlign="center">
                Please wait while we prepare your room...
              </Text>
              <Progress value={loadingProgress} width={250} backgroundColor="white">
                <Progress.Indicator animation="bouncy" backgroundColor={HEADER_BACKGROUND} />
              </Progress>
              <Text fontSize="$3" color={HEADER_BACKGROUND}>
                {Math.round(loadingProgress)}% Complete
              </Text>
            </YStack>
          </Card.Footer>
        </Card>
      </YStack>
    );
  }

  if (isAuthorized === false) {
    return (
      <SafeAreaWrapper>
        <YStack f={1} ai="center" jc="center" backgroundColor={BACKGROUND_COLOR}>
          <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            backgroundColor={BACKGROUND_COLOR}
          >
            <Card.Header padded jc="center" ai="center">
              <H4 color={HEADER_BACKGROUND}>Unauthorized Access</H4>
            </Card.Header>
            <Card.Footer padded>
              <YStack gap="$4" alignItems="center">
                <Feather name="lock" size={48} color={HEADER_BACKGROUND} />
                <Text fontSize="$4" color={HEADER_BACKGROUND} textAlign="center">
                  You have not been invited to the room:
                </Text>
                <Text fontSize="$5" fontWeight="bold" color={HEADER_BACKGROUND} textAlign="center">
                  {roomName}
                </Text>
                <Button
                  onPress={() => router.push("/(tabs)")}
                  backgroundColor={HEADER_BACKGROUND}
                  color="white"
                >
                  Go Back Home
                </Button>
              </YStack>
            </Card.Footer>
          </Card>
        </YStack>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
        <Header>
          <HeaderButton unstyled onPress={handleGoBack}>
            <ArrowLeft color="white" size={24} />
          </HeaderButton>
          <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center" color="white">
            {roomName}
          </Text>
          {isEditMode ? (
            <HeaderButton unstyled onPress={disableEditMode}>
              <X color="white" size={24} />
            </HeaderButton>
          ) : (
            <HeaderButton unstyled onPress={() => setIsSettingsOpen(true)}>
              <Feather name="menu" color="white" size={24} />
            </HeaderButton>
          )}
        </Header>
        <Content>
          <ScrollView scrollEventThrottle={16}>
            <Pressable onLongPress={handleLongPress} delayLongPress={500}>
              <YStack backgroundColor={BACKGROUND_COLOR} padding="$4" gap="$6">
                {shelves.map((shelf, index) => (
                  <Shelf
                    key={shelf.id}
                    shelfNumber={index + 1}
                    items={[0, 1, 2].map((position) => {
                      const placedItem = shelf.placedItems?.find(
                        (item) => item.position === position
                      );
                      return placedItem || null;
                    })}
                    showPlusSigns={isEditMode}
                    onSpotPress={(position) => {
                      setSelectedSpot({ shelfId: shelf.id, position });
                      setIsSheetOpen(true);
                    }}
                    onItemRemove={(position) => handleItemRemove(shelf.id, position)}
                    onItemDataUpdate={(position, newItemData) =>
                      handleItemDataUpdate(shelf.id, position, newItemData)
                    }
                    users={users}
                    roomInfo={roomInfo}
                  />
                ))}
              </YStack>
            </Pressable>
          </ScrollView>
        </Content>
        <ItemSelectionSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSelectItem={handleItemSelect}
          items={availableItems}
        />
        <RoomSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          users={users}
          roomDescription={roomDescription}
        />
      </Container>
    </SafeAreaWrapper>
  );
};

export default RoomScreen;
