import { KnowledgeChunk, SearchResult } from '../types';
import { KNOWLEDGE_BASE } from '../lib/constants';

/**
 * In a real application, this service would:
 * 1. Call an embedding model (e.g., Gemini embedding) to convert the query to a vector.
 * 2. Send that vector to a database like Pinecone, Milvus, or Weaviate.
 * 3. Return the semantically closest text chunks.
 *
 * For this demo, we simulate "similarity search" using a basic keyword overlap and
 * string inclusion scoring algorithm to run entirely in the browser without external DB dependencies.
 */

export const searchVectorDatabase = async (query: string): Promise<string[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));

  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/);

  const results: SearchResult[] = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    const normalizedContent = chunk.content.toLowerCase();

    // Scoring logic:
    // 1. Exact keyword matches from the metadata
    chunk.keywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) score += 5;
    });

    // 2. Token overlap in content
    queryTokens.forEach(token => {
        if (token.length > 3 && normalizedContent.includes(token)) {
            score += 1;
        }
    });

    return { chunk, score };
  });

  // Filter results that have some relevance and sort by score
  const sorted = results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.chunk.content);

  // Return top 2 most relevant chunks
  return sorted.slice(0, 2);
};
