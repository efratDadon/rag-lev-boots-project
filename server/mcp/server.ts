import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerRagSearchTool } from "./tools/rag_search";
import { registerListKnowledgeSourcesTool } from "./tools/list_knowledge_sources";
import { registerReadSourceTool } from "./tools/read_source";

const server = new McpServer({
  name: "lev-boots-mcp-server",
  version: "1.0.0",
});

registerRagSearchTool(server);
registerListKnowledgeSourcesTool(server);
registerReadSourceTool(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Lev-Boots MCP Server is running on stdio");
}

main().catch((error) => {
  console.error("Fatal error running MCP server:", error);
  process.exit(1);
});