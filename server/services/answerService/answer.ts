//שורות 1-4: ייבוא של כל ארבעת השלבים הדרושים לתהליך (הפיכה לווקטור, חיפוש, בניית פרומפט, ויצירת התשובה).
import { embedTexts } from '../dataLoader/embeddings';
import { findSimilarChunks } from './similaritySearch';
import { buildPrompt } from './promptBuilder';
import { generateAnswer } from './generate';
import { UNANSWERABLE_MESSAGE, MAX_RELEVANT_DISTANCE } from './constants';

export const answerQuestion = async (userQuestion: string): Promise<string> => {
  const [questionEmbedding] = await embedTexts([userQuestion], 'RETRIEVAL_QUERY');
  const chunks = await findSimilarChunks(questionEmbedding);

  // Chunks are ORDER BY distance ASC, so chunks[0] is already the best match.
  // Skip the LLM call entirely when nothing retrieved is even topically close.
  if (chunks.length === 0 || chunks[0].distance > MAX_RELEVANT_DISTANCE) {
    console.error(
      `[ask] GATED (no LLM call) - question="${userQuestion}" bestDistance=${chunks[0]?.distance ?? 'n/a'} threshold=${MAX_RELEVANT_DISTANCE}`
    );
    return UNANSWERABLE_MESSAGE;
  }

  console.error(
    `[ask] CALLING LLM - question="${userQuestion}" bestDistance=${chunks[0].distance} threshold=${MAX_RELEVANT_DISTANCE}`
  );
  const prompt = buildPrompt(userQuestion, chunks);
  return generateAnswer(prompt);
};
