import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PDF_FILES, ARTICLE_IDS } from '../../config/constants';

export const registerListKnowledgeSourcesTool = (server: McpServer): void => {
  server.registerTool(
    'list_knowledge_sources',
    {
      title: 'List Knowledge Sources',
      description:
        "Returns the list of PDF filenames and article ids stored in the Lev-Boots " +
        "project's local knowledge base. Helpful when a user mentions 'the article', " +
        "'the PDF', or similar without naming it exactly, since this reveals what's " +
        'actually available (separate from any files uploaded to the conversation).',
    },
    async () => {
      const sources = {
        pdfs: PDF_FILES.map((name) => ({ type: 'pdf' as const, name })),
        articles: ARTICLE_IDS.map((id) => ({ type: 'article' as const, id })),
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(sources, null, 2) }],
      };
    }
  );
};
