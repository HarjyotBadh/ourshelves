import React, { useState } from 'react';
import { YStack, Text, Image, Button } from 'tamagui';

interface DogProps {
    itemData: {
        name: string;
        imageUri: string;
    };
    onDataUpdate: (newItemData: Record<string, any>) => void;
}

interface DogComponent extends React.FC<DogProps> {
    getInitialData: () => { name: string; imageUri: string };
}

const Dog: DogComponent = ({ itemData }) => {
    const [isBarking, setIsBarking] = useState(false);

    const handlePress = () => {
        setIsBarking(true);
        setTimeout(() => setIsBarking(false), 1000); // Reset after 1 second
    };

    return (
        <Button
            unstyled
            onPress={handlePress}
            width="100%"
            height="100%"
            padding={0}
        >
            <YStack width="100%" height="100%" alignItems="center" justifyContent="center">
                <Image
                    source={{ uri: itemData.imageUri }}
                    width="80%"
                    height="80%"
                />
                {isBarking && (
                    <Text
                        fontSize={16}
                        fontWeight="bold"
                        color="$blue10"
                        position="absolute"
                        top={0}
                        right={0}
                    >
                        Woof!
                    </Text>
                )}
            </YStack>
        </Button>
    );
};

Dog.getInitialData = () => ({
    name: "Default Dog",
    imageUri: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg" // Replace with a default dog image URL
});

export default Dog;