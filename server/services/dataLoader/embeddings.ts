import { getGenAI, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from './geminiClient';
import { withRetry } from './withRetry';

const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES_MS = 500;

type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const embedBatch = async (
  texts: string[],
  taskType: EmbeddingTaskType
): Promise<number[][]> => {
  const response = await withRetry(() =>
    getGenAI().models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
      config: {
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    })
  );

  if (!response.embeddings || response.embeddings.length !== texts.length) {
    throw new Error('Gemini API returned an unexpected number of embeddings');
  }

  return response.embeddings.map((embedding) => {
    if (!embedding.values) {
      throw new Error('Gemini API returned an embedding with no values');
    }
    return embedding.values;
  });
};

export const embedTexts = async (
  texts: string[],
  taskType: EmbeddingTaskType = 'RETRIEVAL_DOCUMENT'
): Promise<number[][]> => {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await embedBatch(batch, taskType);
    allEmbeddings.push(...batchEmbeddings);

    if (i + BATCH_SIZE < texts.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return allEmbeddings;
};
