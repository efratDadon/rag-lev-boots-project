import { RawDocument } from './pdfLoader';
import { GIST_BASE_URL, ARTICLE_IDS } from '../../config/constants';

export const loadArticleDocuments = async (): Promise<RawDocument[]> => {
  const documents: RawDocument[] = [];

  for (let i = 0; i < ARTICLE_IDS.length; i++) {
    const articleId = ARTICLE_IDS[i];
    const url = `${GIST_BASE_URL}/article-${i + 1}_${articleId}.md`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch article "${articleId}" from ${url}: ${response.status}`
      );
    }

    const text = await response.text();
    documents.push({ sourceId: articleId, text });
  }

  return documents;
};
