import React, { useState, useEffect } from 'react';
import { YStack, Button, Input, Sheet, XStack, Text, ScrollView, Image } from 'tamagui';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { StorybookItemData, StorybookItemProps, StorybookItemComponent } from '../../models/StorybookModel';
import { StorybookView, PageContainer, PageContent } from '../../styles/StorybookStyles';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

// Add a default image URI
const DEFAULT_IMAGE_URI = "";

const StorybookItem: StorybookItemComponent = ({
    itemData,
    onDataUpdate,
    isActive,
    onClose,
}) => {
    const [imageUri, setImageUri] = useState(itemData.imageUri || "");
    const [open, setOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState(itemData.pages || [{ text: '' }]);

    useEffect(() => {
        setOpen(isActive);
        setImageUri(itemData.imageUri || "");
    }, [isActive, itemData]);
    

    const handleClose = () => {
        setOpen(false);
        onClose();
    };

    const handleSave = () => {
        onDataUpdate({ ...itemData, pages });
        handleClose();
    };

    const addPage = () => {
        setPages([...pages, { text: '' }]);
        setCurrentPage(pages.length);
    };

    const updatePageText = (text: string) => {
        const newPages = [...pages];
        newPages[currentPage].text = text;
        setPages(newPages);
    };

    const flipToNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const flipToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const pageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateY: withTiming(`${currentPage * 180}deg`, {
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                    }),
                },
            ],
        };
    });

    return (
        <YStack flex={1}>
            <StorybookView>
                {!isActive ? (
                    // Render the default image when not active
                    <Image 
                        source={{ uri: imageUri || DEFAULT_IMAGE_URI }} 
                        style={{ width: 100, height: 100 }}
                    />
                ) : (
                    <Animated.View style={pageStyle}>
                        <PageContainer>
                            <PageContent>
                                <Image 
                                    source={{ uri: imageUri }} 
                                    style={{ width: '100%', height: 200 }} 
                                />
                                <Text>{pages[currentPage]?.text || 'Empty page'}</Text>
                            </PageContent>
                        </PageContainer>
                    </Animated.View>
                )}
            </StorybookView>
            <Sheet
                modal
                open={open}
                onOpenChange={setOpen}
                snapPoints={[80]}
                position={0}
                dismissOnSnapToBottom
            >
                <Sheet.Overlay />
                <Sheet.Frame padding="$4" justifyContent="space-between">
                    <Sheet.Handle />
                    <ScrollView>
                        <YStack space="$4">
                            <Input
                                value={pages[currentPage]?.text || ''}
                                onChangeText={updatePageText}
                                placeholder="Enter your text here"
                                multiline
                                numberOfLines={10}
                            />
                            <XStack space="$2" justifyContent="space-between">
                                <Button onPress={addPage} theme="green">Add Page</Button>
                                <Button onPress={handleClose} theme="red">Cancel</Button>
                                <Button onPress={handleSave} theme="blue">Save</Button>
                            </XStack>
                            <XStack justifyContent="space-between" padding="$2">
                                <Button onPress={flipToPreviousPage} disabled={currentPage === 0}>Previous</Button>
                                <Button onPress={flipToNextPage} disabled={currentPage === pages.length - 1}>Next</Button>
                            </XStack>
                        </YStack>
                    </ScrollView>
                </Sheet.Frame>
            </Sheet>
        </YStack>
    );
};

StorybookItem.getInitialData = () => ({
    pages: [{ text: '', pageNumber: 0 }],
});

export default StorybookItem;