import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PDF_FILES, ARTICLE_IDS } from '../../config/constants';
import { loadPdfDocuments } from '../../services/dataLoader/pdfLoader';
import { loadArticleDocuments } from '../../services/dataLoader/articleLoader';

type SourceType = 'pdf' | 'article';

const resolveSourceType = (
  sourceName: string,
  sourceType?: SourceType
): SourceType | null => {
  if (sourceType === 'pdf') {
    return PDF_FILES.includes(sourceName) ? 'pdf' : null;
  }
  if (sourceType === 'article') {
    return ARTICLE_IDS.includes(sourceName) ? 'article' : null;
  }
  if (PDF_FILES.includes(sourceName)) return 'pdf';
  if (ARTICLE_IDS.includes(sourceName)) return 'article';
  return null;
};

export const registerReadSourceTool = (server: McpServer): void => {
  server.registerTool(
    'read_source',
    {
      title: 'Read Source',
      description:
        'Returns the full raw text of one specific PDF or article from the Lev-Boots ' +
        "project's local knowledge base, given its exact name/id (see " +
        'list_knowledge_sources for the available names/ids).',
      inputSchema: {
        sourceName: z.string(),
        sourceType: z.enum(['pdf', 'article']).optional(),
      },
    },
    async ({ sourceName, sourceType }) => {
      try {
        const resolvedType = resolveSourceType(sourceName, sourceType);

        if (!resolvedType) {
          return {
            content: [
              {
                type: 'text',
                text: `No source found matching "${sourceName}"${
                  sourceType ? ` of type "${sourceType}"` : ''
                }.`,
              },
            ],
            isError: true,
          };
        }

        const documents =
          resolvedType === 'pdf'
            ? await loadPdfDocuments()
            : await loadArticleDocuments();

        const match = documents.find((doc) => doc.sourceId === sourceName);

        if (!match) {
          return {
            content: [
              {
                type: 'text',
                text: `Source "${sourceName}" was expected but could not be loaded.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: match.text }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to read source: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
