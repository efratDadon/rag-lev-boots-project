const WORDS_PER_CHUNK = 400;

export const chunkText = (
  text: string,
  wordsPerChunk: number = WORDS_PER_CHUNK
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }

  return chunks;
};
