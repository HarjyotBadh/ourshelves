import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { YStack, View, styled, XStack, Text, Button } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons';
import Shelf from '../../components/Shelf';
import {router} from "expo-router";

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
    const shelves = Array(10).fill(null);

    const handleGoBack = () => {
        router.push('(tabs)');
    };

    return (
        <SafeAreaWrapper>
            <Container>
                <Header>
                    <HeaderButton
                        unstyled
                        onPress={handleGoBack}
                    >
                        <ArrowLeft color="black" size={24}/>
                    </HeaderButton>
                    <Text fontSize={18} fontWeight="bold" flex={1} textAlign="center">
                        Room Name
                    </Text>
                    <HeaderButton unstyled />
                </Header>
                <Content>
                    <ScrollView scrollEventThrottle={16}>
                        <YStack backgroundColor={BACKGROUND_COLOR} padding="$4" gap="$6">
                            {shelves.map((_, index) => (
                                <Shelf key={index} shelfNumber={index + 1} />
                            ))}
                        </YStack>
                    </ScrollView>
                </Content>
            </Container>
        </SafeAreaWrapper>
    );
};

export default RoomScreen;
