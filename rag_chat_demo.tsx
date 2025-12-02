import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy, RefreshCw, ThumbsUp, ThumbsDown, FileText, Sparkles } from 'lucide-react';

// =============================================================================
// MOCK RAG SERVICE - Replace with your actual implementation
// =============================================================================

const mockRAGQuery = async (question) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock knowledge base about "you"
  const knowledgeBase = {
    background: {
      answer: "I'm a software engineer with 5+ years of experience in full-stack development. I graduated from Stanford University with a degree in Computer Science. I'm passionate about building user-friendly applications and exploring AI technologies.",
      sources: [
        { id: '1', title: 'Personal Profile', excerpt: 'Software engineer with expertise in React, Node.js, and Python...' },
        { id: '2', title: 'Education', excerpt: 'Stanford University, BS Computer Science, 2018...' }
      ]
    },
    experience: {
      answer: "I've worked at several tech companies including Google (2018-2020) as a Frontend Engineer, and currently at a startup called TechFlow where I lead the product engineering team. My focus has been on building scalable web applications and AI-powered features.",
      sources: [
        { id: '3', title: 'Work Experience', excerpt: 'Google - Frontend Engineer, TechFlow - Lead Engineer...' },
        { id: '4', title: 'Projects', excerpt: 'Led development of customer-facing dashboard used by 10K+ users...' }
      ]
    },
    skills: {
      answer: "My technical skills include: React, TypeScript, Node.js, Python, PostgreSQL, MongoDB, AWS, and recently I've been diving deep into LLMs and RAG systems. I'm also experienced with Agile methodologies and technical leadership.",
      sources: [
        { id: '5', title: 'Technical Skills', excerpt: 'Frontend: React, Vue, TypeScript. Backend: Node.js, Python...' },
        { id: '6', title: 'Certifications', excerpt: 'AWS Solutions Architect, Google Cloud Professional...' }
      ]
    },
    projects: {
      answer: "Some notable projects I've worked on include: 1) A real-time collaboration tool used by 50K+ users, 2) An AI-powered customer support chatbot that reduced ticket volume by 40%, and 3) This RAG-powered personal assistant you're talking to right now!",
      sources: [
        { id: '7', title: 'Project Portfolio', excerpt: 'Collaboration tool, AI chatbot, Personal RAG assistant...' },
        { id: '8', title: 'GitHub', excerpt: 'Open source contributions to React ecosystem...' }
      ]
    },
    default: {
      answer: "I found some information that might help answer your question. Feel free to ask more specific questions about my background, experience, skills, or projects!",
      sources: [
        { id: '9', title: 'General Info', excerpt: 'Various information from personal knowledge base...' }
      ]
    }
  };

  // Simple keyword matching for demo
  const q = question.toLowerCase();
  if (q.includes('background') || q.includes('about') || q.includes('who')) {
    return knowledgeBase.background;
  } else if (q.includes('experience') || q.includes('work') || q.includes('job')) {
    return knowledgeBase.experience;
  } else if (q.includes('skill') || q.includes('tech') || q.includes('know')) {
    return knowledgeBase.skills;
  } else if (q.includes('project') || q.includes('built') || q.includes('create')) {
    return knowledgeBase.projects;
  }
  return knowledgeBase.default;
};

// =============================================================================
// MESSAGE COMPONENT
// =============================================================================

const Message = ({ message, onCopy, onRegenerate, isLast }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-6 animate-fadeIn`}>
      {/* Avatar */}
      <div className={`
        flex items-center justify-center w-9 h-9 rounded-full shrink-0 shadow-sm
        ${isUser 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
          : 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white'
        }
      `}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block p-4 rounded-2xl shadow-sm
          ${isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm' 
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
          }
        `}>
          {/* Loading state */}
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500">Searching knowledge base...</span>
            </div>
          ) : (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && !message.isLoading && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.sources.map((source) => (
              <div 
                key={source.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <FileText size={12} className="text-gray-400" />
                <span>{source.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && !message.isLoading && (
          <div className="mt-2 flex gap-1">
            <button 
              onClick={() => onCopy(message.content)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Copy"
            >
              <Copy size={14} />
            </button>
            {isLast && (
              <button 
                onClick={() => onRegenerate(message.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button 
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
              title="Good response"
            >
              <ThumbsUp size={14} />
            </button>
            <button 
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Poor response"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN CHAT COMPONENT
// =============================================================================

export default function RAGChatDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    const assistantId = `assistant-${Date.now()}`;
    const loadingMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call RAG service
      const { answer, sources } = await mockRAGQuery(userMessage.content);

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, content: answer, sources, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copy
  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Handle regenerate
  const handleRegenerate = async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const userMessage = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
    
    if (!userMessage) return;

    setIsLoading(true);
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isLoading: true, content: '' } : msg
      )
    );

    const { answer, sources } = await mockRAGQuery(userMessage.content);

    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, content: answer, sources, isLoading: false } : msg
      )
    );
    setIsLoading(false);
  };

  // Suggested questions
  const suggestions = [
    "What's your background?",
    "Tell me about your experience",
    "What are your skills?",
    "What projects have you built?",
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl shadow-sm">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Ask Me Anything</h1>
            <p className="text-sm text-gray-500">Powered by RAG • Ask questions about me</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl shadow-lg mb-6">
                <Bot size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Ask any question about me — my background, experience, skills, or projects. 
                I'll search my knowledge base to find relevant information.
              </p>
              
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <Message 
                  key={message.id} 
                  message={message}
                  onCopy={handleCopy}
                  onRegenerate={handleRegenerate}
                  isLast={index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question about me..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}