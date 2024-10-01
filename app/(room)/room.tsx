import React, { useEffect, useState } from 'react';
import { SafeAreaView, Pressable } from 'react-native';
import { YStack, View, styled, XStack, Text, Button, ScrollView, Image, Progress, Spinner } from 'tamagui';
import { ArrowLeft, X } from '@tamagui/lucide-icons';
import Feather from '@expo/vector-icons/Feather';
import Shelf from '../../components/Shelf';
import { useRouter, useLocalSearchParams } from "expo-router";
import ItemSelectionSheet from '../../components/ItemSelectionSheet';
import RoomSettingsDialog from '../../components/RoomSettingsDialog';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    writeBatch,
    updateDoc,
    DocumentReference,
    DocumentData,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import { auth, db } from "firebaseConfig";
import { PlacedItemData, ItemData } from "../../models/PlacedItemData";
import { ShelfData } from "../../models/ShelfData";
import items from "../../components/items";

const BACKGROUND_COLOR = '$yellow2Light';
const HEADER_BACKGROUND = '#8B4513';

const Container = styled(YStack, {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
});

const Content = styled(View, {
    flex: 1,
});

const Header = styled(XStack, {
    height: 60,
    backgroundColor: HEADER_BACKGROUND,
    alignItems: 'center',
    paddingHorizontal: '$4',
});

const SafeAreaWrapper = styled(SafeAreaView, {
    flex: 1,
    backgroundColor: HEADER_BACKGROUND,
});

const HeaderButton = styled(Button, {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
});

const LoadingContainer = styled(YStack, {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    padding: 20,
});

interface UserData {
    displayName: string;
    profilePicture?: string;
}

interface RoomData extends DocumentData {
    name: string;
    users: DocumentReference[];
    admins: DocumentReference[];
    shelfList?: DocumentReference[];
}

