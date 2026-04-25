import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { MenuCalendarService } from '../services/menuCalendarService';

export default function AddToCalendarScreen({ route, navigation }) {
  const { selectedRecipes } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [existingRecipes, setExistingRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadExistingRecipes(today);
  }, []);

  const loadExistingRecipes = async (date) => {
    try {
      setLoading(true);
      const result = await MenuCalendarService.getGroupedMenuByDate(date);
      if (result.success && result.data) {
        const recipes = [];
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          result.data[mealType]?.forEach(recipe => {
            recipes.push({ ...recipe, mealType });
          });
        });
        setExistingRecipes(recipes);
      } else {
        setExistingRecipes([]);
      }
    } catch (err) {
      console.error('Error loading existing recipes:', err);
      setExistingRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    loadExistingRecipes(day.dateString);
  };

  const handleSave = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      setSaving(true);
      const entries = selectedRecipes.map(recipe => ({
        date: selectedDate,
        recipeId: recipe.id,
        mealType: recipe.mealType || 'lunch',
      }));

      const result = await MenuCalendarService.addMultipleRecipesToMenu(entries);
      if (result.success) {
        Alert.alert('Success', `${selectedRecipes.length} recipes added to ${selectedDate}!`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to save to calendar');
      }
    } catch (err) {
      console.error('Error saving to calendar:', err);
      Alert.alert('Error', 'Failed to save to calendar');
    } finally {
      setSaving(false);
    }
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '#FFB84D';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#FF6B6B';
      default: return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Calendar</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#FF6B6B' },
          }}
          theme={{
            todayTextColor: '#FF6B6B',
            arrowColor: '#FF6B6B',
            selectedDayBackgroundColor: '#FF6B6B',
          }}
          style={styles.calendar}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipes to Add</Text>
          {selectedRecipes.map((recipe, index) => (
            <View key={recipe.id || index} style={styles.recipeCard}>
              <View
                style={[styles.mealTypeTag, { backgroundColor: getMealTypeColor(recipe.mealType) }]}
              >
                <Text style={styles.mealTypeText}>
                  {(recipe.mealType || '').toUpperCase()}
                </Text>
              </View>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeDetails}>
                  {recipe.time} mins · {recipe.difficulty || ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {existingRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Already on {selectedDate}</Text>
            {existingRecipes.map((recipe, index) => (
              <View key={index} style={[styles.recipeCard, styles.existingCard]}>
                <View
                  style={[
                    styles.mealTypeTag,
                    { backgroundColor: getMealTypeColor(recipe.mealType) },
                  ]}
                >
                  <Text style={styles.mealTypeText}>
                    {(recipe.mealType || '').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeDetails}>
                    {recipe.time} mins · {recipe.difficulty || ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  existingCard: {
    opacity: 0.6,
  },
  mealTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  mealTypeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 13,
    color: '#999',
  },
});
