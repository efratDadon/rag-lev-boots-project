import { loadPdfDocuments } from './pdfLoader';
import { chunkText } from './chunker';
import { embedTexts } from './embeddings';
import { isSourceAlreadyLoaded, saveChunks, ChunkToStore } from './store';

const SOURCE = 'pdf';

export const loadPdfData = async (): Promise<void> => {
  const documents = await loadPdfDocuments();

  for (const document of documents) {
    const alreadyLoaded = await isSourceAlreadyLoaded(SOURCE, document.sourceId);
    if (alreadyLoaded) {
      console.log(`Skipping already-loaded PDF: ${document.sourceId}`);
      continue;
    }

    const chunks = chunkText(document.text);
    console.log(`Embedding ${chunks.length} chunks from ${document.sourceId}`);
    const embeddings = await embedTexts(chunks, 'RETRIEVAL_DOCUMENT');

    const chunksToStore: ChunkToStore[] = chunks.map((content, index) => ({
      source: SOURCE,
      sourceId: document.sourceId,
      chunkIndex: index,
      content,
      embedding: embeddings[index],
    }));

    await saveChunks(chunksToStore);
    console.log(`Stored ${chunksToStore.length} chunks from ${document.sourceId}`);
  }
};
