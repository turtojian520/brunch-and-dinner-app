import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { RecipeService } from '../services/recipeService';
import { AiService } from '../services/aiService';
import { DataMigration } from '../utils/dataMigration';
import { mockRecipes } from '../data/mockRecipes';

export default function RecipesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mealTypeFilter, setMealTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    time: '',
    difficulty: 'easy',
    mealType: 'lunch',
    ingredients: [],
    steps: [],
  });

  const [ingredientInput, setIngredientInput] = useState({
    name: '',
    property: '',
    quantity: '',
    unit: '',
  });
  const [stepInput, setStepInput] = useState('');

  useEffect(() => {
    loadRecipes();
  }, [isFocused]);

  useEffect(() => {
    filterRecipes();
  }, [recipes, mealTypeFilter, difficultyFilter, searchQuery]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      await DataMigration.initializeWithMockData();
      const result = await RecipeService.getAllRecipes();
      if (result.success && result.data) {
        const frontendRecipes = RecipeService.transformArrayToFrontend(result.data);
        setRecipes(frontendRecipes);
      } else {
        console.warn('Failed to load recipes, using mock data');
        setRecipes(mockRecipes);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (mealTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.mealType === mealTypeFilter);
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(r => r.difficulty === difficultyFilter);
    }
    setFilteredRecipes(filtered);
  };

  const handleAiGenerate = async () => {
    if (!newRecipe.name.trim()) {
      Alert.alert('Error', 'Please enter a dish name first');
      return;
    }
    if (!AiService.isConfigured()) {
      Alert.alert('Error', 'AI service not configured. Please add GEMINI_API_KEY to .env');
      return;
    }

    try {
      setAiGenerating(true);
      const result = await AiService.generateRecipe(
        newRecipe.name,
        newRecipe.mealType,
        newRecipe.difficulty,
        parseInt(newRecipe.time) || 30
      );

      if (result.success && result.recipe) {
        setNewRecipe(prev => ({
          ...prev,
          ingredients: result.recipe.ingredients || [],
          steps: result.recipe.steps || [],
        }));
        Alert.alert('Success', 'AI generated ingredients and steps! Review and save.');
      } else {
        Alert.alert('AI Error', result.error || 'Failed to generate recipe');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      Alert.alert('Error', 'Failed to generate recipe with AI');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddRecipe = async () => {
    if (!newRecipe.name || !newRecipe.time) {
      Alert.alert('Error', 'Please fill in recipe name and cooking time');
      return;
    }

    try {
      setSaving(true);
      const recipeData = {
        ...newRecipe,
        time: parseInt(newRecipe.time),
      };

      const result = await RecipeService.createRecipe(recipeData);
      if (result.success && result.data) {
        const frontendRecipe = RecipeService.transformToFrontend(result.data);
        setRecipes(prev => [frontendRecipe, ...prev]);
        setModalVisible(false);
        resetNewRecipe();
        Alert.alert('Success', 'Recipe added!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      Alert.alert('Error', 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = (recipe) => {
    Alert.alert(
      'Delete Recipe',
      `Remove "${recipe.name}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await RecipeService.deleteRecipe(recipe.id);
            if (result.success) {
              setRecipes(prev => prev.filter(r => r.id !== recipe.id));
            } else {
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ]
    );
  };

  const resetNewRecipe = () => {
    setNewRecipe({
      name: '',
      time: '',
      difficulty: 'easy',
      mealType: 'lunch',
      ingredients: [],
      steps: [],
    });
    setIngredientInput({ name: '', property: '', quantity: '', unit: '' });
    setStepInput('');
  };

  const addIngredient = () => {
    if (ingredientInput.name && ingredientInput.property) {
      setNewRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...ingredientInput }],
      }));
      setIngredientInput({ name: '', property: '', quantity: '', unit: '' });
    }
  };

  const removeIngredient = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addStep = () => {
    if (stepInput.trim()) {
      setNewRecipe(prev => ({
        ...prev,
        steps: [...prev.steps, stepInput.trim()],
      }));
      setStepInput('');
    }
  };

  const removeStep = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

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

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      onLongPress={() => handleDeleteRecipe(item)}
    >
      <View style={styles.recipeLeft}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeTime}>{item.time} mins</Text>
        <Text style={styles.recipeIngredients}>
          {item.ingredients?.length || 0} ingredients
        </Text>
      </View>
      <View style={styles.recipeRight}>
        <View style={[styles.mealTypeTag, { backgroundColor: getMealTypeColor(item.mealType) }]}>
          <Text style={styles.tagText}>{(item.mealType || '').toUpperCase()}</Text>
        </View>
        <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.tagText}>{(item.difficulty || '').toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipes</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={32} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Text style={styles.filterLabel}>Meal:</Text>
          {['all', 'breakfast', 'lunch', 'dinner'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, mealTypeFilter === type && styles.filterChipActive]}
              onPress={() => setMealTypeFilter(type)}
            >
              <Text style={[styles.filterText, mealTypeFilter === type && styles.filterTextActive]}>
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Text style={styles.filterLabel}>Level:</Text>
          {['all', 'easy', 'medium', 'difficult'].map(diff => (
            <TouchableOpacity
              key={diff}
              style={[styles.filterChip, difficultyFilter === diff && styles.filterChipActive]}
              onPress={() => setDifficultyFilter(diff)}
            >
              <Text style={[styles.filterText, difficultyFilter === diff && styles.filterTextActive]}>
                {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recipe List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipe}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No recipes found</Text>
            </View>
          }
        />
      )}

      {/* Add Recipe Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setModalVisible(false); resetNewRecipe(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Recipe</Text>
            <TouchableOpacity onPress={handleAddRecipe} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Recipe Name + AI Button */}
            <Text style={styles.sectionLabel}>Recipe Name</Text>
            <View style={styles.aiInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="e.g. Mapo Tofu"
                value={newRecipe.name}
                onChangeText={text => setNewRecipe({ ...newRecipe, name: text })}
              />
              <TouchableOpacity
                style={[styles.aiButton, aiGenerating && styles.aiButtonDisabled]}
                onPress={handleAiGenerate}
                disabled={aiGenerating}
              >
                {aiGenerating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                    <Text style={styles.aiButtonText}>AI</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Cooking Time (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30"
              keyboardType="numeric"
              value={newRecipe.time}
              onChangeText={text => setNewRecipe({ ...newRecipe, time: text })}
            />

            {/* Meal Type */}
            <Text style={styles.sectionLabel}>Meal Type</Text>
            <View style={styles.pickerButtons}>
              {['breakfast', 'lunch', 'dinner'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerButton,
                    newRecipe.mealType === type && {
                      backgroundColor: getMealTypeColor(type),
                    },
                  ]}
                  onPress={() => setNewRecipe({ ...newRecipe, mealType: type })}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      newRecipe.mealType === type && styles.pickerButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Difficulty */}
            <Text style={styles.sectionLabel}>Difficulty</Text>
            <View style={styles.pickerButtons}>
              {['easy', 'medium', 'difficult'].map(diff => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.pickerButton,
                    newRecipe.difficulty === diff && {
                      backgroundColor: getDifficultyColor(diff),
                    },
                  ]}
                  onPress={() => setNewRecipe({ ...newRecipe, difficulty: diff })}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      newRecipe.difficulty === diff && styles.pickerButtonTextActive,
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ingredients */}
            <Text style={styles.sectionLabel}>
              Ingredients ({newRecipe.ingredients.length})
            </Text>
            {newRecipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemText}>
                    {ing.name} - {ing.quantity} {ing.unit}
                  </Text>
                  <Text style={styles.listItemSubtext}>{ing.property}</Text>
                </View>
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemSection}>
              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.inputSmall, { flex: 2 }]}
                  placeholder="Name"
                  value={ingredientInput.name}
                  onChangeText={text => setIngredientInput({ ...ingredientInput, name: text })}
                />
                <TextInput
                  style={[styles.inputSmall, { flex: 1.5 }]}
                  placeholder="Type"
                  value={ingredientInput.property}
                  onChangeText={text => setIngredientInput({ ...ingredientInput, property: text })}
                />
              </View>
              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.inputSmall, { flex: 1 }]}
                  placeholder="Qty"
                  value={ingredientInput.quantity}
                  onChangeText={text => setIngredientInput({ ...ingredientInput, quantity: text })}
                />
                <TextInput
                  style={[styles.inputSmall, { flex: 1 }]}
                  placeholder="Unit"
                  value={ingredientInput.unit}
                  onChangeText={text => setIngredientInput({ ...ingredientInput, unit: text })}
                />
                <TouchableOpacity style={styles.addItemButton} onPress={addIngredient}>
                  <Ionicons name="add-circle" size={34} color="#4ECDC4" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Steps */}
            <Text style={styles.sectionLabel}>Steps ({newRecipe.steps.length})</Text>
            {newRecipe.steps.map((step, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.listItemText, { flex: 1 }]}>{step}</Text>
                <TouchableOpacity onPress={() => removeStep(index)}>
                  <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemRow}>
              <TextInput
                style={[styles.inputSmall, { flex: 1 }]}
                placeholder="Add cooking step..."
                value={stepInput}
                onChangeText={setStepInput}
                multiline
              />
              <TouchableOpacity style={styles.addItemButton} onPress={addStep}>
                <Ionicons name="add-circle" size={34} color="#4ECDC4" />
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  filterRow: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 13,
    color: '#999',
    marginRight: 8,
    alignSelf: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  recipeLeft: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  recipeTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeIngredients: {
    fontSize: 13,
    color: '#999',
  },
  recipeRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  mealTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  difficultyTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 10,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  aiButtonDisabled: {
    backgroundColor: '#B39DDB',
  },
  aiButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  pickerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#666',
  },
  pickerButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  listItemSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addItemSection: {
    marginBottom: 8,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemButton: {
    padding: 2,
  },
});
