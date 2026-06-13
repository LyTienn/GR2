import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, Loader2, MessageCircle, Plus, Send, Trash2, User } from 'lucide-react';
import HttpClient from '@/service/HttpClient';
import { firstValueFrom } from 'rxjs';

export default function ChatPanel({ bookTitle, chapterId, t }) {
  const greetingMessage = useCallback(() => ({
    role: 'ai',
    content: `${t('components.chatPanel.greeting')} "${bookTitle}" ?`
  }), [bookTitle, t]);

  const [view, setView] = useState('list');
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [conversationError, setConversationError] = useState('');
  const messagesEndRef = useRef(null);

  const getConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationError('');

    try {
      const result = await firstValueFrom(
        HttpClient.get('/chatbot/conversations', { skipToast: true })
      );

      if (result.success) {
        setConversations(result.data?.conversations || []);
      } else {
        setConversationError(result.message || t('components.chatPanel.loadConversationsError'));
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      setConversationError(t('components.chatPanel.loadConversationsError'));
    } finally {
      setIsLoadingConversations(false);
    }
  }, [t]);

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mapConversationMessages = (conversationMessages = []) => {
    if (!conversationMessages.length) return [greetingMessage()];

    return conversationMessages.map((message) => ({
      role: message.role,
      content: message.content
    }));
  };

  const handleOpenConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    setView('chat');
    setIsLoadingMessages(true);
    setMessages([]);

    try {
      const result = await firstValueFrom(
        HttpClient.get(`/chatbot/conversations/${conversationId}`, { skipToast: true })
      );

      if (result.success) {
        setMessages(mapConversationMessages(result.data?.messages));
      } else {
        setMessages([{ role: 'ai', content: result.message || t('components.chatPanel.loadMessagesError') }]);
      }
    } catch (error) {
      console.error('Load conversation messages error:', error);
      setMessages([{ role: 'ai', content: t('components.chatPanel.loadMessagesError') }]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateConversation = async () => {
    setIsLoadingConversations(true);
    setConversationError('');

    try {
      const result = await firstValueFrom(
        HttpClient.post('/chatbot/conversations', { bookTitle, chapterId }, { skipToast: true })
      );

      if (result.success) {
        const conversation = result.data;
        setConversations(prev => [conversation, ...prev]);
        setActiveConversationId(conversation.id);
        setMessages([greetingMessage()]);
        setInput('');
        setView('chat');
      } else {
        setConversationError(result.message || t('components.chatPanel.createConversationError'));
      }
    } catch (error) {
      console.error('Create conversation error:', error);
      setConversationError(t('components.chatPanel.createConversationError'));
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleDeleteConversation = async (event, conversationId) => {
    event.stopPropagation();

    setDeletingConversationId(conversationId);
    setConversationError('');

    try {
      const result = await firstValueFrom(
        HttpClient.delete(`/chatbot/conversations/${conversationId}`, { skipToast: true })
      );

      if (result.success) {
        setConversations(prev => prev.filter(conversation => conversation.id !== conversationId));

        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
          setMessages([]);
          setInput('');
          setView('list');
        }
      } else {
        setConversationError(result.message || t('components.chatPanel.deleteConversationError'));
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      setConversationError(t('components.chatPanel.deleteConversationError'));
    } finally {
      setDeletingConversationId(null);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
    getConversations();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isLoadingMessages) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await firstValueFrom(
        HttpClient.post('/chatbot/chat', {
          message: userMessage,
          currentBookTitle: bookTitle,
          currentChapterId: chapterId,
          conversationId: activeConversationId
        })
      );

      if (result.success) {
        setMessages(prev => [...prev, { role: 'ai', content: result.data }]);
        if (result.conversationId && result.conversationId !== activeConversationId) {
          setActiveConversationId(result.conversationId);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `${t('components.chatPanel.errorFormat')} ${result.message}` }]);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: t('components.chatPanel.connectionError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {view === 'list' ? (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-inherit shrink-0">
            <button
              type="button"
              onClick={handleCreateConversation}
              disabled={isLoadingConversations}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {isLoadingConversations ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t('components.chatPanel.newConversation')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('components.chatPanel.loadingConversations')}
              </div>
            ) : conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-3">
                <MessageCircle className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {t('components.chatPanel.noConversationsTitle')}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {conversationError || t('components.chatPanel.noConversationsDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('components.chatPanel.conversationsTitle')}
                </p>
                {conversationError && (
                  <p className="text-xs text-red-500">{conversationError}</p>
                )}
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="group flex items-start gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenConversation(conversation.id)}
                      className="min-w-0 flex-1 text-left px-1 py-1"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {conversation.title || t('components.chatPanel.untitledConversation')}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {conversation.book_title || bookTitle || t('components.chatPanel.noBookTitle')}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handleDeleteConversation(event, conversation.id)}
                      disabled={deletingConversationId === conversation.id}
                      aria-label={t('components.chatPanel.deleteConversation')}
                      title={t('components.chatPanel.deleteConversation')}
                      className="shrink-0 p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
                    >
                      {deletingConversationId === conversation.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-inherit shrink-0">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('components.chatPanel.backToConversations')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('components.chatPanel.loadingMessages')}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="p-3 border-t border-inherit shrink-0">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isLoadingMessages}
                placeholder={t('components.chatPanel.placeholder')}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 dark:placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || isLoadingMessages || !input.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
