'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MCPServer } from '@/lib/mcp-data'

interface ConnectionModalProps {
  server: MCPServer | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ConnectionModal({
  server,
  isOpen,
  onClose,
  onSuccess,
}: ConnectionModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  if (!server) return null

  const handleConnect = async () => {
    setIsConnecting(true)

    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (server.authType === 'oauth') {
      // OAuth flow: would open popup window
      alert(
        `OAuth flow would open a new window to authenticate with ${server.authProvider}.\n\nThis is a demo - no actual connection is made.`
      )
    } else {
      // API Key flow
      if (!apiKey) {
        alert('Please enter an API key')
        setIsConnecting(false)
        return
      }
      alert(
        `API Key would be validated and stored securely.\n\nThis is a demo - no actual connection is made.`
      )
    }

    setIsConnecting(false)
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{server.icon}</span>
            <div>
              <DialogTitle>Connect to {server.name}</DialogTitle>
              <DialogDescription>
                {server.authType === 'oauth'
                  ? 'Authorize access to your account'
                  : 'Enter your API credentials'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auth Type Badge */}
          <div>
            <Badge variant="outline">
              {server.authType === 'oauth'
                ? `🔐 OAuth 2.0 - ${server.authProvider}`
                : '🔑 API Key Authentication'}
            </Badge>
          </div>

          {/* OAuth Flow */}
          {server.authType === 'oauth' && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm mb-2">
                  Required Permissions:
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {server.authScopes?.map((scope, index) => (
                    <li key={index}>• {scope}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  You will be redirected to {server.authProvider} to authorize
                  access. This window will close automatically after you grant
                  permission.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting
                  ? 'Opening authorization page...'
                  : `Authorize with ${server.name}`}
              </Button>
            </div>
          )}

          {/* API Key Flow */}
          {server.authType === 'api-key' && (
            <div className="space-y-4">
              {server.authInstructions && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm mb-2">
                    How to get your API key:
                  </h4>
                  <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                    {server.authInstructions}
                  </pre>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  API Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your API key will be encrypted and stored securely
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleConnect}
                disabled={isConnecting || !apiKey}
              >
                {isConnecting ? 'Testing connection...' : 'Connect'}
              </Button>
            </div>
          )}

          {/* Documentation Link */}
          {server.documentationUrl && (
            <div className="pt-4 border-t">
              <Button variant="link" size="sm" asChild className="w-full">
                <a
                  href={server.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📚 View {server.name} Documentation
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
