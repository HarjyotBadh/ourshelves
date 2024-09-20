import React, { useEffect, useState } from 'react';
import { SafeAreaView, Pressable } from 'react-native';
import { YStack, View, styled, XStack, Text, Button, ScrollView } from 'tamagui';
import { ArrowLeft, X } from '@tamagui/lucide-icons';
import Feather from '@expo/vector-icons/Feather';
import Shelf from '../../components/Shelf';
import { router } from "expo-router";
import ItemSelectionSheet from '../../components/ItemSelectionSheet';
import { ItemData } from '../../components/item';
import RoomSettingsDialog from '../../components/RoomSettingsDialog';
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";

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

const RoomScreen = () => {
    const [shelves, setShelves] = useState<(ItemData | null)[][]>(Array(10).fill(null).map(() => [null, null, null]));
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedSpot, setSelectedSpot] = useState<{ shelfIndex: number, spotIndex: number } | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [items, setItems] = useState<ItemData[]>([]);

    useEffect(() => {
        const fetchItems = async () => {
            const itemsCollection = collection(db, 'Items');
            const itemsSnapshot = await getDocs(itemsCollection);
            const itemsList = itemsSnapshot.docs.map(doc => ({
                itemId: doc.id,
                ...doc.data()
            } as ItemData));
            setItems(itemsList);
        };

        fetchItems();
    }, []);

    const handleLongPress = () => {
        setIsEditMode(true);
    };

    const disableEditMode = () => {
        setIsEditMode(false);
    };

    const handleItemSelect = (item: ItemData) => {
        if (selectedSpot) {
            const { shelfIndex, spotIndex } = selectedSpot;
            const newShelves = [...shelves];
            newShelves[shelfIndex][spotIndex] = item;
            setShelves(newShelves);
            setIsSheetOpen(false);
            setSelectedSpot(null);
        }
    };

    const handleItemRemove = (shelfIndex: number, spotIndex: number) => {
        const newShelves = [...shelves];
        newShelves[shelfIndex][spotIndex] = null;
        setShelves(newShelves);
    };

    const handleGoBack = () => {
        router.push('(tabs)');
    };

    return (
        <SafeAreaWrapper>
            <Container>
                <Header>
                    <HeaderButton unstyled onPress={handleGoBack}>
                        <ArrowLeft color="white" size={24}/>
                    </HeaderButton>
                    <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center" color="white">
                        Room Name
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
                                {shelves.map((shelfItems, index) => (
                                    <Shelf
                                        key={index}
                                        shelfNumber={index + 1}
                                        items={shelfItems}
                                        showPlusSigns={isEditMode}
                                        onSpotPress={(spotIndex) => {
                                            setSelectedSpot({ shelfIndex: index, spotIndex });
                                            setIsSheetOpen(true);
                                        }}
                                        onItemRemove={handleItemRemove}
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
                    items={items}
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