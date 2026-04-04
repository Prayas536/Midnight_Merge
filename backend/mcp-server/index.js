import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const TG_HOST = process.env.TG_HOST || "https://tg-008119db-a7fe-47e2-b707-98d7365142dc.tg-2635877100.i.tgcloud.io";
const TG_GRAPH = process.env.TG_GRAPH_NAME || "NexusHealthGraph";
const TG_TOKEN = process.env.TG_TOKEN || "";
const TG_SECRET = process.env.TG_SECRET || "hrctcpmvckkr3n9cmeg06lop0tu4k32b";

const server = new Server(
  {
    name: "tigergraph-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Function to safely execute queries
async function runTigerGraphQuery(queryName, params = {}) {
    try {
        let headers = { "Content-Type": "application/json" };
        if (TG_TOKEN && TG_TOKEN !== 'your_api_token') {
            headers["Authorization"] = `Bearer ${TG_TOKEN}`;
        } else if (TG_SECRET) {
            headers["Authorization"] = `Bearer ${TG_SECRET}`; // Fallback, works on some endpoints
        }
        
        console.error(`Executing Query: ${queryName}`); // Log to stderr for MCP
        
        // Use the standard REST++ endpoint for installed queries
        const response = await axios.get(`${TG_HOST}/restpp/query/${TG_GRAPH}/${queryName}`, {
            params: params,
            headers: headers
        });
        
        return response.data;
    } catch (error) {
        let msg = error.message;
        if (error.response) {
            msg = `TigerGraph Error (${error.response.status}): ${JSON.stringify(error.response.data)}`;
        }
        console.error(msg);
        throw new Error(msg);
    }
}

async function getTigerGraphSchema() {
    try {
        let headers = { "Content-Type": "application/json" };
        if (TG_TOKEN && TG_TOKEN !== 'your_api_token') {
            headers["Authorization"] = `Bearer ${TG_TOKEN}`;
        } else if (TG_SECRET) {
            headers["Authorization"] = `Bearer ${TG_SECRET}`;
        }
        
        const response = await axios.get(`${TG_HOST}/gsqlserver/gsql/schema?graph=${TG_GRAPH}`, {
            headers: headers
        });
        
        return response.data;
    } catch (error) {
        let msg = error.message;
        if (error.response) {
             msg = `TigerGraph Error (${error.response.status}): ${JSON.stringify(error.response.data)}`;
        }
        console.error(msg);
        throw new Error(msg);
    }
}

// Tool Registration
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_graph_schema",
                description: "Retrieves the TigerGraph schema (Vertices and Edges) for the NexusHealthGraph.",
                inputSchema: { type: "object", properties: {} }
            },
            {
                name: "run_built_in_query",
                description: "Runs an installed GSQL query on TigerGraph.",
                inputSchema: {
                    type: "object",
                    properties: {
                        queryName: { type: "string", description: "The name of the GSQL query to execute." },
                        params: { type: "object", description: "Query parameters (e.g., {'p_id': 'DEMO-PARENT-001'}).", additionalProperties: true }
                    },
                    required: ["queryName"]
                }
            }
        ]
    };
});

// Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "get_graph_schema") {
            const result = await getTigerGraphSchema();
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        
        if (request.params.name === "run_built_in_query") {
            const { queryName, params } = request.params.arguments;
            const result = await runTigerGraphQuery(queryName, params);
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }

        throw new Error("Tool not found");
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("TigerGraph MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Server fatal error:", error);
    process.exit(1);
});
