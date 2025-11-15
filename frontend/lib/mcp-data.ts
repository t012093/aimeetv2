export type MCPAuthType = 'oauth' | 'api-key' | 'service-account' | 'none'
export type MCPConnectionStatus = 'connected' | 'disconnected' | 'error'

export interface MCPServer {
  id: string
  name: string
  publisher: string
  version: string
  icon: string
  description: string
  longDescription: string
  category: string[]
  tags: string[]

  // Authentication
  authType: MCPAuthType
  authProvider?: string
  authScopes?: string[]
  authInstructions?: string

  // Tools/Capabilities
  tools: Array<{
    name: string
    description: string
  }>

  // Status
  isOfficial: boolean
  isPopular: boolean
  downloads?: number
  stars?: number

  // Documentation
  documentationUrl?: string
  repositoryUrl?: string

  // Connection status (for UI)
  connectionStatus?: MCPConnectionStatus
}

export const mcpServers: MCPServer[] = [
  // Already Implemented Servers
  {
    id: 'slack',
    name: 'Slack',
    publisher: 'Anthropic',
    version: '1.0.0',
    icon: '💬',
    description: 'Send messages and manage your Slack workspace',
    longDescription: 'The Slack MCP Server enables AI assistants to interact with Slack workspaces. Send messages to channels, reply to threads, manage channels, search messages, and more.',
    category: ['communication', 'productivity'],
    tags: ['slack', 'messaging', 'team-chat', 'notifications'],
    authType: 'oauth',
    authProvider: 'slack',
    authScopes: ['channels:read', 'channels:write', 'chat:write', 'users:read', 'reactions:write'],
    authInstructions: '1. Go to api.slack.com/apps\n2. Create a new app\n3. Add OAuth scopes\n4. Install to workspace\n5. Copy bot token',
    tools: [
      { name: 'send_message', description: 'Send a message to a Slack channel' },
      { name: 'list_channels', description: 'List all channels in the workspace' },
      { name: 'reply_to_thread', description: 'Reply to a message thread' },
      { name: 'add_reaction', description: 'Add emoji reaction to a message' },
      { name: 'search_messages', description: 'Search for messages in workspace' },
    ],
    isOfficial: true,
    isPopular: true,
    downloads: 45000,
    stars: 1200,
    documentationUrl: 'https://modelcontextprotocol.io/docs/servers/slack',
    repositoryUrl: 'https://github.com/modelcontextprotocol/servers',
    connectionStatus: 'connected',
  },
  {
    id: 'notion',
    name: 'Notion',
    publisher: 'Notion Labs',
    version: '1.0.0',
    icon: '📝',
    description: 'Create and manage pages, databases in Notion',
    longDescription: 'The Notion MCP Server enables AI assistants to interact with your Notion workspace. Create pages, query databases, update content, and manage your knowledge base.',
    category: ['productivity', 'documentation'],
    tags: ['notion', 'notes', 'knowledge-base', 'databases'],
    authType: 'api-key',
    authInstructions: '1. Go to notion.so/my-integrations\n2. Create new integration\n3. Copy Internal Integration Token\n4. Share pages with integration',
    tools: [
      { name: 'create_page', description: 'Create a new page in Notion' },
      { name: 'update_page', description: 'Update existing page content' },
      { name: 'query_database', description: 'Query a Notion database' },
      { name: 'search', description: 'Search across your Notion workspace' },
    ],
    isOfficial: true,
    isPopular: true,
    downloads: 38000,
    stars: 980,
    documentationUrl: 'https://developers.notion.com/',
    repositoryUrl: 'https://github.com/modelcontextprotocol/servers',
    connectionStatus: 'connected',
  },
  {
    id: 'github',
    name: 'GitHub',
    publisher: 'Anthropic',
    version: '1.0.0',
    icon: '🔧',
    description: 'Manage repositories, issues, and pull requests',
    longDescription: 'The GitHub MCP Server provides comprehensive GitHub integration. Create issues, manage pull requests, search code, read files, and more.',
    category: ['development', 'productivity'],
    tags: ['github', 'git', 'code', 'version-control', 'issues', 'pr'],
    authType: 'api-key',
    authInstructions: '1. Go to github.com/settings/tokens\n2. Generate new token (classic)\n3. Select scopes: repo, read:org\n4. Copy token',
    tools: [
      { name: 'create_issue', description: 'Create a new issue in a repository' },
      { name: 'list_issues', description: 'List issues in a repository' },
      { name: 'create_pull_request', description: 'Create a new pull request' },
      { name: 'search_code', description: 'Search for code across repositories' },
      { name: 'get_file_contents', description: 'Read file contents from a repository' },
    ],
    isOfficial: true,
    isPopular: true,
    downloads: 52000,
    stars: 1500,
    documentationUrl: 'https://docs.github.com/en/rest',
    repositoryUrl: 'https://github.com/modelcontextprotocol/servers',
    connectionStatus: 'disconnected',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    publisher: 'AIMeet',
    version: '1.0.0',
    icon: '📅',
    description: 'Manage calendar events and Google Meet meetings',
    longDescription: 'Manage calendar events, create meetings with Google Meet links, and schedule with AI assistance.',
    category: ['productivity', 'scheduling'],
    tags: ['google', 'calendar', 'meetings', 'scheduling'],
    authType: 'oauth',
    authProvider: 'google',
    authScopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    tools: [
      { name: 'create_event', description: 'Create calendar events with optional Meet links' },
      { name: 'get_upcoming_events', description: 'List upcoming calendar events' },
      { name: 'get_event', description: 'Get specific event details' },
      { name: 'update_event', description: 'Modify existing events' },
      { name: 'delete_event', description: 'Remove calendar events' },
      { name: 'search_events', description: 'Search by keyword' },
    ],
    isOfficial: false,
    isPopular: true,
    downloads: 15000,
    connectionStatus: 'connected',
  },

  // New Servers (Not Yet Implemented)
  {
    id: 'google-drive',
    name: 'Google Drive',
    publisher: 'Anthropic',
    version: '1.0.0',
    icon: '📁',
    description: 'Access, search, and manage Google Drive files',
    longDescription: 'Access and manage Google Drive files, search documents, read and write files, manage permissions.',
    category: ['cloud-storage', 'productivity'],
    tags: ['google', 'drive', 'storage', 'files', 'documents'],
    authType: 'oauth',
    authProvider: 'google',
    authScopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file'],
    tools: [
      { name: 'search_files', description: 'Search for files in Google Drive' },
      { name: 'get_file', description: 'Get file metadata and contents' },
      { name: 'create_file', description: 'Create a new file' },
      { name: 'share_file', description: 'Share a file with others' },
    ],
    isOfficial: true,
    isPopular: true,
    downloads: 32000,
    stars: 850,
    documentationUrl: 'https://developers.google.com/drive',
    connectionStatus: 'disconnected',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    publisher: 'Anthropic',
    version: '1.0.0',
    icon: '🗄️',
    description: 'Query and manage PostgreSQL databases',
    longDescription: 'Execute SQL queries, manage database schemas, and perform data analysis on PostgreSQL databases.',
    category: ['data', 'database'],
    tags: ['postgres', 'postgresql', 'database', 'sql', 'data'],
    authType: 'api-key',
    authInstructions: 'Provide a PostgreSQL connection string:\npostgresql://user:password@host:port/database',
    tools: [
      { name: 'query', description: 'Execute a SQL query' },
      { name: 'list_tables', description: 'List all tables in database' },
      { name: 'describe_table', description: 'Get table schema' },
    ],
    isOfficial: true,
    isPopular: true,
    downloads: 28000,
    stars: 720,
    connectionStatus: 'disconnected',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    publisher: 'Community',
    version: '0.9.0',
    icon: '✉️',
    description: 'Read and send emails via Gmail',
    longDescription: 'Read emails, send messages, manage inbox, search emails, and organize with labels.',
    category: ['communication', 'email'],
    tags: ['gmail', 'email', 'google', 'messages'],
    authType: 'oauth',
    authProvider: 'google',
    authScopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
    tools: [
      { name: 'search_emails', description: 'Search for emails' },
      { name: 'send_email', description: 'Send a new email' },
      { name: 'read_email', description: 'Read email contents' },
      { name: 'manage_labels', description: 'Add or remove labels' },
    ],
    isOfficial: false,
    isPopular: true,
    downloads: 18000,
    stars: 450,
    connectionStatus: 'disconnected',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    publisher: 'Anthropic',
    version: '1.0.0',
    icon: '💳',
    description: 'Manage payments, customers, and subscriptions',
    longDescription: 'Create charges, manage customers, view transactions, handle subscriptions, and analyze payment data.',
    category: ['business', 'payments'],
    tags: ['stripe', 'payments', 'billing', 'subscriptions'],
    authType: 'api-key',
    authInstructions: '1. Go to dashboard.stripe.com/apikeys\n2. Reveal your secret key\n3. Copy the key (starts with sk_)',
    tools: [
      { name: 'create_charge', description: 'Create a new charge' },
      { name: 'list_customers', description: 'List all customers' },
      { name: 'create_subscription', description: 'Create a subscription' },
      { name: 'view_transactions', description: 'View transaction history' },
    ],
    isOfficial: true,
    isPopular: false,
    downloads: 12000,
    stars: 380,
    documentationUrl: 'https://stripe.com/docs/api',
    connectionStatus: 'disconnected',
  },
  {
    id: 'linear',
    name: 'Linear',
    publisher: 'Community',
    version: '0.8.0',
    icon: '📋',
    description: 'Manage issues and project tracking',
    longDescription: 'Create issues, update status, manage projects, search tasks, and track team progress.',
    category: ['productivity', 'project-management'],
    tags: ['linear', 'issues', 'project-management', 'tasks'],
    authType: 'api-key',
    authInstructions: '1. Go to linear.app/settings/api\n2. Create a new API key\n3. Copy the key',
    tools: [
      { name: 'create_issue', description: 'Create a new issue' },
      { name: 'update_issue', description: 'Update issue status' },
      { name: 'search_issues', description: 'Search for issues' },
      { name: 'list_projects', description: 'List all projects' },
    ],
    isOfficial: false,
    isPopular: false,
    downloads: 8500,
    stars: 240,
    documentationUrl: 'https://developers.linear.app/',
    connectionStatus: 'disconnected',
  },
  {
    id: 'recall-ai',
    name: 'Recall.ai',
    publisher: 'AIMeet',
    version: '1.0.0',
    icon: '🤖',
    description: 'Meeting recording bot management',
    longDescription: 'Send bots to join meetings, manage recordings, retrieve transcripts, and automate meeting workflows.',
    category: ['meeting-automation', 'ai'],
    tags: ['recall', 'meetings', 'recording', 'transcription', 'bot'],
    authType: 'api-key',
    authInstructions: '1. Sign up at recall.ai\n2. Go to API settings\n3. Generate API key\n4. Copy the key',
    tools: [
      { name: 'create_meeting_bot', description: 'Send bot to join and record a meeting' },
      { name: 'get_bot_status', description: 'Check bot recording status' },
      { name: 'get_bot_transcript', description: 'Retrieve transcription' },
      { name: 'list_active_bots', description: 'See all running bots' },
      { name: 'delete_bot', description: 'Remove bot and recordings' },
    ],
    isOfficial: false,
    isPopular: true,
    downloads: 6200,
    connectionStatus: 'disconnected',
  },
]

export const categories = [
  { id: 'all', name: 'All Servers', icon: '🌐' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'productivity', name: 'Productivity', icon: '📊' },
  { id: 'development', name: 'Development', icon: '⚙️' },
  { id: 'data', name: 'Data & Analytics', icon: '📈' },
  { id: 'business', name: 'Business Tools', icon: '💼' },
  { id: 'cloud-storage', name: 'Cloud Storage', icon: '☁️' },
  { id: 'meeting-automation', name: 'Meeting Automation', icon: '🎥' },
]
