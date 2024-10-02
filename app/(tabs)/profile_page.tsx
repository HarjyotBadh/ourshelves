import {Text, H2, H4, Paragraph, XStack, YStack, SizableText, Image, Button} from 'tamagui'
import {auth} from 'firebaseConfig'

export default function TabTwoScreen() {

    const signOut = async () => {
        try {
            await auth.signOut();
            // User should be auto rerouted to login screen by the onAuthStateChanged listener in root _layout.tsx
        } catch (err) {
            console.error("Failed to sign out:", err);
        }
    }
  return (
    <YStack f={1} ai="center" gap="$4" px="$10" pt="$5">
        <H2>User Profile</H2>
        <Image
            // Eventually make this a set number of predefined icons
            source={{ width: 100, height: 100, uri: '' }}
            width="50%"
            height="20%"
        />

        <H4>About Me:</H4>
        <Paragraph fos="$5" ta="center">
        Hello! My name is Luke Lawson and this is dummy text. I'm attempting to write 
        an about me seciton of the codebase. Hopefully this works out!
        </Paragraph>

        <XStack gap="$2" px="$2" pt="$5">
        <H4>Number Rooms I'm In:</H4>
        <SizableText theme="alt2" size="$8" fontWeight="800">1</SizableText>
        </XStack>

        <Button width="100%" onPress={signOut}>
            <Text> Sign out </Text>
        </Button>
    </YStack>
  )
}
