'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const QUICK_PROMPTS = [
  'What is your strongest tech stack?',
  'Tell me about your CodeChef rank',
  'What AI projects are you building?',
  'What do you enjoy outside coding?',
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi, I am Suryansh's AI voice. It is designed to feel like you are talking to him directly. Ask me about projects, skills, achievements, or collaboration.",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendQuestion = async (questionText: string) => {
    const question = questionText.trim();
    if (!question) return;

    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(updatedMessages);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          messages: updatedMessages.slice(-12),
        }),
      });

      const data = (await res.json()) as { answer?: string };
      const answer = data.answer?.trim() || 'No response yet. Please try another question.';

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network issue detected. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    await sendQuestion(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed right-5 bottom-5 z-[70] px-5 py-3 rounded-full bg-blue-500 text-black font-bold shadow-[0_0_24px_rgba(59,130,246,0.55)] hover:bg-blue-400 transition"
      >
        {isOpen ? 'Close AI' : 'Ask AI'}
      </button>

      {isOpen && (
        <section className="fixed right-5 bottom-20 z-[70] w-[92vw] max-w-md rounded-2xl border border-blue-500/35 bg-black/90 backdrop-blur-md overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-500/25 bg-gradient-to-r from-blue-500/20 to-red-500/10">
            <h3 className="text-lg font-bold text-blue-300">Portfolio AI Assistant</h3>
            <p className="text-xs text-gray-300">Sweet, classy responses in Suryansh's voice about profile, projects, and personality.</p>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3">
            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  message.role === 'assistant'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-100'
                    : 'ml-auto bg-red-500/10 border border-red-500/30 text-red-100'
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[90%] rounded-lg px-3 py-2 text-sm bg-blue-500/10 border border-blue-500/30 text-blue-200">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => sendQuestion(prompt)}
                  disabled={loading}
                  className="text-xs px-2 py-1 rounded border border-blue-500/25 text-blue-200 hover:bg-blue-500/15 transition disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills, achievements..."
                className="flex-1 bg-slate-950 border border-blue-500/35 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="px-4 py-2 rounded bg-red-500 text-black font-semibold hover:bg-red-400 transition disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
