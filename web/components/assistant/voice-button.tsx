'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { SupportedLanguage, t } from '@/lib/i18n';

interface VoiceButtonProps {
  onSpeechResult: (text: string) => void;
  language: SupportedLanguage;
  speechTextToSpeak?: string | null;
}

export type VoiceState = 'Idle' | 'Listening' | 'Processing' | 'Speaking' | 'Error';

export function VoiceButton({ onSpeechResult, language, speechTextToSpeak }: VoiceButtonProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('Idle');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  // Text to Speech playback
  useEffect(() => {
    if (speechTextToSpeak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechTextToSpeak);
      if (language === 'ta') utterance.lang = 'ta-IN';
      else if (language === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';

      setVoiceState('Speaking');
      utterance.onend = () => setVoiceState('Idle');
      utterance.onerror = () => setVoiceState('Idle');

      window.speechSynthesis.speak(utterance);
    }
  }, [speechTextToSpeak, language]);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (language === 'ta') recognition.lang = 'ta-IN';
      else if (language === 'hi') recognition.lang = 'hi-IN';
      else recognition.lang = 'en-IN';

      setVoiceState('Listening');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceState('Processing');
        onSpeechResult(transcript);
        setTimeout(() => setVoiceState('Idle'), 1000);
      };

      recognition.onerror = () => {
        setVoiceState('Idle');
      };

      recognition.start();
    } catch {
      setVoiceState('Idle');
    }
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'Listening':
        return t('assistant.listening', language);
      case 'Processing':
        return t('assistant.processing', language);
      case 'Speaking':
        return t('assistant.speaking', language);
      default:
        return t('assistant.voice', language);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={startListening}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
          voiceState === 'Listening'
            ? 'bg-red-500 text-white border-red-600 animate-pulse'
            : voiceState === 'Speaking'
            ? 'bg-sathya-teal-600 text-white border-sathya-teal-700'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        }`}
        title="Speak to Sathyamithra"
      >
        {voiceState === 'Listening' && <Mic className="w-4 h-4 text-white animate-bounce" />}
        {voiceState === 'Processing' && <Loader2 className="w-4 h-4 text-sathya-indigo-700 animate-spin" />}
        {voiceState === 'Speaking' && <Volume2 className="w-4 h-4 text-white animate-pulse" />}
        {voiceState === 'Idle' && <Mic className="w-4 h-4 text-sathya-teal-600" />}

        <span>{getStatusText()}</span>
      </button>
    </div>
  );
}
