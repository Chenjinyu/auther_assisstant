import { KnowledgeChunk, Theme } from '../types';

export const FALLBACK_MESSAGE = "I do not have the answer, but the author will be notified via email, who will add the related information to the web application.";

// Simulate a Vector Database Content
export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: '1',
    content: "The author is a Senior Full Stack Engineer with 8 years of experience specializing in React, Node.js, and Cloud Architecture.",
    keywords: ['experience', 'role', 'job', 'title', 'senior', 'years']
  },
  {
    id: '2',
    content: "The author is proficient in TypeScript, Python, Go, and Rust. They have extensive experience with AWS and Google Cloud Platform.",
    keywords: ['skills', 'languages', 'tech stack', 'technology', 'aws', 'gcp', 'typescript', 'python']
  },
  {
    id: '3',
    content: "The author created this application using the Gemini API, React, and Tailwind CSS to demonstrate RAG capabilities.",
    keywords: ['project', 'app', 'demo', 'gemini', 'stack', 'how']
  },
  {
    id: '4',
    content: "The author resides in San Francisco, CA and enjoys hiking, photography, and contributing to open source projects in their free time.",
    keywords: ['location', 'city', 'hobbies', 'personal', 'interests', 'live']
  },
  {
    id: '5',
    content: "You can contact the author via email at author@example.com or via LinkedIn at linkedin.com/in/author-demo.",
    keywords: ['contact', 'email', 'linkedin', 'reach', 'message']
  }
];

export const THEME_STYLES: Record<Theme, { bg: string; text: string; input: string; botBubble: string; userBubble: string; border: string }> = {
  [Theme.BLACK]: {
    bg: 'bg-gray-950',
    text: 'text-gray-100',
    input: 'bg-gray-900 border-gray-800 focus:border-blue-500',
    botBubble: 'bg-gray-900',
    userBubble: 'bg-blue-600',
    border: 'border-gray-800'
  },
  [Theme.DARK_BLUE]: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    input: 'bg-slate-800 border-slate-700 focus:border-blue-400',
    botBubble: 'bg-slate-800',
    userBubble: 'bg-indigo-600',
    border: 'border-slate-800'
  },
  [Theme.LIGHT_ORANGE]: {
    bg: 'bg-orange-50',
    text: 'text-gray-900',
    input: 'bg-white border-orange-200 focus:border-orange-500',
    botBubble: 'bg-white shadow-sm',
    userBubble: 'bg-orange-500 text-white',
    border: 'border-orange-200'
  },
  [Theme.WHITE]: {
    bg: 'bg-white',
    text: 'text-gray-900',
    input: 'bg-gray-50 border-gray-200 focus:border-gray-400',
    botBubble: 'bg-gray-100',
    userBubble: 'bg-black text-white',
    border: 'border-gray-200'
  }
};