const RoomScreen = () => {
    const router = useRouter();
    const { roomId } = useLocalSearchParams<{ roomId: string }>();
    const [roomName, setRoomName] = useState<string>('');
    const [shelves, setShelves] = useState<ShelfData[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedSpot, setSelectedSpot] = useState<{ shelfId: string, position: number } | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [availableItems, setAvailableItems] = useState<ItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [users, setUsers] = useState<{ id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[]>([]);

    const initializeShelves = async (roomId: string) => {
        const batch = writeBatch(db);
        const newShelves: ShelfData[] = [];
        const shelfRefs: DocumentReference[] = [];

        for (let i = 0; i < 10; i++) {
            const newShelfRef = doc(collection(db, 'Shelves'));
            const newShelfData: ShelfData = {
                id: newShelfRef.id,
                roomId,
                position: i,
                name: `Shelf ${i + 1}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                itemList: []
            };
            batch.set(newShelfRef, newShelfData);
            newShelves.push(newShelfData);
            shelfRefs.push(newShelfRef);
        }

        const roomRef = doc(db, 'Rooms', roomId);
        batch.update(roomRef, { shelfList: shelfRefs });

        await batch.commit();
        return newShelves;
    };

    const preloadImages = async (items: ItemData[]) => {
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

    useEffect(() => {
        if (!roomId) return;

        setIsLoading(true);
        setLoadingProgress(0);

        let unsubscribeShelves: () => void;
        let unsubscribePlacedItems: () => void;

        const roomRef = doc(db, 'Rooms', roomId);

        const fetchRoomData = async () => {
            try {
                const roomDoc = await getDoc(roomRef);
                if (roomDoc.exists()) {
                    const roomData = roomDoc.data() as RoomData;
                    setRoomName(roomData.name);

                    const userRefs = roomData.users || [];
                    const adminRefs = roomData.admins || [];

                    const userMap = new Map();

                    for (const ref of userRefs) {
                        const userDoc = await getDoc(ref);
                        if (userDoc.exists()) {
                            const userData = userDoc.data() as UserData;
                            userMap.set(userDoc.id, {
                                id: userDoc.id,
                                displayName: userData.displayName || 'Unknown User',
                                profilePicture: userData.profilePicture,
                                isAdmin: false
                            });
                        }
                    }

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
                                    displayName: userData.displayName || 'Unknown User',
                                    profilePicture: userData.profilePicture,
                                    isAdmin: true
                                });
                            }
                        }
                    }

                    const combinedUsers = Array.from(userMap.values());
                    setUsers(combinedUsers);

                    // Initialize shelves if they don't exist
                    const shelvesQuery = query(collection(db, 'Shelves'), where('roomId', '==', roomId));
                    const shelvesSnapshot = await getDocs(shelvesQuery);
                    if (shelvesSnapshot.empty) {
                        await initializeShelves(roomId);
                    }

                    // Set up listener on shelves
                    unsubscribeShelves = onSnapshot(shelvesQuery, (shelvesSnapshot) => {
                        const shelvesData: ShelfData[] = shelvesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShelfData));

                        // Update shelves with existing placedItems
                        setShelves(prevShelves => {
                            const placedItemsMap = new Map<string, PlacedItemData[]>();
                            if (prevShelves) {
                                for (const shelf of prevShelves) {
                                    if (shelf.placedItems) {
                                        placedItemsMap.set(shelf.id, shelf.placedItems);
                                    }
                                }
                            }

                            const updatedShelves = shelvesData.map(shelf => ({
                                ...shelf,
                                placedItems: placedItemsMap.get(shelf.id) || []
                            }));

                            return updatedShelves;
                        });
                    });

                    // Set up listener on PlacedItems
                    const placedItemsQuery = query(collection(db, 'PlacedItems'), where('roomId', '==', roomId));
                    unsubscribePlacedItems = onSnapshot(placedItemsQuery, (snapshot) => {
                        const placedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlacedItemData));

                        setShelves(prevShelves => {
                            if (!prevShelves) return prevShelves;

                            const shelvesMap = new Map<string, ShelfData>();
                            for (const shelf of prevShelves) {
                                shelvesMap.set(shelf.id, { ...shelf, placedItems: [] });
                            }

                            for (const item of placedItems) {
                                const shelf = shelvesMap.get(item.shelfId);
                                if (shelf) {
                                    if (!shelf.placedItems) {
                                        shelf.placedItems = [];
                                    }
                                    shelf.placedItems.push(item);
                                }
                            }

                            return Array.from(shelvesMap.values());
                        });
                    });

                    // Fetch user inventory
                    const user = auth.currentUser;
                    if (!user) {
                        console.error('No user logged in');
                        return;
                    }

                    const userDoc = await getDoc(doc(db, 'Users', user.uid));
                    if (!userDoc.exists()) {
                        console.error('User document not found');
                        return;
                    }

                    const userData = userDoc.data();
                    const inventoryRefs = userData.inventory || [];

                    if (inventoryRefs.length === 0) {
                        setAvailableItems([]);
                    } else {
                        const itemDocs = await Promise.all(inventoryRefs.map(ref => getDoc(ref)));
                        const itemsList = itemDocs
                            .filter(doc => doc.exists())
                            .map(doc => ({
                                itemId: doc.id,
                                ...doc.data()
                            } as ItemData));

                        setAvailableItems(itemsList);

                        await preloadImages(itemsList);
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    console.error('Room not found');
                }
            } catch (error) {
                console.error('Error fetching room data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();

        return () => {
            if (unsubscribeShelves) unsubscribeShelves();
            if (unsubscribePlacedItems) unsubscribePlacedItems();
        };
    }, [roomId]);

    const handleItemSelect = async (item: ItemData) => {
        if (selectedSpot) {
            const { shelfId, position } = selectedSpot;
            const shelfIndex = shelves.findIndex(shelf => shelf.id === shelfId);
            if (shelfIndex === -1) return;

            const ItemComponent = items[item.itemId];
            let initialItemData = {};
            if (ItemComponent && ItemComponent.getInitialData) {
                initialItemData = ItemComponent.getInitialData();
            }

            const newPlacedItem: Omit<PlacedItemData, 'id'> = {
                roomId,
                shelfId,
                itemId: item.itemId,
                position,
                createdAt: new Date(),
                updatedAt: new Date(),
                shouldLock: item.shouldLock || false, // Transfer shouldLock
                itemData: {
                    ...initialItemData,
                    name: item.name,
                    imageUri: item.imageUri
                }
            };

            const docRef = await addDoc(collection(db, 'PlacedItems'), newPlacedItem);
            const addedItem: PlacedItemData = { ...newPlacedItem, id: docRef.id };

            const updatedShelves = [...shelves];
            const shelf = updatedShelves[shelfIndex];
            shelf.itemList.push(docRef);
            shelf.placedItems = [...(shelf.placedItems || []), addedItem];

            await updateDoc(doc(db, 'Shelves', shelfId), {
                itemList: shelf.itemList,
                updatedAt: new Date()
            });

            setShelves(updatedShelves);
            setIsSheetOpen(false);
            setSelectedSpot(null);
        }
    };

    const handleItemRemove = async (shelfId: string, position: number) => {
        const shelfIndex = shelves.findIndex(shelf => shelf.id === shelfId);
        if (shelfIndex === -1) return;

        const shelf = shelves[shelfIndex];
        const itemToRemove = shelf.placedItems?.find(item => item.position === position);
        if (itemToRemove) {
            await deleteDoc(doc(db, 'PlacedItems', itemToRemove.id));

            const updatedShelves = [...shelves];
            const updatedShelf = updatedShelves[shelfIndex];
            updatedShelf.itemList = updatedShelf.itemList.filter(ref => ref.id !== itemToRemove.id);
            updatedShelf.placedItems = updatedShelf.placedItems?.filter(item => item.id !== itemToRemove.id);

            await updateDoc(doc(db, 'Shelves', shelfId), {
                itemList: updatedShelf.itemList,
                updatedAt: new Date()
            });

            setShelves(updatedShelves);
        }
    };

    const handleItemDataUpdate = async (shelfId: string, position: number, newItemData: Record<string, any>) => {
        const shelfIndex = shelves.findIndex(shelf => shelf.id === shelfId);
        if (shelfIndex === -1) return;

        const shelf = shelves[shelfIndex];
        const placedItem = shelf.placedItems?.find(item => item.position === position);
        if (placedItem) {
            const updatedShelves = [...shelves];
            const updatedPlacedItem = {
                ...placedItem,
                itemData: { ...placedItem.itemData, ...newItemData },
                updatedAt: new Date()
            };
            updatedShelves[shelfIndex].placedItems = updatedShelves[shelfIndex].placedItems?.map(item =>
                item.id === placedItem.id ? updatedPlacedItem : item
            );

            await updateDoc(doc(db, 'PlacedItems', placedItem.id), {
                itemData: updatedPlacedItem.itemData,
                updatedAt: new Date()
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
            router.push('/(tabs)');
        }
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <Spinner size="large" color="$blue10" />
                <Text fontSize={18} color="$blue10" marginTop={20} marginBottom={10}>
                    Room is loading...
                </Text>
                <Progress value={loadingProgress} width={200}>
                    <Progress.Indicator animation="bouncy" backgroundColor="$blue10" />
                </Progress>
            </LoadingContainer>
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
                    <Pressable onLongPress={handleLongPress} delayLongPress={500}>
                        <ScrollView scrollEventThrottle={16}>
                            <YStack backgroundColor={BACKGROUND_COLOR} padding="$4" gap="$6">
                                {shelves.map((shelf, index) => (
                                    <Shelf
                                        key={shelf.id}
                                        shelfNumber={index + 1}
                                        items={[0, 1, 2].map(position => {
                                            const placedItem = shelf.placedItems?.find(item => item.position === position);
                                            return placedItem || null;
                                        })}
                                        showPlusSigns={isEditMode}
                                        onSpotPress={(position) => {
                                            setSelectedSpot({ shelfId: shelf.id, position });
                                            setIsSheetOpen(true);
                                        }}
                                        onItemRemove={(position) => handleItemRemove(shelf.id, position)}
                                        onItemDataUpdate={(position, newItemData) => handleItemDataUpdate(shelf.id, position, newItemData)}
                                        users={users}
                                    />
                                ))}
                            </YStack>
                        </ScrollView>
                    </Pressable>
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
                />
            </Container>
        </SafeAreaWrapper>
    );
};

export default RoomScreen;