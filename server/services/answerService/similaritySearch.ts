//מבצע חיפוש רעיוני (סמנטי) בבסיס הנתונים
//שולף החוצה את 5 קטעי הטקסט שהכי קרובים ומדויקים למשמעות של השאלה,
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';

const DEFAULT_TOP_K = 5;

export interface RetrievedChunk {
  id: number;
  source: string;
  sourceId: string;
  chunkContent: string;
  distance: number;
}

interface SimilarityRow {
  id: number;
  source: string;
  source_id: string;
  chunk_content: string;
  distance: number;
}

export const findSimilarChunks = async (
  queryEmbedding: number[],
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedChunk[]> => {
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  const rows = await sequelize.query<SimilarityRow>(
    `SELECT id, source, source_id, chunk_content, embeddings_768 <=> :queryVector::vector AS distance
     FROM knowledge_base
     WHERE embeddings_768 IS NOT NULL
     ORDER BY distance ASC
     LIMIT :topK`,
    {
      replacements: { queryVector: vectorLiteral, topK },
      type: QueryTypes.SELECT,
    }
  );

  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    sourceId: row.source_id,
    chunkContent: row.chunk_content,
    distance: row.distance,
  }));
};
