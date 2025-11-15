'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MCPServer } from '@/lib/mcp-data'

interface ServerDetailModalProps {
  server: MCPServer | null
  isOpen: boolean
  onClose: () => void
  onConnect: () => void
}

export function ServerDetailModal({
  server,
  isOpen,
  onClose,
  onConnect,
}: ServerDetailModalProps) {
  if (!server) return null

  const isConnected = server.connectionStatus === 'connected'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{server.icon}</span>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{server.name}</DialogTitle>
              <DialogDescription>
                by {server.publisher} • v{server.version}
              </DialogDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-green-500">🟢 Connected</Badge>
            ) : (
              <Badge variant="secondary">🔴 Not Connected</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {server.isOfficial && (
              <Badge variant="outline">✓ Official</Badge>
            )}
            {server.isPopular && (
              <Badge variant="outline">⭐ Popular</Badge>
            )}
            {server.category.map((cat) => (
              <Badge key={cat} variant="outline">
                {cat}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">
              {server.longDescription}
            </p>
          </div>

          {/* Stats */}
          {(server.downloads || server.stars) && (
            <div className="flex gap-6 text-sm">
              {server.downloads && (
                <div>
                  <span className="text-muted-foreground">Downloads:</span>
                  <span className="ml-2 font-semibold">
                    {server.downloads.toLocaleString()}
                  </span>
                </div>
              )}
              {server.stars && (
                <div>
                  <span className="text-muted-foreground">Stars:</span>
                  <span className="ml-2 font-semibold">
                    {server.stars.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tools/Capabilities */}
          <div>
            <h3 className="font-semibold mb-3">Available Tools</h3>
            <div className="space-y-2">
              {server.tools.map((tool, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-muted/30"
                >
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tool.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h3 className="font-semibold mb-3">Authentication</h3>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {server.authType === 'oauth' ? '🔐 OAuth 2.0' : '🔑 API Key'}
                </Badge>
                {server.authProvider && (
                  <span className="text-sm text-muted-foreground">
                    Provider: {server.authProvider}
                  </span>
                )}
              </div>

              {server.authScopes && server.authScopes.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Required scopes:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {server.authScopes.map((scope, index) => (
                      <code
                        key={index}
                        className="text-xs bg-background px-2 py-1 rounded"
                      >
                        {scope}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {server.authInstructions && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Setup instructions:
                  </p>
                  <pre className="text-xs bg-background p-3 rounded whitespace-pre-wrap">
                    {server.authInstructions}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Documentation Links */}
          {(server.documentationUrl || server.repositoryUrl) && (
            <div className="flex gap-3">
              {server.documentationUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={server.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📚 Documentation
                  </a>
                </Button>
              )}
              {server.repositoryUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={server.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💻 Repository
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Connect Button */}
          <div className="pt-4 border-t">
            <Button
              size="lg"
              className="w-full"
              onClick={onConnect}
              disabled={isConnected}
            >
              {isConnected
                ? '✅ Connected'
                : `Connect with ${server.name}`}
            </Button>
            {isConnected && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                This server is already connected to your account
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
