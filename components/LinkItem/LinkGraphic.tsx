// import { router } from 'expo-router';
import React from 'react';
// import { Pressable } from 'react-native';
import { Image, View, Text } from 'tamagui';

interface LinkGraphicProps {
    linkName: string;
}

const LinkGraphic: React.FC<LinkGraphicProps> = ({ linkName }) => {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text
                style={{
                    fontSize: 20,
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(139, 69, 19, 1)',
                    padding: 9,
                    width: 100,
                }}
            >
                {linkName}
            </Text>
        </View>
    );
};

export default LinkGraphic;