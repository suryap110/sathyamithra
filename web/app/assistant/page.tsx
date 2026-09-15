'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchemeCard } from '@/components/schemes/scheme-card';
import { SourceCitation } from '@/components/assistant/source-citation';
import { VoiceButton } from '@/components/assistant/voice-button';
import { SuggestedQuestions } from '@/components/assistant/suggested-questions';
import { SupportedLanguage, t } from '@/lib/i18n';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Bot, 
  AlertTriangle 
} from 'lucide-react';

interface Message {
  id?: string;
  sender: 'user' | 'assistant';
  content: string;
  sources?: any[];
  related_schemes?: any[];
  confidence?: number;
  isError?: boolean;
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;
        
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-sm text-sathya-indigo-900 mt-2">
              {line.replace('### ', '')}
            </h4>
          );
        }

        const isBullet =
          line.trim().startsWith('• ') ||
          line.trim().startsWith('* ') ||
          line.trim().startsWith('✓ ') ||
          line.trim().startsWith('✗ ');

        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <p
            key={idx}
            className={`text-xs sm:text-sm ${
              isBullet ? 'pl-3 border-l-2 border-sathya-teal-500 my-0.5' : ''
            }`}
          >
            {formattedLine}
          </p>
        );
      })}
    </div>
  );
}

export default function AssistantPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Assistant State
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [lastTtsSpeech, setLastTtsSpeech] = useState<string | null>(null);

  // Fetch User Sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/assistant/sessions');
      return res.data;
    },
    enabled: !!user,
  });

  // Fetch Session History when session selected
  const { data: activeSessionData } = useQuery({
    queryKey: ['chat-session-history', currentSessionId],
    queryFn: async () => {
      const res = await apiClient.get(`/assistant/sessions/${currentSessionId}`);
      return res.data;
    },
    enabled: !!currentSessionId && !!user,
  });

  useEffect(() => {
    if (activeSessionData && activeSessionData.messages) {
      setMessages(
        activeSessionData.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          sources: m.sources,
          related_schemes: m.related_schemes,
          confidence: m.confidence,
        }))
      );
    }
  }, [activeSessionData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Chat Mutation
  const sendChatMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.post('/assistant/chat', {
        message: text,
        session_id: currentSessionId,
        language: language,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (!currentSessionId) {
        setCurrentSessionId(data.session_id);
        if (user) queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      }
      const assistantMsg: Message = {
        sender: 'assistant',
        content: data.answer,
        sources: data.sources,
        related_schemes: data.related_schemes,
        confidence: data.confidence,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLastTtsSpeech(data.answer.replace(/[*#]/g, ''));
    },
    onError: (err: any) => {
      const errorMsg: Message = {
        sender: 'assistant',
        content: err.response?.data?.detail || 'Sorry, I encountered an issue connecting to the Sathyamithra backend server. Please make sure the backend is running on http://localhost:8000.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const handleSendMessage = (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    const userMsg: Message = { sender: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    sendChatMutation.mutate(messageText);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setLastTtsSpeech(null);
  };

  const handleDeleteSession = async (sId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/assistant/sessions/${sId}`);
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      if (currentSessionId === sId) {
        handleNewChat();
      }
    } catch {
      alert('Failed to delete session');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sathya-indigo-900 to-sathya-teal-600 text-white font-bold flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-sathya-indigo-900">
              {t('assistant.title', language)}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {t('assistant.subtitle', language)}
            </p>
          </div>
        </div>

        {/* Language Switcher + Voice Button */}
        <div className="flex items-center gap-3">
          <VoiceButton
            language={language}
            onSpeechResult={(txt) => handleSendMessage(txt)}
            speechTextToSpeak={lastTtsSpeech}
          />

          <div className="flex items-center border border-slate-300 rounded-xl p-1 bg-white">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                language === 'en' ? 'bg-sathya-indigo-900 text-white' : 'text-slate-600 hover:text-sathya-indigo-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                language === 'ta' ? 'bg-sathya-indigo-900 text-white' : 'text-slate-600 hover:text-sathya-indigo-900'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                language === 'hi' ? 'bg-sathya-indigo-900 text-white' : 'text-slate-600 hover:text-sathya-indigo-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
        
        {/* Sidebar History */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-start gap-2 rounded-xl shadow-sm"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            <span>{t('assistant.newChat', language)}</span>
          </Button>

          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('assistant.history', language)}
            </h3>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {!user ? (
                <p className="text-xs text-slate-400 italic">Sign in to save chat history</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No previous chats</p>
              ) : (
                sessions.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentSessionId(s.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      currentSessionId === s.id
                        ? 'bg-sathya-indigo-50 font-bold text-sathya-indigo-900'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-sathya-teal-600 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Chat Stream Window */}
        <div className="lg:col-span-9 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          
          {/* Messages Area */}
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[60vh] pr-2 pb-4">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="py-12 text-center space-y-6 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-sathya-indigo-50 text-sathya-indigo-900 flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-6 h-6 text-sathya-saffron-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg">Ask Sathyamithra AI</h3>
                  <p className="text-xs text-slate-500">
                    Grounded government benefits guide matched against official criteria.
                  </p>
                </div>
                <SuggestedQuestions
                  language={language}
                  onSelect={(q) => handleSendMessage(q)}
                />
              </div>
            )}

            {/* Message Bubble List */}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-sm ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-sathya-indigo-900 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    S
                  </div>
                )}

                <div className={`space-y-3 max-w-[85%] ${
                  m.sender === 'user'
                    ? 'bg-sathya-indigo-900 text-white p-4 rounded-2xl rounded-tr-none'
                    : m.isError
                    ? 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl rounded-tl-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl rounded-tl-none'
                }`}>
                  
                  {/* Text Content */}
                  <div className="leading-relaxed text-xs sm:text-sm">
                    {m.isError ? (
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{m.content}</span>
                      </div>
                    ) : (
                      <FormattedMessage text={m.content} />
                    )}
                  </div>

                  {/* Sources List */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sathya-indigo-900 block">
                        {t('assistant.sources', language)}
                      </span>
                      {m.sources.map((src: any, i: number) => (
                        <SourceCitation key={i} source={src} />
                      ))}
                    </div>
                  )}

                  {/* Related Scheme Cards inside Chat */}
                  {m.related_schemes && m.related_schemes.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/60 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sathya-teal-800 block">
                        Matched Government Schemes
                      </span>
                      <div className="grid grid-cols-1 gap-3">
                        {m.related_schemes.map((s: any) => (
                          <SchemeCard key={s.id} scheme={s} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-sathya-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    U
                  </div>
                )}
              </div>
            ))}

            {sendChatMutation.isPending && (
              <div className="flex gap-3 text-sm justify-start">
                <div className="w-8 h-8 rounded-full bg-sathya-indigo-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  S
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sathya-teal-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-sathya-indigo-700 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-sathya-saffron-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="ml-1">{t('assistant.processing', language)}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('assistant.placeholder', language)}
                className="flex-1 h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sathya-indigo-500 focus:bg-white transition-all"
              />

              <Button
                variant="primary"
                size="md"
                className="h-12 px-5 gap-2 rounded-xl shadow-md"
                isLoading={sendChatMutation.isPending}
                onClick={() => handleSendMessage()}
              >
                <span>{t('assistant.send', language)}</span>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              {t('assistant.disclaimer', language)}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
