import { ExternalLink } from '@tamagui/lucide-icons'
import { Anchor, H2, H4, Paragraph, XStack, YStack, SizableText, Image } from 'tamagui'
import { ToastControl } from 'app/CurrentToast'
import { ImageBackground } from 'react-native'

export default function TabTwoScreen() {
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
    </YStack>
  )
}
