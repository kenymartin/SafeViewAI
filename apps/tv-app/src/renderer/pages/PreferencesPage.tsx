import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  RadioGroup,
  Radio,
  Slider,
  Alert,
  Snackbar,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import { UserPreferences, FilterAction } from '@safeview/shared';

const PreferencesPage: React.FC = () => {
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
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    // Load preferences from the backend
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const prefs = await window.api.getPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        setNotification({
          open: true,
          message: 'Failed to load preferences',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleActionChange = (event: SelectChangeEvent) => {
    setPreferences(prev => ({
      ...prev,
      defaultAction: event.target.value as FilterAction
    }));
  };

  const handleSensitivityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      sensitivity: event.target.value as 'low' | 'medium' | 'high'
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await window.api.updatePreferences(preferences);
      setNotification({
        open: true,
        message: 'Preferences saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setNotification({
        open: true,
        message: 'Failed to save preferences',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Content Filtering Preferences
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Content Types to Filter
        </Typography>
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.violence}
                    onChange={handleToggleChange}
                    name="violence"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Violence"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.nudity}
                    onChange={handleToggleChange}
                    name="nudity"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Nudity"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.profanity}
                    onChange={handleToggleChange}
                    name="profanity"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Profanity"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.gore}
                    onChange={handleToggleChange}
                    name="gore"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Gore"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.drugs}
                    onChange={handleToggleChange}
                    name="drugs"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Drug Use"
              />
            </Grid>
          </Grid>
        </FormGroup>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter Action
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="default-action-label">Default Action</InputLabel>
          <Select
            labelId="default-action-label"
            id="default-action"
            value={preferences.defaultAction}
            label="Default Action"
            onChange={handleActionChange}
            disabled={loading}
          >
            <MenuItem value="blur">Blur Content</MenuItem>
            <MenuItem value="mute">Mute Audio</MenuItem>
            <MenuItem value="cut">Cut Scene</MenuItem>
            <MenuItem value="skip">Skip with Transition</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="subtitle1" gutterBottom>
          Sensitivity Level
        </Typography>
        <FormControl component="fieldset" sx={{ mb: 2 }} disabled={loading}>
          <RadioGroup
            row
            name="sensitivity"
            value={preferences.sensitivity}
            onChange={handleSensitivityChange}
          >
            <FormControlLabel value="low" control={<Radio />} label="Low" />
            <FormControlLabel value="medium" control={<Radio />} label="Medium" />
            <FormControlLabel value="high" control={<Radio />} label="High" />
          </RadioGroup>
        </FormControl>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSavePreferences}
        disabled={loading || saving}
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PreferencesPage; 