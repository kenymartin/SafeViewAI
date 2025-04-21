import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './screens/HomeScreen';
import RemoteScreen from './screens/RemoteScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import DeviceSetupScreen from './screens/DeviceSetupScreen';

const Stack = createNativeStackNavigator();

// Custom theme with SafeView AI colors
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196f3',
    accent: '#f50057',
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2196f3',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'SafeView AI Remote' }} 
          />
          <Stack.Screen 
            name="Remote" 
            component={RemoteScreen} 
            options={{ title: 'Remote Control' }} 
          />
          <Stack.Screen 
            name="Preferences" 
            component={PreferencesScreen} 
            options={{ title: 'Content Preferences' }} 
          />
          <Stack.Screen 
            name="DeviceSetup" 
            component={DeviceSetupScreen} 
            options={{ title: 'Connect to Device' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App; 