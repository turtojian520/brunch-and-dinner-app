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
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { IngredientService } from '../services/ingredientService';
import { RecipeService } from '../services/recipeService';

const CATEGORIES = ['all', 'vegetable', 'fruit', 'meat', 'seafood', 'dairy', 'grain', 'seasoning', 'other'];
const CATEGORY_LABELS = {
  all: 'All',
  vegetable: 'Vegetable',
  fruit: 'Fruit',
  meat: 'Meat',
  seafood: 'Seafood',
  dairy: 'Dairy',
  grain: 'Grain',
  seasoning: 'Seasoning',
  other: 'Other',
};

const UNITS = ['pcs', 'kg', 'g', 'box', 'bottle', 'bag', 'bunch', 'head', 'can', 'tbsp', 'tsp', 'ml', 'L', 'cup'];

export default function IngredientsScreen() {
  const isFocused = useIsFocused();
  const [ingredients, setIngredients] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [scopeFilter, setScopeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: 'vegetable',
    quantity: '',
    unit: 'pcs',
    shelfLifeDays: '',
  });

  useEffect(() => {
    loadIngredients();
    loadRecipeIngredients();
  }, [isFocused]);

  useEffect(() => {
    filterAndSortIngredients();
  }, [ingredients, recipeIngredients, searchQuery, scopeFilter, categoryFilter, sortBy]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const result = await IngredientService.getAllIngredients();
      if (result.success && result.data) {
        const frontendIngredients = IngredientService.transformArrayToFrontend(result.data);
        setIngredients(frontendIngredients);
      } else {
        console.warn('Failed to load ingredients from Supabase');
        setIngredients([]);
      }
    } catch (err) {
      console.error('Error loading ingredients:', err);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipeIngredients = async () => {
    try {
      const result = await RecipeService.getAllRecipes();
      if (result.success && result.data) {
        const ingredientMap = {};
        result.data.forEach(recipe => {
          if (recipe.recipe_ingredients) {
            recipe.recipe_ingredients.forEach(ing => {
              const key = ing.name.toLowerCase();
              if (!ingredientMap[key]) {
                ingredientMap[key] = {
                  id: `recipe-${key}`,
                  name: ing.name,
                  category: ing.property || 'other',
                  quantity: ing.quantity || '-',
                  unit: ing.unit || '',
                  source: 'recipe',
                };
              }
            });
          }
        });
        setRecipeIngredients(Object.values(ingredientMap));
      }
    } catch (err) {
      console.error('Error loading recipe ingredients:', err);
    }
  };

  const filterAndSortIngredients = () => {
    let filtered = [];

    if (scopeFilter === 'all') {
      const myIngs = ingredients.map(i => ({ ...i, source: 'my' }));
      const recipeIngsFiltered = recipeIngredients.filter(
        ri => !ingredients.some(i => i.name.toLowerCase() === ri.name.toLowerCase())
      );
      filtered = [...myIngs, ...recipeIngsFiltered];
    } else if (scopeFilter === 'my') {
      filtered = ingredients.map(i => ({ ...i, source: 'my' }));
    } else if (scopeFilter === 'recipe') {
      filtered = [...recipeIngredients];
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return parseFloat(b.quantity || 0) - parseFloat(a.quantity || 0);
      if (sortBy === 'expiration') {
        const dateA = a.expirationDate ? new Date(a.expirationDate) : new Date('2099-12-31');
        const dateB = b.expirationDate ? new Date(b.expirationDate) : new Date('2099-12-31');
        return dateA - dateB;
      }
      return 0;
    });

    setFilteredIngredients(filtered);
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.name || !newIngredient.quantity || !newIngredient.shelfLifeDays) {
      Alert.alert('Error', 'Please fill in name, quantity, and shelf life');
      return;
    }

    try {
      setSaving(true);
      const ingredientData = {
        ...newIngredient,
        addedDate: new Date().toISOString().split('T')[0],
      };

      const result = await IngredientService.createIngredient(ingredientData);
      if (result.success && result.data) {
        const frontendIngredient = IngredientService.transformToFrontend(result.data);
        setIngredients(prev => [...prev, frontendIngredient]);
        setModalVisible(false);
        setNewIngredient({
          name: '',
          category: 'vegetable',
          quantity: '',
          unit: 'pcs',
          shelfLifeDays: '',
        });
        Alert.alert('Success', 'Ingredient added!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save ingredient');
      }
    } catch (err) {
      console.error('Error saving ingredient:', err);
      Alert.alert('Error', 'Failed to save ingredient');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIngredient = (item) => {
    if (item.source === 'recipe') return;
    Alert.alert(
      'Delete Ingredient',
      `Remove "${item.name}" from your inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await IngredientService.deleteIngredient(item.id);
            if (result.success) {
              setIngredients(prev => prev.filter(i => i.id !== item.id));
            } else {
              Alert.alert('Error', 'Failed to delete ingredient');
            }
          },
        },
      ]
    );
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  };

  const getExpirationLabel = (expirationDate) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Expired', color: '#F44336' };
    if (diffDays === 0) return { text: 'Expires today', color: '#FF9800' };
    if (diffDays <= 3) return { text: `${diffDays}d left`, color: '#FF9800' };
    return { text: expirationDate, color: '#999' };
  };

  const renderIngredient = ({ item }) => {
    const expLabel = getExpirationLabel(item.expirationDate);
    const expired = isExpired(item.expirationDate);

    return (
      <TouchableOpacity
        style={[
          styles.ingredientCard,
          item.source === 'recipe' && styles.recipeIngredientCard,
          expired && styles.expiredCard,
        ]}
        onLongPress={() => handleDeleteIngredient(item)}
        activeOpacity={0.7}
      >
        <View style={styles.ingredientLeft}>
          <View style={styles.nameRow}>
            <Text style={[styles.ingredientName, expired && styles.expiredText]}>{item.name}</Text>
            {item.source === 'recipe' && (
              <View style={styles.sourceTag}>
                <Text style={styles.sourceTagText}>Recipe</Text>
              </View>
            )}
          </View>
          <Text style={styles.ingredientCategory}>
            {CATEGORY_LABELS[item.category] || item.category}
          </Text>
          {expLabel && (
            <Text style={[styles.expirationText, { color: expLabel.color }]}>
              {expLabel.text}
            </Text>
          )}
        </View>
        <View style={styles.ingredientRight}>
          <View style={[styles.quantityBox, expired && styles.expiredQuantityBox]}>
            <Text style={[styles.quantityNumber, expired && styles.expiredQuantityText]}>
              {item.quantity}
            </Text>
            <Text style={[styles.quantityUnit, expired && styles.expiredQuantityText]}>
              {item.unit}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ingredients</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={32} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ingredients..."
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
        {/* Scope Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'my', label: 'My Ingredients' },
            { key: 'recipe', label: 'Recipe Ingredients' },
          ].map(scope => (
            <TouchableOpacity
              key={scope.key}
              style={[styles.filterChip, scopeFilter === scope.key && styles.filterChipActive]}
              onPress={() => setScopeFilter(scope.key)}
            >
              <Text style={[styles.filterText, scopeFilter === scope.key && styles.filterTextActive]}>
                {scope.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[styles.filterText, categoryFilter === cat && styles.filterTextActive]}>
                {CATEGORY_LABELS[cat] || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {[
            { key: 'name', label: 'By Name' },
            { key: 'quantity', label: 'By Quantity' },
            { key: 'expiration', label: 'By Expiration' },
          ].map(sort => (
            <TouchableOpacity
              key={sort.key}
              style={[styles.sortChip, sortBy === sort.key && styles.sortChipActive]}
              onPress={() => setSortBy(sort.key)}
            >
              <Ionicons
                name="swap-vertical"
                size={14}
                color={sortBy === sort.key ? '#FFF' : '#666'}
              />
              <Text style={[styles.sortText, sortBy === sort.key && styles.sortTextActive]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <FlatList
          data={filteredIngredients}
          renderItem={renderIngredient}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No ingredients found</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first ingredient</Text>
            </View>
          }
        />
      )}

      {/* Add Ingredient Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ingredient</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Apple, Chicken Breast..."
                value={newIngredient.name}
                onChangeText={text => setNewIngredient({ ...newIngredient, name: text })}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerButtons}>
                {CATEGORIES.filter(c => c !== 'all').map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerButton,
                      newIngredient.category === cat && styles.pickerButtonActive,
                    ]}
                    onPress={() => setNewIngredient({ ...newIngredient, category: cat })}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        newIngredient.category === cat && styles.pickerButtonTextActive,
                      ]}
                    >
                      {CATEGORY_LABELS[cat] || cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    value={newIngredient.quantity}
                    onChangeText={text => setNewIngredient({ ...newIngredient, quantity: text })}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Unit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.unitRow}>
                      {UNITS.map(unit => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitChip,
                            newIngredient.unit === unit && styles.unitChipActive,
                          ]}
                          onPress={() => setNewIngredient({ ...newIngredient, unit })}
                        >
                          <Text
                            style={[
                              styles.unitChipText,
                              newIngredient.unit === unit && styles.unitChipTextActive,
                            ]}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <Text style={styles.label}>Shelf Life (days)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 14"
                keyboardType="numeric"
                value={newIngredient.shelfLifeDays}
                onChangeText={text => setNewIngredient({ ...newIngredient, shelfLifeDays: text })}
              />
              <Text style={styles.hintText}>
                Expiration date will be automatically calculated from today + shelf life days.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveModalButton]}
                  onPress={handleAddIngredient}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#4ECDC4',
  },
  sortText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  sortTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  ingredientCard: {
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
  recipeIngredientCard: {
    backgroundColor: '#FFF8F0',
    borderLeftWidth: 3,
    borderLeftColor: '#FFB84D',
  },
  expiredCard: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  ingredientLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  expiredText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sourceTag: {
    backgroundColor: '#FFB84D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  sourceTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ingredientCategory: {
    fontSize: 13,
    color: '#999',
  },
  expirationText: {
    fontSize: 12,
    marginTop: 4,
  },
  ingredientRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  expiredQuantityBox: {
    borderColor: '#CCC',
    backgroundColor: '#F5F5F5',
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 4,
  },
  quantityUnit: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  expiredQuantityText: {
    color: '#999',
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
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '92%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 4,
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
  pickerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  pickerButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  pickerButtonText: {
    fontSize: 13,
    color: '#666',
  },
  pickerButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  unitRow: {
    flexDirection: 'row',
    paddingBottom: 12,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    marginRight: 6,
  },
  unitChipActive: {
    backgroundColor: '#4ECDC4',
  },
  unitChipText: {
    fontSize: 12,
    color: '#666',
  },
  unitChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  saveModalButton: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
