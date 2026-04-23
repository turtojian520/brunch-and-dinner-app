import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import IngredientsScreen from '../screens/IngredientsScreen';

const Stack = createStackNavigator();

export default function IngredientsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="IngredientsList" component={IngredientsScreen} />
    </Stack.Navigator>
  );
}
