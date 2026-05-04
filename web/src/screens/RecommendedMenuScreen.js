import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { RecipeService } from '../services/recipeService';
import { MenuCalendarService } from '../services/menuCalendarService';
import { DataMigration } from '../utils/dataMigration';
import { mockRecipes } from '../data/mockRecipes';

export default function RecommendedMenuScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [allRecipes, setAllRecipes] = useState([]);
  const [recommendedMenu, setRecommendedMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, [isFocused]);

  useEffect(() => {
    if (allRecipes.length > 0 && recommendedMenu.length === 0) {
      generateRandomMenu();
    }
  }, [allRecipes]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      await DataMigration.initializeWithMockData();
      const result = await RecipeService.getAllRecipes();

      if (result.success && result.data) {
        const frontendRecipes = RecipeService.transformArrayToFrontend(result.data);
        setAllRecipes(frontendRecipes);
      } else {
        setAllRecipes(mockRecipes);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setAllRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomMenu = () => {
    const recipesToUse = allRecipes.length > 0 ? allRecipes : mockRecipes;
    const shuffled = [...recipesToUse].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(4, shuffled.length));
    setRecommendedMenu(selected);
    setSelectedItems([]);
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddToCalendar = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Selection', 'Please select at least one recipe');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setDatePickerVisible(true);
  };

  const confirmAddToCalendar = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    // Check if selected recipes have valid UUID IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const selectedRecipes = recommendedMenu.filter(r => selectedItems.includes(r.id));
    const invalidRecipes = selectedRecipes.filter(r => !uuidRegex.test(r.id));
    if (invalidRecipes.length > 0) {
      Alert.alert(
        'Cannot Add',
        'Some recipes are from local data and cannot be added to the calendar. Please ensure recipes are synced to the database first.'
      );
      return;
    }

    try {
      setAddingToCalendar(true);
      const entries = selectedRecipes.map(recipe => ({
        date: selectedDate,
        recipeId: recipe.id,
        mealType: recipe.mealType || 'lunch',
      }));

      const result = await MenuCalendarService.addMultipleRecipesToMenu(entries);
      if (result.success) {
        Alert.alert('Success', `${selectedRecipes.length} recipes added to ${selectedDate}!`);
        setDatePickerVisible(false);
        setSelectedItems([]);
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

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateStr;
      dates.push({ value: dateStr, label });
    }
    return dates;
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '#FFB84D';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#FF6B6B';
      default: return '#999';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      <View style={styles.cardContent}>
        <View style={[styles.mealTypeTag, { backgroundColor: getMealTypeColor(item.mealType) }]}>
          <Text style={styles.mealTypeText}>{(item.mealType || '').toUpperCase()}</Text>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.dishName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.time} mins</Text>
            <Text style={styles.separator}>·</Text>
            <Text
              style={[
                styles.difficultyText,
                {
                  color:
                    item.difficulty === 'easy'
                      ? '#4CAF50'
                      : item.difficulty === 'medium'
                      ? '#FF9800'
                      : '#F44336',
                },
              ]}
            >
              {item.difficulty
                ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)
                : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelection(item.id)}>
          <Ionicons
            name={selectedItems.includes(item.id) ? 'checkbox' : 'square-outline'}
            size={28}
            color={selectedItems.includes(item.id) ? '#FF6B6B' : '#CCC'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Recommended Menu</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : (
        <FlatList
          data={recommendedMenu}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No recipes available</Text>
              <Text style={styles.emptySubtext}>Add some recipes first</Text>
            </View>
          }
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.addButton, !selectedItems.length && styles.buttonDisabled]}
          disabled={!selectedItems.length}
          onPress={handleAddToCalendar}
        >
          <Ionicons name="calendar" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Add to Menu Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={generateRandomMenu}
        >
          <Ionicons name="refresh" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Generate New Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Date</Text>
            <ScrollView style={styles.dateList}>
              {getDateOptions().map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.dateOption,
                    selectedDate === opt.value && styles.dateOptionActive,
                  ]}
                  onPress={() => setSelectedDate(opt.value)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      selectedDate === opt.value && styles.dateOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setDatePickerVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={confirmAddToCalendar}
                disabled={addingToCalendar}
              >
                {addingToCalendar ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
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
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  mealTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  mealTypeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 8,
    color: '#CCC',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkbox: {
    padding: 4,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
  },
  refreshButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateList: {
    maxHeight: 250,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#F5F5F5',
  },
  dateOptionActive: {
    backgroundColor: '#FF6B6B',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
  },
  dateOptionTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  modalConfirmBtn: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
