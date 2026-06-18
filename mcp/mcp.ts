import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  getIssues,
  getIssue,
  getIssueByIdentifier,
  getTeams,
  getProjects,
  getUsers,
  getLabels,
  getNextIdentifier,
  createIssue,
  updateIssue,
  deleteIssue,
  archiveIssue,
  unarchiveIssue,
  mapRow,
} from '../lib/db.js'

const server = new McpServer(
  { name: 'project-manager', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// --- list_issues ---
server.registerTool(
  'list_issues',
  {
    description: 'List all issues with optional filters. Returns issues matching the criteria. By default excludes archived issues.',
    inputSchema: z.object({
      state: z.enum(['backlog', 'todo', 'in_progress', 'done', 'canceled']).optional().describe('Filter by issue state'),
      teamId: z.string().optional().describe('Filter by team ID'),
      projectId: z.string().optional().describe('Filter by project ID'),
      assigneeId: z.string().optional().describe('Filter by assignee user ID'),
      priority: z.enum(['no_priority', 'low', 'medium', 'high', 'urgent']).optional().describe('Filter by priority'),
      archived: z.boolean().optional().describe('Filter by archived status. Default: false (excludes archived)'),
    }),
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    let rows = await getIssues({
      teamId: args.teamId,
      state: args.state,
      projectId: args.projectId,
      assigneeId: args.assigneeId,
      archived: args.archived,
    })

    if (args.priority) {
      rows = rows.filter((r) => r.priority === args.priority)
    }

    const issues = rows.map(mapRow)
    return {
      content: [{ type: 'text', text: JSON.stringify(issues, null, 2) }],
    }
  }
)

// --- get_issue ---
server.registerTool(
  'get_issue',
  {
    description: 'Get a single issue by ID or identifier (e.g., "ENG-1").',
    inputSchema: z.object({
      id: z.string().optional().describe('Issue UUID or identifier like "ENG-1"'),
    }),
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    const row = args.id ? (await getIssue(args.id)) || (await getIssueByIdentifier(args.id)) : null
    if (!row) {
      return {
        content: [{ type: 'text', text: 'Issue not found' }],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(mapRow(row), null, 2) }],
    }
  }
)

// --- create_issue ---
server.registerTool(
  'create_issue',
  {
    description: 'Create a new issue. Requires title and teamId. Auto-generates identifier.',
    inputSchema: z.object({
      title: z.string().min(1).describe('Issue title'),
      description: z.string().optional().describe('Issue description'),
      teamId: z.string().describe('Team ID'),
      state: z.enum(['backlog', 'todo', 'in_progress', 'done', 'canceled']).optional().describe('Issue state'),
      priority: z.enum(['no_priority', 'low', 'medium', 'high', 'urgent']).optional().describe('Issue priority'),
      assigneeId: z.string().optional().describe('Assignee user ID'),
      projectId: z.string().optional().describe('Project ID'),
      labelIds: z.array(z.string()).optional().describe('Array of label IDs'),
    }),
    annotations: { readOnlyHint: false },
  },
  async (args) => {
    const identifier = await getNextIdentifier(args.teamId)
    const now = Date.now()
    const data = {
      id: crypto.randomUUID(),
      identifier,
      title: args.title,
      description: args.description || '',
      teamId: args.teamId,
      state: args.state || 'backlog',
      priority: args.priority || 'no_priority',
      assigneeId: args.assigneeId || null,
      projectId: args.projectId || null,
      cycleId: null,
      labelIds: JSON.stringify(args.labelIds || []),
      createdAt: now,
      updatedAt: now,
    }
    await createIssue(data)
    return {
      content: [{ type: 'text', text: `Created issue ${identifier}: ${args.title}` }],
    }
  }
)

// --- update_issue ---
server.registerTool(
  'update_issue',
  {
    description: 'Update an existing issue by ID or identifier. Only provided fields are changed.',
    inputSchema: z.object({
      id: z.string().describe('Issue UUID or identifier like "ENG-1"'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      state: z.enum(['backlog', 'todo', 'in_progress', 'done', 'canceled']).optional().describe('New state'),
      priority: z.enum(['no_priority', 'low', 'medium', 'high', 'urgent']).optional().describe('New priority'),
      assigneeId: z.string().optional().describe('New assignee user ID'),
      projectId: z.string().optional().describe('New project ID'),
      labelIds: z.array(z.string()).optional().describe('New array of label IDs'),
    }),
    annotations: { readOnlyHint: false },
  },
  async (args) => {
    const issue = (await getIssue(args.id)) || (await getIssueByIdentifier(args.id))
    if (!issue) {
      return {
        content: [{ type: 'text', text: `Issue ${args.id} not found` }],
        isError: true,
      }
    }

    const changes: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.title !== undefined) changes.title = args.title
    if (args.description !== undefined) changes.description = args.description
    if (args.state !== undefined) changes.state = args.state
    if (args.priority !== undefined) changes.priority = args.priority
    if (args.assigneeId !== undefined) changes.assigneeId = args.assigneeId
    if (args.projectId !== undefined) changes.projectId = args.projectId
    if (args.labelIds !== undefined) changes.labelIds = JSON.stringify(args.labelIds)

    await updateIssue(issue.id, changes as Parameters<typeof updateIssue>[1])
    return {
      content: [{ type: 'text', text: `Updated issue ${args.id}` }],
    }
  }
)

// --- delete_issue ---
server.registerTool(
  'delete_issue',
  {
    description: 'Delete an issue by ID or identifier.',
    inputSchema: z.object({
      id: z.string().describe('Issue UUID or identifier like "ENG-1"'),
    }),
    annotations: { readOnlyHint: false },
  },
  async (args) => {
    const issue = (await getIssue(args.id)) || (await getIssueByIdentifier(args.id))
    if (!issue) {
      return {
        content: [{ type: 'text', text: `Issue ${args.id} not found` }],
        isError: true,
      }
    }
    await deleteIssue(issue.id)
    return {
      content: [{ type: 'text', text: `Deleted issue ${args.id}` }],
    }
  }
)

// --- archive_issue ---
server.registerTool(
  'archive_issue',
  {
    description: 'Archive an issue. The issue retains its current state (todo, done, etc.) but is hidden from normal views.',
    inputSchema: z.object({
      id: z.string().describe('Issue UUID or identifier like "ENG-1"'),
    }),
    annotations: { readOnlyHint: false },
  },
  async (args) => {
    const issue = (await getIssue(args.id)) || (await getIssueByIdentifier(args.id))
    if (!issue) {
      return {
        content: [{ type: 'text', text: `Issue ${args.id} not found` }],
        isError: true,
      }
    }
    await archiveIssue(issue.id)
    return {
      content: [{ type: 'text', text: `Archived issue ${args.id} (state: ${issue.state})` }],
    }
  }
)

// --- unarchive_issue ---
server.registerTool(
  'unarchive_issue',
  {
    description: 'Restore an archived issue back to active views.',
    inputSchema: z.object({
      id: z.string().describe('Issue UUID or identifier like "ENG-1"'),
    }),
    annotations: { readOnlyHint: false },
  },
  async (args) => {
    const issue = (await getIssue(args.id)) || (await getIssueByIdentifier(args.id))
    if (!issue) {
      return {
        content: [{ type: 'text', text: `Issue ${args.id} not found` }],
        isError: true,
      }
    }
    await unarchiveIssue(issue.id)
    return {
      content: [{ type: 'text', text: `Unarchived issue ${args.id}` }],
    }
  }
)

// --- list_teams ---
server.registerTool(
  'list_teams',
  {
    description: 'List all teams.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    const rows = await getTeams()
    return {
      content: [{ type: 'text', text: JSON.stringify(rows.map(mapRow), null, 2) }],
    }
  }
)

// --- list_projects ---
server.registerTool(
  'list_projects',
  {
    description: 'List all projects, optionally filtered by team ID.',
    inputSchema: z.object({
      teamId: z.string().optional().describe('Filter by team ID'),
    }),
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    const rows = await getProjects(args.teamId)
    return {
      content: [{ type: 'text', text: JSON.stringify(rows.map(mapRow), null, 2) }],
    }
  }
)

// --- list_users ---
server.registerTool(
  'list_users',
  {
    description: 'List all users.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    const rows = await getUsers()
    return {
      content: [{ type: 'text', text: JSON.stringify(rows.map(mapRow), null, 2) }],
    }
  }
)

// --- list_labels ---
server.registerTool(
  'list_labels',
  {
    description: 'List all labels, optionally filtered by team ID.',
    inputSchema: z.object({
      teamId: z.string().optional().describe('Filter by team ID'),
    }),
    annotations: { readOnlyHint: true },
  },
  async (args) => {
    const rows = await getLabels(args.teamId)
    return {
      content: [{ type: 'text', text: JSON.stringify(rows.map(mapRow), null, 2) }],
    }
  }
)

// --- get_todo_issues ---
server.registerTool(
  'get_todo_issues',
  {
    description: 'Get all issues in "todo" state. Convenience tool for agents to find work to do.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    const rows = await getIssues({ state: 'todo' })
    const issues = rows.map(mapRow)
    return {
      content: [{ type: 'text', text: JSON.stringify(issues, null, 2) }],
    }
  }
)

// --- solve_issue ---
server.registerTool(
  'solve_issue',
  {
    description: 'Mark an issue as "done" and append a solution note to the description. Use this when you have completed the work described in an issue.',
    inputSchema: z.object({
      id: z.string().describe('Issue UUID or identifier like "ENG-1"'),
      solution: z.string().describe('Description of the solution or work completed'),
    }),
    annotations: { readOnlyHint: false },
  },
  async (args) => {
    const issue = (await getIssue(args.id)) || (await getIssueByIdentifier(args.id))
    if (!issue) {
      return {
        content: [{ type: 'text', text: `Issue ${args.id} not found` }],
        isError: true,
      }
    }

    const existingDesc = issue.description || ''
    const newDesc = existingDesc
      ? `${existingDesc}\n\n---\n\n**Agent Solution:**\n${args.solution}`
      : `**Agent Solution:**\n${args.solution}`

    await updateIssue(issue.id, {
      state: 'done',
      description: newDesc,
      updatedAt: Date.now(),
    })

    return {
      content: [{ type: 'text', text: `Solved issue ${args.id}. Marked as done with solution appended.` }],
    }
  }
)

export async function startMcpServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Project Manager MCP server running on stdio')
}
