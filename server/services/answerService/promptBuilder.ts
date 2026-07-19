//בניית הפרומפט משלושה חלקים: ההוראות הכלליות למודל, המידע הספציפי שנשלף מבסיס הנתונים (הקונטקסט), והשאלה של המשתמש.
import { RetrievedChunk } from './similaritySearch';
import { UNANSWERABLE_MESSAGE } from './constants';

export const buildPrompt = (
  userQuestion: string,
  chunks: RetrievedChunk[]
): string => {
  const context = chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] (source: ${chunk.source}/${chunk.sourceId})\n${chunk.chunkContent}`
    )
    .join('\n\n');

  return `You are an assistant answering questions about Lev-Boots, a levitation boot technology, using only the context provided below.

Context:
${context}

Question: ${userQuestion}

Instructions:
- Before answering, check whether the context above actually answers the SPECIFIC question asked - not just whether it mentions the same names, products, or terms. A chunk can reference the exact subject of the question (e.g. a component or product name) without containing any information that answers what is actually being asked.
- Never infer, assume, or extrapolate an answer for a scenario, use case, or combination the context does not explicitly discuss (for example, do not judge something safe or unsafe for a use case that is never mentioned, even if the context covers a related safety topic).
- Match by meaning, not exact wording. If the question uses a different word, synonym, or approximate/garbled phrasing for a concept, component, or metric that the context clearly describes, treat it as answered - do not refuse just because the question's exact words don't literally appear in the context.
- Answer using ONLY information explicitly stated in the context above.
- If the context does not explicitly answer the question, respond with EXACTLY this sentence and nothing else: "${UNANSWERABLE_MESSAGE}"
- Do not explain why you cannot answer, do not restate the question, and do not add any extra commentary in that case.
- When you CAN answer, be concise and factual.

Answer:`;
};
