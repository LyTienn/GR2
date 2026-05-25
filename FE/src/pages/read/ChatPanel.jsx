import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import HttpClient from '@/service/HttpClient';
import { firstValueFrom } from 'rxjs';

export default function ChatPanel({ bookTitle, t }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: `${t('components.chatPanel.greeting')} "${bookTitle}" ?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await firstValueFrom(
        HttpClient.post('/chatbot/chat', { 
            message: userMessage,
            currentBookTitle: bookTitle
        })
    );

      if (result.success) {
        setMessages(prev => [...prev, { role: 'ai', content: result.data }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `${t('components.chatPanel.errorFormat')} ${result.message}` }]);
      }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        setMessages(prev => [...prev, { role: 'ai', content: t('components.chatPanel.connectionError') }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-green-600'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 flex-row">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-600">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> {t('components.chatPanel.thinkingLoading')}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-inherit shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={t('components.chatPanel.placeholder')}
            className="w-full pl-3 pr-10 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 dark:placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}