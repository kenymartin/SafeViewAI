import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, List, Divider, ActivityIndicator, Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { io } from 'socket.io-client';

type RootStackParamList = {
  Home: undefined;
  Remote: undefined;
  Preferences: undefined;
  DeviceSetup: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceSetup'>;

interface Device {
  id: string;
  name: string;
  ipAddress: string;
  lastConnected?: Date;
  status: 'available' | 'unavailable';
}

const DeviceSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [serverAddress, setServerAddress] = useState('http://localhost:3000');
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock for discovered devices - in a real app would come from network discovery
  const mockDevices: Device[] = [
    { id: '1', name: 'Living Room TV', ipAddress: '192.168.1.100', status: 'available' },
    { id: '2', name: 'Bedroom TV', ipAddress: '192.168.1.101', status: 'available' },
    { id: '3', name: 'Office TV', ipAddress: '192.168.1.102', status: 'unavailable' },
  ];

  useEffect(() => {
    // Load previously connected devices
    const loadSavedDevices = async () => {
      // In a real app, would load from AsyncStorage
      setDevices(mockDevices);
    };

    loadSavedDevices();
  }, []);

  const scanForDevices = () => {
    setScanning(true);
    // Simulate network scanning
    setTimeout(() => {
      setDevices(mockDevices);
      setScanning(false);
      setSnackbarMessage('Scan completed');
      setSnackbarVisible(true);
    }, 2000);
  };

  const connectToDevice = (device: Device) => {
    setConnecting(true);
    setSelectedDevice(device);

    // Attempt to connect to the device
    setTimeout(() => {
      try {
        // In a real app, would establish a WebSocket connection
        const socket = io(device.ipAddress);
        socket.on('connect', () => {
          // Store the connected device info
          setConnecting(false);
          setSnackbarMessage(`Connected to ${device.name}`);
          setSnackbarVisible(true);
          
          // Navigate back to the remote screen
          navigation.navigate('Remote');
        });

        socket.on('connect_error', () => {
          throw new Error('Connection failed');
        });
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnecting(false);
        Alert.alert(
          'Connection Failed',
          `Could not connect to ${device.name}. Please make sure the device is on and connected to the same network.`
        );
      }
    }, 1500);
  };

  const addManualDevice = () => {
    Alert.prompt(
      'Add Device Manually',
      'Enter the IP address of your device',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Add',
          onPress: (ipAddress?: string) => {
            if (ipAddress) {
              const newDevice: Device = {
                id: Date.now().toString(),
                name: `Device at ${ipAddress}`,
                ipAddress,
                status: 'available'
              };
              setDevices([...devices, newDevice]);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Connect to a Device</Title>
          <Paragraph style={styles.paragraph}>
            Connect to a SafeView AI enabled device on your network.
          </Paragraph>
          
          <TextInput
            label="Server Address"
            value={serverAddress}
            onChangeText={setServerAddress}
            style={styles.input}
            disabled={scanning || connecting}
          />
          
          <Button
            mode="contained"
            onPress={scanForDevices}
            loading={scanning}
            disabled={scanning || connecting}
            style={styles.button}
          >
            Scan for Devices
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Available Devices</Title>
          
          {scanning ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Paragraph style={styles.loadingText}>Scanning for devices...</Paragraph>
            </View>
          ) : devices.length === 0 ? (
            <Paragraph style={styles.emptyText}>
              No devices found. Try scanning again or add a device manually.
            </Paragraph>
          ) : (
            <List.Section>
              {devices.map(device => (
                <React.Fragment key={device.id}>
                  <List.Item
                    title={device.name}
                    description={device.ipAddress}
                    left={props => (
                      <List.Icon 
                        {...props} 
                        icon={device.status === 'available' ? 'television' : 'television-off'} 
                        color={device.status === 'available' ? '#2196f3' : '#999'}
                      />
                    )}
                    right={props => (
                      <Button
                        {...props}
                        mode="text"
                        onPress={() => connectToDevice(device)}
                        disabled={device.status === 'unavailable' || connecting}
                        loading={connecting && selectedDevice?.id === device.id}
                      >
                        Connect
                      </Button>
                    )}
                    disabled={device.status === 'unavailable'}
                  />
                  <Divider />
                </React.Fragment>
              ))}
            </List.Section>
          )}
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={addManualDevice}
            disabled={scanning || connecting}
            style={styles.manualButton}
          >
            Add Device Manually
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  paragraph: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  manualButton: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
  }
});

export default DeviceSetupScreen; 