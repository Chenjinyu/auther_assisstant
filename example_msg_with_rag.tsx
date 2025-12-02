'use client';

import { useState, useCallback } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { Sources, Source } from '@/components/ai-elements/sources';
import { Loader } from '@/components/ai-elements/loader';
import { Copy, RefreshCcw, ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface RAGSource {
  id: string;
  title: string;
  url?: string;
  content: string;
  relevanceScore: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RAGSource[];
  timestamp: Date;
  isStreaming?: boolean;
}

// =============================================================================
// RAG SERVICE (Mock - Replace with your actual implementation)
// =============================================================================

/**
 * This is where you integrate your RAG backend.
 * Replace this with your actual embedding query and retrieval logic.
 */
async function queryRAGSystem(userQuestion: string): Promise<{
  answer: string;
  sources: RAGSource[];
}> {
  // Simulating API call to your RAG backend
  // In production, this would:
  // 1. Send the question to your embedding model
  // 2. Query your vector database (Pinecone, Weaviate, Chroma, etc.)
  // 3. Retrieve relevant document chunks
  // 4. Send context + question to LLM for generation
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency

  // Mock response - replace with actual RAG implementation
  return {
    answer: `Based on the information I found about you, here's what I can share regarding "${userQuestion}":\n\nThis is a simulated response from your RAG system. In a real implementation, this would contain information retrieved from your personal knowledge base, documents, or profile data that matches the user's query.`,
    sources: [
      {
        id: '1',
        title: 'Personal Profile',
        url: '/docs/profile',
        content: 'Relevant excerpt from your profile documentation...',
        relevanceScore: 0.95,
      },
      {
        id: '2',
        title: 'Work Experience',
        url: '/docs/experience',
        content: 'Relevant excerpt about work history...',
        relevanceScore: 0.87,
      },
    ],
  };
}

// =============================================================================
// STREAMING VERSION (Optional - for real-time response streaming)
// =============================================================================

async function* streamRAGResponse(userQuestion: string): AsyncGenerator<{
  chunk?: string;
  sources?: RAGSource[];
  done?: boolean;
}> {
  // First, retrieve sources
  const sources: RAGSource[] = [
    {
      id: '1',
      title: 'Personal Profile',
      url: '/docs/profile',
      content: 'Your profile information...',
      relevanceScore: 0.95,
    },
  ];
  
  yield { sources };

  // Then stream the response
  const fullResponse = `Here's what I found about "${userQuestion}"...`;
  const words = fullResponse.split(' ');
  
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 50));
    yield { chunk: word + ' ' };
  }

  yield { done: true };
}

// =============================================================================
// MAIN CHAT COMPONENT
// =============================================================================

export default function RAGChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMessageId = `assistant-${Date.now()}`;
    const placeholderMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      // Query your RAG system
      const { answer, sources } = await queryRAGSystem(userMessage.content);

      // Update with the complete response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: answer, sources, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      // Handle error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error while searching for information. Please try again.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Handle regenerating a response
  const handleRegenerate = useCallback(async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the preceding user message
    const userMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find(m => m.role === 'user');
    
    if (!userMessage) return;

    setIsLoading(true);
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isStreaming: true, content: '' } : msg
      )
    );

    try {
      const { answer, sources } = await queryRAGSystem(userMessage.content);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: answer, sources, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Copy message content
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Ask Me Anything</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about me and I&apos;ll search my knowledge base to find answers.
        </p>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <Conversation>
          <ConversationContent className="p-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="size-12 text-muted-foreground" />}
                title="Start a conversation"
                description="Ask any question about me - my background, experience, skills, or interests. I'll search my knowledge base to find relevant information."
              >
                {/* Suggested questions */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[
                    "What's your background?",
                    "Tell me about your experience",
                    "What are your skills?",
                    "What projects have you worked on?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 text-sm rounded-full border hover:bg-accent transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  from={message.role}
                  className="mb-6"
                >
                  {/* Avatar */}
                  <div className={`
                    flex items-center justify-center size-8 rounded-full shrink-0
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <User className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </div>

                  <MessageContent className="flex-1 min-w-0">
                    {/* Message text with streaming support */}
                    {message.isStreaming && !message.content ? (
                      <Loader variant="dots" />
                    ) : (
                      <MessageResponse>
                        {message.content}
                      </MessageResponse>
                    )}

                    {/* Sources (for assistant messages) */}
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Sources
                        </p>
                        <Sources>
                          {message.sources.map((source) => (
                            <Source
                              key={source.id}
                              title={source.title}
                              href={source.url}
                            />
                          ))}
                        </Sources>
                      </div>
                    )}

                    {/* Actions (for assistant messages) */}
                    {message.role === 'assistant' && !message.isStreaming && (
                      <MessageActions className="mt-2">
                        <MessageAction
                          icon={<Copy className="size-3.5" />}
                          label="Copy"
                          onClick={() => handleCopy(message.content)}
                        />
                        <MessageAction
                          icon={<RefreshCcw className="size-3.5" />}
                          label="Regenerate"
                          onClick={() => handleRegenerate(message.id)}
                          disabled={isLoading}
                        />
                        <MessageAction
                          icon={<ThumbsUp className="size-3.5" />}
                          label="Good response"
                          onClick={() => console.log('Positive feedback')}
                        />
                        <MessageAction
                          icon={<ThumbsDown className="size-3.5" />}
                          label="Poor response"
                          onClick={() => console.log('Negative feedback')}
                        />
                      </MessageActions>
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <PromptInput>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about me..."
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <PromptInputSubmit disabled={isLoading || !input.trim()} />
          </PromptInput>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Powered by RAG • Responses are generated from indexed personal data
        </p>
      </div>
    </div>
  );
}