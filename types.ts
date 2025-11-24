export enum Theme {
  BLACK = 'BLACK',
  DARK_BLUE = 'DARK_BLUE',
  LIGHT_ORANGE = 'LIGHT_ORANGE',
  WHITE = 'WHITE',
}

export enum AuthProvider {
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook',
  APPLE = 'Apple',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: AuthProvider;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  keywords: string[];
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}