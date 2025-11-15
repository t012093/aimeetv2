'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ServerCard } from '@/components/mcp/ServerCard'
import { ServerDetailModal } from '@/components/mcp/ServerDetailModal'
import { ConnectionModal } from '@/components/mcp/ConnectionModal'
import { mcpServers, categories, MCPServer } from '@/lib/mcp-data'

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [connectionModalOpen, setConnectionModalOpen] = useState(false)

  // Filter servers
  const filteredServers = mcpServers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesCategory =
      selectedCategory === 'all' || server.category.includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  // Separate connected and available servers
  const connectedServers = filteredServers.filter(
    (s) => s.connectionStatus === 'connected'
  )
  const availableServers = filteredServers.filter(
    (s) => s.connectionStatus !== 'connected'
  )

  const handleViewDetails = (server: MCPServer) => {
    setSelectedServer(server)
    setDetailModalOpen(true)
  }

  const handleConnect = (server: MCPServer) => {
    setSelectedServer(server)
    setConnectionModalOpen(true)
  }

  const handleConnectionSuccess = () => {
    // In real implementation, update server connection status
    alert('Successfully connected! (Demo only)')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">MCP Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Connect to external services and extend AIMeet's capabilities
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search MCP servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div>
            Total: <span className="font-semibold">{filteredServers.length}</span>
          </div>
          <div>
            Connected:{' '}
            <span className="font-semibold text-green-600">
              {connectedServers.length}
            </span>
          </div>
          <div>
            Available:{' '}
            <span className="font-semibold">{availableServers.length}</span>
          </div>
        </div>
      </div>

      {/* Connected Servers */}
      {connectedServers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Connected Servers</h2>
            <Badge className="bg-green-500">{connectedServers.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedServers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onViewDetails={() => handleViewDetails(server)}
                onConnect={() => handleConnect(server)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Servers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {connectedServers.length > 0
              ? 'Available Servers'
              : 'All Servers'}
          </h2>
          <Badge variant="outline">{availableServers.length}</Badge>
        </div>

        {availableServers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No servers found matching your criteria
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableServers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onViewDetails={() => handleViewDetails(server)}
                onConnect={() => handleConnect(server)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ServerDetailModal
        server={selectedServer}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onConnect={() => {
          setDetailModalOpen(false)
          setConnectionModalOpen(true)
        }}
      />

      <ConnectionModal
        server={selectedServer}
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
        onSuccess={handleConnectionSuccess}
      />
    </div>
  )
}
