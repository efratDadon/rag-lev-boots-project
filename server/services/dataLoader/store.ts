// שמירת המקטעים והייצוגים הווקטוריים בטבלה `knowledge_base
//בודק לפני כן אם קובץ מסוים כבר הוכנס בעבר כדי למנוע כפילויות
import KnowledgeBase from '../../models/KnowledgeBase';

export interface ChunkToStore {
  source: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

export const isSourceAlreadyLoaded = async (
  source: string,
  sourceId: string
): Promise<boolean> => {
  const count = await KnowledgeBase.count({
    where: { source, source_id: sourceId },
  });

  return count > 0;
};

export const saveChunks = async (chunks: ChunkToStore[]): Promise<void> => {
  if (chunks.length === 0) return;

  await KnowledgeBase.bulkCreate(
    chunks.map((chunk) => ({
      source: chunk.source,
      source_id: chunk.sourceId,
      chunk_index: chunk.chunkIndex,
      chunk_content: chunk.content,
      embeddings_768: chunk.embedding,
    }))
  );
};
