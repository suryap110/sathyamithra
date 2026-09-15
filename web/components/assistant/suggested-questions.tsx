import React from 'react';
import { SupportedLanguage, t } from '@/lib/i18n';
import { Sparkles } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  language: SupportedLanguage;
}

export function SuggestedQuestions({ onSelect, language }: SuggestedQuestionsProps) {
  const questions = [
    t('assistant.prompt1', language),
    t('assistant.prompt2', language),
    t('assistant.prompt3', language),
    t('assistant.prompt4', language),
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-sathya-saffron-500" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sathya-indigo-50 hover:text-sathya-indigo-900 border border-slate-200 text-slate-700 transition-colors text-left font-medium"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
