import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MenuCalendarService } from '../services/menuCalendarService';

export default function MenuCalendarScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [dayRecipes, setDayRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadCalendar();
  }, [isFocused]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const markedResult = await MenuCalendarService.getMarkedDates();
      if (markedResult.success && markedResult.data) {
        setMarkedDates(markedResult.data);
      }
      const today = new Date().toISOString().split('T')[0];
      await loadRecipesForDate(today);
    } catch (err) {
      console.error('Error loading calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesForDate = async (date) => {
    try {
      const result = await MenuCalendarService.getGroupedMenuByDate(date);
      if (result.success && result.data) {
        const recipes = [];
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          result.data[mealType]?.forEach(recipe => {
            recipes.push({ ...recipe, mealType });
          });
        });
        setDayRecipes(recipes);
      } else {
        setDayRecipes([]);
      }
    } catch (err) {
      console.error('Error loading recipes for date:', err);
      setDayRecipes([]);
    }
  };

  const onDayPress = async (day) => {
    setSelectedDate(day.dateString);
    await loadRecipesForDate(day.dateString);
  };

  const handleDeleteEntry = async (recipe) => {
    Alert.alert(
      'Remove from Calendar',
      `Remove "${recipe.name}" from ${selectedDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await MenuCalendarService.removeRecipeByDateAndId(
              selectedDate,
              recipe.id
            );
            if (result.success) {
              await loadRecipesForDate(selectedDate);
              // Refresh marked dates
              const markedResult = await MenuCalendarService.getMarkedDates();
              if (markedResult.success && markedResult.data) {
                setMarkedDates(markedResult.data);
              }
            } else {
              Alert.alert('Error', 'Failed to remove entry');
            }
          },
        },
      ]
    );
  };

  const getDisplayMarkedDates = () => {
    const marked = {};
    // Copy existing marked dates
    Object.keys(markedDates).forEach(date => {
      marked[date] = { ...markedDates[date] };
    });
    // Highlight selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: '#FF6B6B',
      };
    }
    return marked;
  };

  const groupByMealType = (recipes) => {
    const grouped = { breakfast: [], lunch: [], dinner: [] };
    recipes.forEach(recipe => {
      if (grouped[recipe.mealType]) {
        grouped[recipe.mealType].push(recipe);
      }
    });
    return grouped;
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '#FFB84D';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#FF6B6B';
      default: return '#999';
    }
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'partly-sunny-outline';
      case 'dinner': return 'moon-outline';
      default: return 'restaurant-outline';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const groupedRecipes = groupByMealType(dayRecipes);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Calendar</Text>
      </View>

      <ScrollView>
        <Calendar
          onDayPress={onDayPress}
          markedDates={getDisplayMarkedDates()}
          theme={{
            todayTextColor: '#FF6B6B',
            arrowColor: '#FF6B6B',
            selectedDayBackgroundColor: '#FF6B6B',
            dotColor: '#FF6B6B',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textMonthFontWeight: 'bold',
          }}
          style={styles.calendar}
        />

        <View style={styles.menuSection}>
          <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 20 }} />
          ) : dayRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#DDD" />
              <Text style={styles.emptyText}>No meals planned</Text>
              <Text style={styles.emptySubtext}>
                Go to Home and add recipes to this day
              </Text>
            </View>
          ) : (
            <>
              {['breakfast', 'lunch', 'dinner'].map(
                mealType =>
                  groupedRecipes[mealType].length > 0 && (
                    <View key={mealType} style={styles.mealTypeSection}>
                      <View
                        style={[
                          styles.mealTypeHeader,
                          { backgroundColor: getMealTypeColor(mealType) },
                        ]}
                      >
                        <Ionicons
                          name={getMealTypeIcon(mealType)}
                          size={18}
                          color="#FFF"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.mealTypeTitle}>
                          {mealType.toUpperCase()}
                        </Text>
                      </View>
                      {groupedRecipes[mealType].map((recipe, index) => (
                        <TouchableOpacity
                          key={`${recipe.id}-${index}`}
                          style={styles.recipeItem}
                          onPress={() =>
                            navigation.navigate('RecipeDetail', {
                              recipe,
                            })
                          }
                          onLongPress={() => handleDeleteEntry(recipe)}
                        >
                          <View style={styles.recipeItemLeft}>
                            <Text style={styles.recipeName}>{recipe.name}</Text>
                            <Text style={styles.recipeDetails}>
                              {recipe.time} mins
                              {recipe.difficulty ? ` · ${recipe.difficulty}` : ''}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )
              )}
            </>
          )}
        </View>
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
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuSection: {
    padding: 16,
  },
  dateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
    textAlign: 'center',
  },
  mealTypeSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  mealTypeTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recipeItemLeft: {
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
