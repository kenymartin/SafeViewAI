import React from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Remote: undefined;
  Preferences: undefined;
  DeviceSetup: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196f3" />
      
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/200' }} // Replace with actual logo
          style={styles.logo}
        />
        <Title style={styles.title}>SafeView AI</Title>
        <Paragraph style={styles.subtitle}>
          Remote Control App
        </Paragraph>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome</Title>
          <Paragraph>
            Control your SafeView AI enabled devices and customize your content filtering preferences.
          </Paragraph>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Remote')}
            style={styles.button}
          >
            Remote Control
          </Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Settings</Title>
          <Paragraph>
            Set up your preferences or connect to a new device.
          </Paragraph>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Preferences')}
            style={styles.button}
          >
            Preferences
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('DeviceSetup')}
            style={styles.button}
          >
            Connect Device
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 8,
  },
  button: {
    margin: 4,
  }
});

export default HomeScreen; 