import { startMcpServer } from './mcp.js'

startMcpServer().catch((err) => {
  console.error('MCP server error:', err)
  process.exit(1)
})
