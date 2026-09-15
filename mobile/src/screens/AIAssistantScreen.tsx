import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../theme';
import { apiClient } from '../services/apiClient';

export function AIAssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Namaste! I am Sathyamithra, your AI Civic Guide. Ask me anything about government schemes, eligibility, or required documents.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.post('/assistant/chat', { message: textToSend });
      const aiReply = res.data.response || res.data.answer || 'Based on official guidelines, you may be eligible under category rules.';
      setMessages(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'assistant', text: aiReply }]);
    } catch (e) {
      // Fallback offline mock AI reply
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `Here is information regarding "${textToSend}": Central & State government schemes require valid Aadhaar, Income Certificate, and bank account details. You can apply directly through the Sathyamithra portal.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ask Sathyamithra AI</Text>
        <Text style={styles.subtitle}>Multilingual Civic RAG Voice & Chat Assistant</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.thinkingText}>Sathyamithra AI is thinking...</Text>
        </View>
      )}

      {/* Suggested Quick Prompts */}
      <View style={styles.suggestionsContainer}>
        <TouchableOpacity style={styles.chip} onPress={() => handleSend('What schemes am I eligible for?')}>
          <Text style={styles.chipText}>💡 What schemes am I eligible for?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => handleSend('Documents for PM-Kisan?')}>
          <Text style={styles.chipText}>📄 Documents for PM-Kisan?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a question in English, Hindi, Tamil..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  messageList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  thinkingText: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
