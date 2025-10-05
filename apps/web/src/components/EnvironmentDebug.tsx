'use client'

import { useState } from 'react'
import { getEnvironmentInfo, checkApiHealth } from '@/lib/api'

interface EnvironmentDebugProps {
  className?: string
}

export default function EnvironmentDebug({ className = '' }: EnvironmentDebugProps) {
  const [showDebug, setShowDebug] = useState(false)
  const [apiHealth, setApiHealth] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const envInfo = getEnvironmentInfo()

  const checkHealth = async () => {
    setHealthLoading(true)
    setHealthError(null)

    try {
      const health = await checkApiHealth()
      setApiHealth(health)
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : 'Health check failed')
    } finally {
      setHealthLoading(false)
    }
  }

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className={`fixed bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-mono shadow-lg hover:bg-purple-700 transition-colors z-50 ${className}`}
      >
        ENV DEBUG
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md shadow-2xl z-50 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-yellow-400 font-bold">Environment Debug</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Environment Info */}
        <div>
          <h4 className="text-blue-400 font-semibold mb-1">Configuration</h4>
          <div className="space-y-1 text-gray-300">
            <div>
              <span className="text-gray-500">API URL:</span>{' '}
              <span className={envInfo.hasCustomApiUrl ? 'text-green-400' : 'text-yellow-400'}>
                {envInfo.apiBaseUrl}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Environment:</span>{' '}
              <span className={envInfo.isProduction ? 'text-red-400' : 'text-green-400'}>
                {envInfo.isProduction ? 'production' : 'development'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Custom API URL:</span>{' '}
              <span className={envInfo.hasCustomApiUrl ? 'text-green-400' : 'text-gray-400'}>
                {envInfo.hasCustomApiUrl ? 'Yes' : 'No (using default)'}
              </span>
            </div>
          </div>
        </div>

        {/* Browser Info */}
        <div>
          <h4 className="text-blue-400 font-semibold mb-1">Browser</h4>
          <div className="space-y-1 text-gray-300">
            <div>
              <span className="text-gray-500">Origin:</span>{' '}
              <span className="text-green-400">
                {typeof window !== 'undefined' ? window.location.origin : 'SSR'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Protocol:</span>{' '}
              <span className="text-green-400">
                {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* API Health Check */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-blue-400 font-semibold">API Health</h4>
            <button
              onClick={checkHealth}
              disabled={healthLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-2 py-1 rounded text-white transition-colors"
            >
              {healthLoading ? '...' : 'Check'}
            </button>
          </div>

          {healthError && (
            <div className="text-red-400 text-xs">
              Error: {healthError}
            </div>
          )}

          {apiHealth && (
            <div className="space-y-1 text-gray-300">
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span className="text-green-400">{apiHealth.status}</span>
              </div>
              {apiHealth.uptime && (
                <div>
                  <span className="text-gray-500">Uptime:</span>{' '}
                  <span className="text-green-400">{Math.round(apiHealth.uptime)}s</span>
                </div>
              )}
              {apiHealth.timestamp && (
                <div>
                  <span className="text-gray-500">Timestamp:</span>{' '}
                  <span className="text-green-400">
                    {new Date(apiHealth.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div>
          <h4 className="text-blue-400 font-semibold mb-1">Environment Variables</h4>
          <div className="space-y-1 text-gray-300 text-xs">
            <div>
              <span className="text-gray-500">NODE_ENV:</span>{' '}
              <span className="text-yellow-400">{process.env.NODE_ENV}</span>
            </div>
            <div>
              <span className="text-gray-500">NEXT_PUBLIC_API_URL:</span>{' '}
              <span className="text-yellow-400">
                {process.env.NEXT_PUBLIC_API_URL || 'undefined'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-blue-400 font-semibold mb-1">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.open(envInfo.apiBaseUrl + '/health', '_blank')}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white text-xs transition-colors"
            >
              Open API Health
            </button>
            <button
              onClick={() => window.open(envInfo.apiBaseUrl + '/api', '_blank')}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white text-xs transition-colors"
            >
              Open API Info
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
