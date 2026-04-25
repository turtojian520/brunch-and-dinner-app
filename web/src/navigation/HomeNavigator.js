import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import IntroScreen from '../screens/IntroScreen';
import RecommendedMenuScreen from '../screens/RecommendedMenuScreen';
import AddToCalendarScreen from '../screens/AddToCalendarScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

const Stack = createStackNavigator();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="RecommendedMenu" component={RecommendedMenuScreen} />
      <Stack.Screen name="AddToCalendar" component={AddToCalendarScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}
