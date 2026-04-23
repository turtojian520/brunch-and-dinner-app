import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MenuCalendarService } from '../services/menuCalendarService';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '#FFB84D';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#FF6B6B';
      default: return '#999';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'difficult': return '#F44336';
      default: return '#999';
    }
  };

  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];

  const handleAddToTodayMenu = async () => {
    if (!recipe.id) {
      Alert.alert('Error', 'Recipe ID not found');
      return;
    }
    // Check if the ID is a valid UUID (Supabase uses UUIDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(recipe.id)) {
      Alert.alert(
        'Cannot Add',
        'This recipe is from local data and has not been synced to the database yet. Please go to the Recipes page and re-add it.'
      );
      return;
    }
    try {
      setAddingToCalendar(true);
      const today = new Date().toISOString().split('T')[0];
      const mealType = recipe.mealType || 'lunch';
      const result = await MenuCalendarService.addRecipeToMenu(today, recipe.id, mealType);
      if (result.success) {
        Alert.alert('Success', `"${recipe.name}" added to today's menu!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to add to calendar');
      }
    } catch (err) {
      console.error('Error adding to calendar:', err);
      Alert.alert('Error', 'Failed to add to calendar');
    } finally {
      setAddingToCalendar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.titleCard}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.metaText}>{recipe.time} mins</Text>
            </View>
            {recipe.mealType && (
              <View style={[styles.mealTypeTag, { backgroundColor: getMealTypeColor(recipe.mealType) }]}>
                <Text style={styles.tagText}>{recipe.mealType.toUpperCase()}</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
                <Text style={styles.tagText}>{recipe.difficulty.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {ingredients.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ingredients</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientLeft}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  {ingredient.property && (
                    <Text style={styles.ingredientProperty}>Property: {ingredient.property}</Text>
                  )}
                </View>
                <Text style={styles.ingredientQuantity}>
                  {ingredient.quantity} {ingredient.unit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {steps.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cooking Process</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {ingredients.length === 0 && steps.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="information-circle-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No details available for this recipe</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.addToMenuButton, addingToCalendar && styles.buttonDisabled]}
          onPress={handleAddToTodayMenu}
          disabled={addingToCalendar}
        >
          <Ionicons name="calendar" size={20} color="#FFF" />
          <Text style={styles.addToMenuText}>
            {addingToCalendar ? 'Adding...' : "Add to Today's Menu"}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  titleCard: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  mealTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredientLeft: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ingredientProperty: {
    fontSize: 13,
    color: '#999',
  },
  ingredientQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  addToMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  addToMenuText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
