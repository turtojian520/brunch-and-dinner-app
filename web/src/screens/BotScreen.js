import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { IngredientService } from '../services/ingredientService';
import { RecipeService } from '../services/recipeService';
import { AiService } from '../services/aiService';

export default function BotScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadData();
    setMessages([
      {
        id: '1',
        text: "Hi! I'm your AI cooking assistant powered by Gemini. I can help you with:\n\n• Recipe recommendations based on your ingredients\n• Generate new recipes and save them\n• Cooking tips and techniques\n• Ingredient substitutions\n• Meal planning suggestions\n\nWhat would you like to know?",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const loadData = async () => {
    try {
      const ingredientsResult = await IngredientService.getAllIngredients();
      if (ingredientsResult.success && ingredientsResult.data) {
        const frontendIngredients = IngredientService.transformArrayToFrontend(ingredientsResult.data);
        setIngredients(frontendIngredients);
      }

      const recipesResult = await RecipeService.getAllRecipes();
      if (recipesResult.success && recipesResult.data) {
        const frontendRecipes = RecipeService.transformArrayToFrontend(recipesResult.data);
        setRecipes(frontendRecipes);
      }
    } catch (err) {
      console.error('Error loading data for bot:', err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Build context from app data
      const context = {
        ingredients: ingredients,
        recipes: recipes,
      };

      // Send only last 10 messages as history to keep context manageable
      const recentHistory = currentMessages.slice(-10).filter(m => m.id !== '1');

      const result = await AiService.chat(userMessage.text, recentHistory, context);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: result.success
          ? result.text
          : `Sorry, I encountered an error: ${result.error}\n\nPlease try again.`,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please check your internet connection and try again.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSaveRecipe = async (recipeName, messageText) => {
    try {
      const parsed = AiService.parseRecipeFromChat(messageText, recipeName);
      if (parsed && parsed.ingredients.length > 0 && parsed.steps.length > 0) {
        Alert.alert(
          'Save Recipe',
          `Save "${recipeName}" to your recipe library?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save',
              onPress: async () => {
                const recipeData = {
                  name: recipeName,
                  mealType: 'lunch',
                  difficulty: 'medium',
                  time: 30,
                  ingredients: parsed.ingredients,
                  steps: parsed.steps,
                };
                const result = await RecipeService.createRecipe(recipeData);
                if (result.success) {
                  Alert.alert('Success', 'Recipe saved to your library!');
                  loadData(); // Refresh data
                } else {
                  Alert.alert('Error', 'Failed to save recipe. Please try again.');
                }
              },
            },
          ]
        );
      }
    } catch (err) {
      console.error('Error saving recipe from chat:', err);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isBot ? styles.botMessage : styles.userMessage]}>
      <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Ionicons name="chatbubbles" size={24} color="#FF6B6B" />
          <Text style={styles.headerTitle}>AI Cooking Assistant</Text>
          {!AiService.isConfigured() && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>No API Key</Text>
            </View>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#FF6B6B" />
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about cooking..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  warningBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  warningText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '82%',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#FFF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    marginLeft: 8,
    color: '#999',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
});
