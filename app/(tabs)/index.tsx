import { StyleSheet, ScrollView } from 'react-native'
import { Text, View } from 'tamagui'
import HomeTile from '../../components/HomeTile'
import CreateHomeTile from '../../components/CreateHomeTile'
import { FileX } from '@tamagui/lucide-icons'

const HomeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.homeContainer}>
      <HomeTile id="1234" isAdmin={true} />
      <HomeTile id="5678" />
      <HomeTile id="9012" />
      <HomeTile id="3456" />
      <HomeTile id="7890" />
      <HomeTile id="1234" />
      <HomeTile id="5678" />
      <HomeTile id="9012" />
      <HomeTile id="3456" />
      <CreateHomeTile />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  homeContainer: {
    backgroundColor: '#fff2cf',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  }
})

export default HomeScreen;
