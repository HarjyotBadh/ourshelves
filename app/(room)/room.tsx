import React, { useEffect, useState } from 'react';
import { SafeAreaView, Pressable } from 'react-native';
import {YStack, View, styled, XStack, Text, Button, ScrollView, Image, Progress, Spinner} from 'tamagui';
import { ArrowLeft, X } from '@tamagui/lucide-icons';
import Feather from '@expo/vector-icons/Feather';
import Shelf from '../../components/Shelf';
import {router, useLocalSearchParams} from "expo-router";
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
    DocumentReference, updateDoc
} from "firebase/firestore";
import { db } from "firebaseConfig";
import {PlacedItemData, ItemData } from "../../models/PlacedItemData";
import {ShelfData} from "../../models/ShelfData";
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

const RoomScreen = () => {
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


    const initializeShelves = async (roomId: string) => {
        const batch = writeBatch(db);
        const newShelves: ShelfData[] = [];
        const shelfRefs: DocumentReference[] = [];

        for (let i = 0; i < 10; i++) {
            console.log("Creating shelf #", i + 1);
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

        // Update the room document with the new shelf references
        const roomRef = doc(db, 'Rooms', roomId);
        batch.update(roomRef, { shelfList: shelfRefs });

        await batch.commit();
        console.log("All shelves created and room updated...");
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
        const fetchRoomData = async () => {
            if (!roomId) return;

            setIsLoading(true);
            setLoadingProgress(0);

            try {
                // Fetch room data
                const roomDoc = await getDoc(doc(db, 'Rooms', roomId));
                if (roomDoc.exists()) {
                    const roomData = roomDoc.data();
                    setRoomName(roomData.name);

                    let shelvesData: ShelfData[];
                    if (roomData.shelfList && roomData.shelfList.length > 0) {
                        const shelfDocs = await Promise.all(roomData.shelfList.map((shelfRef: DocumentReference) => getDoc(shelfRef)));
                        shelvesData = shelfDocs.map(doc => ({ ...doc.data(), id: doc.id } as ShelfData));
                    } else {
                        shelvesData = await initializeShelves(roomId);
                    }

                    console.log("# of shelves: " + shelvesData.length);

                    const placedItemRefs = shelvesData.flatMap(shelf => shelf.itemList);
                    const placedItemDocs = await Promise.all(placedItemRefs.map(ref => getDoc(ref)));
                    const placedItems = placedItemDocs.map(doc => ({ id: doc.id, ...doc.data() } as PlacedItemData));

                    const updatedShelvesData = shelvesData.map(shelf => ({
                        ...shelf,
                        placedItems: placedItems.filter(item => item.shelfId === shelf.id)
                    }));

                    setShelves(updatedShelvesData);

                    // Fetch available items
                    const itemsCollection = collection(db, 'Items');
                    const itemsSnapshot = await getDocs(itemsCollection);
                    const itemsList = itemsSnapshot.docs.map(doc => ({
                        itemId: doc.id,
                        ...doc.data()
                    } as ItemData));

                    // Preload images
                    await preloadImages(itemsList);

                    setAvailableItems(itemsList);

                    // Add a one-second delay
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
    }, [roomId]);

    const handleItemSelect = async (item: ItemData) => {
        if (selectedSpot) {
            const { shelfId, position } = selectedSpot;
            const shelfIndex = shelves.findIndex(shelf => shelf.id === shelfId);
            if (shelfIndex === -1) return;

            // Get the initial item data from the item's component
            const ItemComponent = items[item.itemId];
            let initialItemData = {};
            if (ItemComponent && ItemComponent.getInitialData) {
                initialItemData = ItemComponent.getInitialData();
            }

            // Add new placed item
            const newPlacedItem: Omit<PlacedItemData, 'id'> = {
                shelfId,
                itemId: item.itemId,
                position,
                createdAt: new Date(),
                updatedAt: new Date(),
                itemData: {
                    ...initialItemData,
                    name: item.name,
                    imageUri: item.imageUri
                }
            };

            // print the itemData
            console.log("itemData: ", newPlacedItem.itemData);
            const docRef = await addDoc(collection(db, 'PlacedItems'), newPlacedItem);
            const addedItem: PlacedItemData = { ...newPlacedItem, id: docRef.id };

            // Update shelf's itemList
            const updatedShelves = [...shelves];
            const shelf = updatedShelves[shelfIndex];
            shelf.itemList.push(docRef);
            shelf.placedItems = [...(shelf.placedItems || []), addedItem];

            // Update Firestore
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
            // Remove from Firestore
            await deleteDoc(doc(db, 'PlacedItems', itemToRemove.id));

            // Update shelf's itemList and placedItems
            const updatedShelves = [...shelves];
            const updatedShelf = updatedShelves[shelfIndex];
            updatedShelf.itemList = updatedShelf.itemList.filter(ref => ref.id !== itemToRemove.id);
            updatedShelf.placedItems = updatedShelf.placedItems?.filter(item => item.id !== itemToRemove.id);

            // Update Firestore
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
            // Update local state
            const updatedShelves = [...shelves];
            const updatedPlacedItem = {
                ...placedItem,
                itemData: { ...placedItem.itemData, ...newItemData },
                updatedAt: new Date()
            };
            updatedShelves[shelfIndex].placedItems = updatedShelves[shelfIndex].placedItems?.map(item =>
                item.id === placedItem.id ? updatedPlacedItem : item
            );

            // Update Firestore
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
        router.push('(tabs)');
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
                        <ArrowLeft color="white" size={24}/>
                    </HeaderButton>
                    <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center" color="white">
                        {roomName}
                    </Text>
                    {isEditMode ? (
                        <HeaderButton unstyled onPress={disableEditMode}>
                            <X color="white" size={24}/>
                        </HeaderButton>
                    ) : (
                        <HeaderButton unstyled onPress={() => setIsSettingsOpen(true)}>
                            <Feather name="menu" color="white" size={24}/>
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
                />
            </Container>
        </SafeAreaWrapper>
    );
};

export default RoomScreen;