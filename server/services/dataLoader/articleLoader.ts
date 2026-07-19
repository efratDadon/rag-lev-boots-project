import { RawDocument } from './pdfLoader';

const GIST_BASE_URL =
  'https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw';

const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety',
];

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
