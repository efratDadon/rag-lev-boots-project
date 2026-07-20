import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ask } from '../../services/ragService';

export const registerRagSearchTool = (server: McpServer): void => {
  server.registerTool(
    'rag_search',
    {
      title: 'RAG Search',
      description:
        'Answers a question about Lev-Boots (a levitation boot technology) using the ' +
        "project's local knowledge base (PDFs, articles, and internal Slack history).",
      inputSchema: {
        question: z.string(),
      },
    },
    async ({ question }) => {
      try {
        const answer = await ask(question);
        return {
          content: [{ type: 'text', text: answer }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get an answer: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
