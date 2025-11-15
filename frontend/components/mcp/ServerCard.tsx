'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MCPServer } from '@/lib/mcp-data'

interface ServerCardProps {
  server: MCPServer
  onViewDetails: () => void
  onConnect: () => void
}

export function ServerCard({ server, onViewDetails, onConnect }: ServerCardProps) {
  const isConnected = server.connectionStatus === 'connected'

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={onViewDetails}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{server.icon}</span>
            <div>
              <CardTitle className="text-lg">{server.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                by {server.publisher}
              </CardDescription>
            </div>
          </div>
          {isConnected ? (
            <Badge className="bg-green-500">
              🟢 Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              🔴 Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {server.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {server.isOfficial && (
            <Badge variant="outline" className="text-xs">
              ✓ Official
            </Badge>
          )}
          {server.isPopular && (
            <Badge variant="outline" className="text-xs">
              ⭐ Popular
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {server.authType === 'oauth' ? '🔐 OAuth' : '🔑 API Key'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isConnected ? "outline" : "default"}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onConnect()
            }}
          >
            {isConnected ? 'Manage' : 'Connect'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
          >
            Details
          </Button>
        </div>

        {server.downloads && (
          <div className="mt-3 text-xs text-muted-foreground">
            {server.downloads.toLocaleString()} downloads
          </div>
        )}
      </CardContent>
    </Card>
  )
}
