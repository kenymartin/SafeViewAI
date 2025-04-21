import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, IconButton, Divider, Chip, ProgressBar, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { io, Socket } from 'socket.io-client';
import { ContentType } from '@safeview/shared/types/content';

type RootStackParamList = {
  Home: undefined;
  Remote: undefined;
  Preferences: undefined;
  DeviceSetup: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Remote'>;

const RemoteScreen: React.FC<Props> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [flagDialogVisible, setFlagDialogVisible] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [serverAddress, setServerAddress] = useState('http://localhost:3000');
  const [isConnected, setIsConnected] = useState(false);
  const [videoTitle, setVideoTitle] = useState('Sample Video');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Connect to WebSocket server
  useEffect(() => {
    const newSocket = io(serverAddress);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    newSocket.on('playback-update', (data) => {
      setIsPlaying(data.isPlaying);
      setCurrentTime(data.currentTime);
      setDuration(data.duration);
      setVolume(data.volume * 100);
      setVideoTitle(data.title);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [serverAddress]);

  const handlePlayPause = () => {
    if (socket) {
      socket.emit('remote-command', { command: isPlaying ? 'pause' : 'play' });
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds: number) => {
    if (socket) {
      socket.emit('remote-command', { 
        command: 'seek', 
        value: Math.max(0, Math.min(currentTime + seconds, duration)) 
      });
    }
  };

  const handleVolumeChange = (change: number) => {
    const newVolume = Math.max(0, Math.min(volume + change, 100));
    if (socket) {
      socket.emit('remote-command', { 
        command: 'volume', 
        value: newVolume / 100 
      });
    }
    setVolume(newVolume);
  };

  const handleMute = () => {
    if (socket) {
      socket.emit('remote-command', { command: 'mute' });
    }
  };

  const showFlagDialog = () => {
    setFlagDialogVisible(true);
  };

  const hideFlagDialog = () => {
    setFlagDialogVisible(false);
    setSelectedContentType(null);
  };

  const handleFlagContent = () => {
    if (socket && selectedContentType) {
      socket.emit('flag-content', {
        timestamp: currentTime,
        type: selectedContentType
      });
      
      Alert.alert(
        'Content Flagged',
        `Content at ${formatTime(currentTime)} has been flagged as ${selectedContentType}.`
      );
      
      hideFlagDialog();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getProgressPercentage = () => {
    if (duration > 0) {
      return currentTime / duration;
    }
    return 0;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusContainer}>
            <Title>{videoTitle}</Title>
            <Chip 
              icon={isConnected ? "wifi" : "wifi-off"}
              mode="outlined" 
              selected={isConnected}
              style={styles.statusChip}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Chip>
          </View>
          
          <Paragraph style={styles.timeInfo}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Paragraph>
          
          <ProgressBar 
            progress={getProgressPercentage()} 
            color="#2196f3" 
            style={styles.progressBar} 
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Playback Control</Title>
          <View style={styles.controlsRow}>
            <IconButton
              icon="rewind-10"
              size={30}
              onPress={() => handleSeek(-10)}
            />
            <IconButton
              icon={isPlaying ? "pause" : "play"}
              size={40}
              style={styles.playButton}
              onPress={handlePlayPause}
            />
            <IconButton
              icon="fast-forward-10"
              size={30}
              onPress={() => handleSeek(10)}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <Title>Volume</Title>
          <View style={styles.controlsRow}>
            <IconButton
              icon="volume-minus"
              size={30}
              onPress={() => handleVolumeChange(-5)}
            />
            <Paragraph style={styles.volumeText}>{volume}%</Paragraph>
            <IconButton
              icon="volume-plus"
              size={30}
              onPress={() => handleVolumeChange(5)}
            />
            <IconButton
              icon="volume-mute"
              size={30}
              onPress={handleMute}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Content Filtering</Title>
          <Paragraph style={styles.paragraph}>
            Flag inappropriate content that you want filtered in the future.
          </Paragraph>
          <Button 
            mode="contained" 
            icon="flag" 
            onPress={showFlagDialog}
            style={styles.flagButton}
          >
            Flag Current Content
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={flagDialogVisible} onDismiss={hideFlagDialog}>
          <Dialog.Title>Flag Inappropriate Content</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Flag content at {formatTime(currentTime)} as:
            </Text>
            <View style={styles.contentTypeContainer}>
              <Chip 
                mode="outlined" 
                selected={selectedContentType === 'violence'} 
                onPress={() => setSelectedContentType('violence')}
                style={styles.contentTypeChip}
              >
                Violence
              </Chip>
              <Chip 
                mode="outlined" 
                selected={selectedContentType === 'nudity'} 
                onPress={() => setSelectedContentType('nudity')}
                style={styles.contentTypeChip}
              >
                Nudity
              </Chip>
              <Chip 
                mode="outlined" 
                selected={selectedContentType === 'profanity'} 
                onPress={() => setSelectedContentType('profanity')}
                style={styles.contentTypeChip}
              >
                Profanity
              </Chip>
              <Chip 
                mode="outlined" 
                selected={selectedContentType === 'gore'} 
                onPress={() => setSelectedContentType('gore')}
                style={styles.contentTypeChip}
              >
                Gore
              </Chip>
              <Chip 
                mode="outlined" 
                selected={selectedContentType === 'drugs'} 
                onPress={() => setSelectedContentType('drugs')}
                style={styles.contentTypeChip}
              >
                Drugs
              </Chip>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideFlagDialog}>Cancel</Button>
            <Button 
              onPress={handleFlagContent} 
              disabled={!selectedContentType}
            >
              Flag
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 30,
  },
  timeInfo: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  playButton: {
    marginHorizontal: 16,
  },
  divider: {
    marginVertical: 16,
  },
  volumeText: {
    width: 50,
    textAlign: 'center',
  },
  paragraph: {
    marginBottom: 16,
  },
  flagButton: {
    marginTop: 8,
  },
  dialogText: {
    marginBottom: 16,
  },
  contentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  contentTypeChip: {
    margin: 4,
  }
});

export default RemoteScreen; 