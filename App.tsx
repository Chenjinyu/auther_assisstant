import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User as UserIcon, LogOut, Menu, X, Loader2, Bot, Info, Search } from 'lucide-react';
import { Theme, User, Message, AuthProvider } from './types';
import { THEME_STYLES, FALLBACK_MESSAGE } from './constants';
import { searchVectorDatabase } from './services/vectorService';
import { getCachedResponse, setCachedResponse } from './services/cacheService';
import { generateRAGResponse } from './services/geminiService';

// --- Sub-Components (defined here for single-file adherence in this specific output structure) ---

const LoginModal = ({ 
  isOpen, 
  onClose, 
  onLogin 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (provider: AuthProvider) => void 
}) => {
  if (!isOpen) return null;

  const handleLogin = (provider: AuthProvider) => {
    onLogin(provider);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-6">Sign in to save your chat history.</p>
        
        <div className="space-y-3">
          <button 
            onClick={() => handleLogin(AuthProvider.GOOGLE)}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          
          <button 
            onClick={() => handleLogin(AuthProvider.FACEBOOK)}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1864D9] text-white font-medium py-3 px-4 rounded-xl transition-all"
          >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>
          
          <button 
            onClick={() => handleLogin(AuthProvider.APPLE)}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.48-1.23 3.93-1.14 1.35.08 2.39.84 2.84 1.42-2.73 1.4-2.3 5.48.51 6.71-.35 1.13-1.09 2.93-2.36 5.24zm3.03-15.65c.57-1.18.33-2.83-.88-4.04-1.29-1.07-3.08-.68-3.8.37-.53 1.05-.22 2.76 1.05 4.04 1.19 1.06 2.87.67 3.63-.37z"/></svg>
            Continue with Apple
          </button>
        </div>
        <button onClick={onClose} className="mt-6 text-sm text-gray-500 hover:text-gray-900 w-full text-center">
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [theme, setTheme] = useState<Theme>(Theme.WHITE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const styles = THEME_STYLES[theme];

  // Load history from local storage on mount (simulating 10-day retention)
  useEffect(() => {
    const savedUser = localStorage.getItem('chat_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      
      const historyKey = `chat_history_${JSON.parse(savedUser).id}`;
      const savedHistory = localStorage.getItem(historyKey);
      
      if (savedHistory) {
        const parsedHistory: Message[] = JSON.parse(savedHistory);
        const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
        const recentHistory = parsedHistory.filter(m => m.timestamp > tenDaysAgo);
        setMessages(recentHistory);
      }
    } else {
        // Initial Greeting
        setMessages([{
            id: 'init',
            role: 'assistant',
            content: "Hello! I'm the AI Assistant for the author. Ask me anything about their experience, skills, or how to contact them.",
            timestamp: Date.now()
        }]);
    }
  }, []);

  // Save history when messages change, if logged in
  useEffect(() => {
    if (user) {
      const historyKey = `chat_history_${user.id}`;
      localStorage.setItem(historyKey, JSON.stringify(messages));
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = (provider: AuthProvider) => {
    // Simulate user data
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: 'Demo User',
      email: 'user@example.com',
      avatar: `https://picsum.photos/seed/${provider}/200`,
      provider: provider
    };
    setUser(mockUser);
    localStorage.setItem('chat_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]); // Clear view
    localStorage.removeItem('chat_user');
    // We intentionally keep the history in localStorage to simulate "cloud" persistence retention
    // but clear the current view.
     setMessages([{
        id: 'init-guest',
        role: 'assistant',
        content: "Hello! I'm the AI Assistant. Please login to save our conversation.",
        timestamp: Date.now()
    }]);
  };

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Check Cache first
      const cached = getCachedResponse(userMsg.content);
      
      let finalResponse = "";

      if (cached) {
        finalResponse = cached;
        // Simulate slight delay for realism even on cache hit
        await new Promise(r => setTimeout(r, 400));
      } else {
        // 2. Vector Search (Simulation)
        // In a real app, this sends the query to a backend which embeds it and queries Pinecone/Weaviate
        const contextContexts = await searchVectorDatabase(userMsg.content);

        // 3. Generate Answer using Gemini
        finalResponse = await generateRAGResponse(userMsg.content, contextContexts);

        // 4. Update Cache (only if it's not a fallback response)
        if (finalResponse !== FALLBACK_MESSAGE) {
            setCachedResponse(userMsg.content, finalResponse);
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, something went wrong processing your request.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-500 ${styles.bg}`}>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />

      {/* Header */}
      <header className={`flex items-center justify-between p-4 border-b ${styles.border} backdrop-blur-md sticky top-0 z-10 bg-opacity-80 ${styles.bg}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === Theme.LIGHT_ORANGE ? 'bg-orange-200' : 'bg-blue-500/20'}`}>
                <Bot className={`w-6 h-6 ${styles.text}`} />
            </div>
          <div>
            <h1 className={`font-bold text-lg ${styles.text}`}>AuthorAI</h1>
            <p className={`text-xs opacity-60 ${styles.text}`}>Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="flex bg-gray-200/20 p-1 rounded-full border border-white/10">
                {(Object.keys(THEME_STYLES) as Theme[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`w-6 h-6 rounded-full mx-1 transition-transform hover:scale-110 border-2 ${theme === t ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: t === Theme.BLACK ? '#111' : t === Theme.DARK_BLUE ? '#0f172a' : t === Theme.LIGHT_ORANGE ? '#ffedd5' : '#fff' }}
                        aria-label={`Switch to ${t} theme`}
                    />
                ))}
            </div>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-500/20">
              <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-300" />
              <div className="text-sm hidden lg:block">
                <p className={`font-medium ${styles.text}`}>{user.name}</p>
                <p className={`text-xs opacity-60 ${styles.text}`}>Via {user.provider}</p>
              </div>
              <button onClick={handleLogout} className={`p-2 rounded-full hover:bg-gray-500/10 ${styles.text}`}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === Theme.LIGHT_ORANGE 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
            className={`md:hidden p-2 ${styles.text}`}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
            {showMobileMenu ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
          <div className={`md:hidden absolute top-16 left-0 w-full z-20 p-4 border-b ${styles.border} ${styles.bg} shadow-lg`}>
              <div className="flex justify-between items-center mb-4">
                  <span className={styles.text}>Theme</span>
                   <div className="flex gap-2">
                    {(Object.keys(THEME_STYLES) as Theme[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`w-6 h-6 rounded-full border ${theme === t ? 'border-blue-500' : 'border-gray-500'}`}
                            style={{ backgroundColor: t === Theme.BLACK ? '#111' : t === Theme.DARK_BLUE ? '#0f172a' : t === Theme.LIGHT_ORANGE ? '#ffedd5' : '#fff' }}
                        />
                    ))}
                </div>
              </div>
              {user ? (
                  <button onClick={handleLogout} className={`w-full py-2 flex items-center justify-center gap-2 border rounded ${styles.text} ${styles.border}`}>
                      <LogOut className="w-4 h-4" /> Logout
                  </button>
              ) : (
                  <button onClick={() => { setShowLogin(true); setShowMobileMenu(false); }} className="w-full py-2 bg-blue-600 text-white rounded">
                      Sign In
                  </button>
              )}
          </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center opacity-50">
                <Bot className={`w-16 h-16 mb-4 ${styles.text}`} />
                <p className={`${styles.text} text-center`}>Ask me about the author's work.</p>
             </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative group ${
                msg.role === 'user' ? styles.userBubble : styles.botBubble
              }`}
            >
                {/* Icon for Bot */}
                {msg.role === 'assistant' && (
                    <div className="absolute -left-10 top-0 p-1.5 rounded-full bg-gray-200/20 border border-white/10">
                         <Bot className={`w-5 h-5 ${styles.text}`} />
                    </div>
                )}
                
              <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : styles.text}`}>
                {msg.content}
              </div>
              
              {/* Timestamp */}
              <div className={`text-[10px] mt-2 text-right opacity-50 ${msg.role === 'user' ? 'text-white' : styles.text}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className={`relative ml-10 rounded-2xl p-4 ${styles.botBubble}`}>
                <div className="flex gap-1.5">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${styles.text} bg-current`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${styles.text} bg-current`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${styles.text} bg-current`} style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className={`p-4 ${styles.bg} border-t ${styles.border}`}>
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Ask a question about the author..." : "Sign in to save history, or just ask away..."}
            rows={1}
            className={`w-full pr-12 pl-4 py-4 rounded-2xl outline-none resize-none shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50 ${styles.input} ${styles.text}`}
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl transition-all ${
              !input.trim() || isLoading
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className={`text-center mt-2 text-[10px] opacity-40 ${styles.text}`}>
            AI can make mistakes. Please verify important information.
        </div>
      </footer>
    </div>
  );
}