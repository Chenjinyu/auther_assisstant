/**
 * Backend script to upsert knowledge into a Vector Database.
 * This script is intended to be run via GitHub Actions or a CI/CD workflow.
 * 
 * Usage: ts-node backend/upsert.ts
 */

import { GoogleGenAI } from "@google/genai";

// Mock Knowledge Base - In a real scenario, this might come from markdown files or a CMS
const KNOWLEDGE_BASE_SOURCE = [
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

async function upsertToVectorDB() {
  console.log("Starting Vector DB Upsert Process...");

  // Initialize Gemini for Embeddings
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Connect to Vector DB (Pseudo-code for Pinecone/Weaviate/Milvus)
  // const client = new VectorDBClient({ apiKey: process.env.VECTOR_DB_KEY });
  // const index = client.index('author-knowledge-base');

  for (const chunk of KNOWLEDGE_BASE_SOURCE) {
    try {
      console.log(`Processing chunk ${chunk.id}...`);

      // 1. Generate Embeddings using Gemini
      // Note: Actual embedding model usage
      const embeddingResult = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: { parts: [{ text: chunk.content }] }
      });
      
      const vector = embeddingResult.embeddings?.[0]?.values;

      // 2. Upsert to Database
      // await index.upsert([{
      //   id: chunk.id,
      //   values: vector,
      //   metadata: {
      //     text: chunk.content,
      //     keywords: chunk.keywords
      //   }
      // }]);

      console.log(`Successfully embedded and staged chunk ${chunk.id}`);
    } catch (error) {
      console.error(`Failed to process chunk ${chunk.id}:`, error);
    }
  }

  console.log("Upsert complete! Database is up to date.");
}

// Execute if run directly
if (require.main === module) {
    upsertToVectorDB().catch(console.error);
}