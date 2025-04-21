import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Switch, Button, Paragraph, RadioButton, SegmentedButtons, Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { UserPreferences, FilterAction } from '@safeview/shared/types/content';

type RootStackParamList = {
  Home: undefined;
  Remote: undefined;
  Preferences: undefined;
  DeviceSetup: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Preferences'>;

const PreferencesScreen: React.FC<Props> = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    violence: true,
    nudity: true,
    profanity: true,
    gore: true,
    drugs: true,
    defaultAction: 'blur',
    sensitivity: 'medium'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [serverAddress, setServerAddress] = useState('http://localhost:3000');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverAddress}/api/preferences`);
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setSnackbarMessage('Failed to load preferences');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (name: keyof UserPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleDefaultActionChange = (value: FilterAction) => {
    setPreferences(prev => ({
      ...prev,
      defaultAction: value
    }));
  };

  const handleSensitivityChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      sensitivity: value as 'low' | 'medium' | 'high'
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await axios.put(`${serverAddress}/api/preferences`, preferences);
      setSnackbarMessage('Preferences saved successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSnackbarMessage('Failed to save preferences');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const renderToggleOption = (
    label: string, 
    name: keyof UserPreferences
  ) => {
    return (
      <View style={styles.toggleItem}>
        <Paragraph>{label}</Paragraph>
        <Switch
          value={preferences[name] as boolean}
          onValueChange={() => handleToggleChange(name)}
          disabled={loading || saving}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Content Types to Filter</Title>
          
          {renderToggleOption('Violence', 'violence')}
          {renderToggleOption('Nudity', 'nudity')}
          {renderToggleOption('Profanity', 'profanity')}
          {renderToggleOption('Gore', 'gore')}
          {renderToggleOption('Drug Use', 'drugs')}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Default Action</Title>
          <Paragraph style={styles.helpText}>
            Select how content should be modified when detected:
          </Paragraph>
          
          <SegmentedButtons
            value={preferences.defaultAction}
            onValueChange={handleDefaultActionChange}
            buttons={[
              {
                value: 'blur',
                label: 'Blur',
                disabled: loading || saving
              },
              {
                value: 'mute',
                label: 'Mute',
                disabled: loading || saving
              },
              {
                value: 'cut',
                label: 'Cut',
                disabled: loading || saving
              },
              {
                value: 'skip',
                label: 'Skip',
                disabled: loading || saving
              }
            ]}
            style={styles.segmentedButtons}
          />
          
          <Title style={[styles.cardTitle, styles.sensitivityTitle]}>
            Sensitivity Level
          </Title>
          <Paragraph style={styles.helpText}>
            Adjust how sensitive the content detection should be:
          </Paragraph>

          <RadioButton.Group
            onValueChange={handleSensitivityChange}
            value={preferences.sensitivity}
          >
            <View style={styles.radioItem}>
              <RadioButton.Android 
                value="low" 
                disabled={loading || saving}
              />
              <Paragraph>Low - Only filter highly explicit content</Paragraph>
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Android 
                value="medium" 
                disabled={loading || saving}
              />
              <Paragraph>Medium - Balance between permissive and strict</Paragraph>
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Android 
                value="high" 
                disabled={loading || saving}
              />
              <Paragraph>High - Filter even mildly questionable content</Paragraph>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSavePreferences}
        loading={saving}
        disabled={loading || saving}
        style={styles.saveButton}
      >
        Save Preferences
      </Button>

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
  cardTitle: {
    marginBottom: 16,
  },
  sensitivityTitle: {
    marginTop: 24,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  helpText: {
    marginBottom: 16,
    color: '#666',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 32,
  }
});

export default PreferencesScreen; 