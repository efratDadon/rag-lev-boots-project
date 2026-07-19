import { fetchAllSlackMessages } from './slackLoader';
import { groupAndWindowMessages } from './slackChunker';
import { embedTexts } from './embeddings';
import { isSourceAlreadyLoaded, saveChunks, ChunkToStore } from './store';

const SOURCE = 'slack';

export const loadSlack = async (): Promise<void> => {
  const messages = await fetchAllSlackMessages();
  console.log(`Fetched ${messages.length} total Slack messages across all channels`);

  const threadWindows = groupAndWindowMessages(messages);
  console.log(`Grouped into ${threadWindows.size} Slack threads`);

  for (const [threadId, chunks] of threadWindows) {
    const alreadyLoaded = await isSourceAlreadyLoaded(SOURCE, threadId);
    if (alreadyLoaded) {
      console.log(`Skipping already-loaded Slack thread: ${threadId}`);
      continue;
    }

    console.log(`Embedding ${chunks.length} chunk(s) from thread ${threadId}`);
    const embeddings = await embedTexts(chunks, 'RETRIEVAL_DOCUMENT');

    const chunksToStore: ChunkToStore[] = chunks.map((content, index) => ({
      source: SOURCE,
      sourceId: threadId,
      chunkIndex: index,
      content,
      embedding: embeddings[index],
    }));

    await saveChunks(chunksToStore);
    console.log(`Stored ${chunksToStore.length} chunk(s) from thread ${threadId}`);
  }
};
