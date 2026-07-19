import { embedTexts } from './services/dataLoader/embeddings';
import { findSimilarChunks } from './services/answerService/similaritySearch';

const question =
  "How does the internal lab data about the LV-1's 4.5-minute battery limit compare to what's described in the official documentation about Lev-Boots power constraints?";

const run = async () => {
  const [embedding] = await embedTexts([question], 'RETRIEVAL_QUERY');
  const chunks = await findSimilarChunks(embedding, 5);
  console.log('--- top 5 retrieved chunks ---');
  for (const c of chunks) {
    console.log(c.source, c.sourceId, 'distance:', c.distance);
  }
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
  });
