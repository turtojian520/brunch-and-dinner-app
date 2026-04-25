import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

import HomeNavigator from './src/navigation/HomeNavigator';
import CalendarNavigator from './src/navigation/CalendarNavigator';
import IngredientsNavigator from './src/navigation/IngredientsNavigator';
import RecipesNavigator from './src/navigation/RecipesNavigator';
import BotScreen from './src/screens/BotScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
              else if (route.name === 'Ingredients') iconName = focused ? 'nutrition' : 'nutrition-outline';
              else if (route.name === 'Recipes') iconName = focused ? 'book' : 'book-outline';
              else if (route.name === 'Bot') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#FF6B6B',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={HomeNavigator} />
          <Tab.Screen name="Calendar" component={CalendarNavigator} />
          <Tab.Screen name="Ingredients" component={IngredientsNavigator} />
          <Tab.Screen name="Recipes" component={RecipesNavigator} />
          <Tab.Screen name="Bot" component={BotScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
