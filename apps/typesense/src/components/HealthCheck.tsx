"use client";

import React, { useState, useEffect } from "react";

interface HealthStatus {
  status: "checking" | "healthy" | "error";
  message: string;
  details?: any;
}

const HealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: "checking",
    message: "Checking Typesense connection...",
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check if environment variables are set
        const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST;
        const port = process.env.NEXT_PUBLIC_TYPESENSE_PORT;
        const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL;
        const apiKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY;

        if (!host || !port || !protocol || !apiKey) {
          setHealth({
            status: "error",
            message: "Missing required environment variables",
            details: {
              host: !!host,
              port: !!port,
              protocol: !!protocol,
              apiKey: !!apiKey,
            },
          });
          return;
        }

        // Try to perform a simple search to test connection
        const searchUrl = `${protocol}://${host}:${port}/collections/vm_search/documents/search?q=*&query_by=title&per_page=1`;
        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "X-TYPESENSE-API-KEY": apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHealth({
            status: "healthy",
            message: "Typesense connection successful",
            details: {
              found: data.found || 0,
              took: data.search_time_ms || 0,
            },
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        setHealth({
          status: "error",
          message: "Failed to connect to Typesense",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
            config: {
              host: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
              port: process.env.NEXT_PUBLIC_TYPESENSE_PORT,
              protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
              hasApiKey:
                !!process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY,
            },
          },
        });
      }
    };

    checkHealth();
  }, []);

  const getStatusColor = () => {
    switch (health.status) {
      case "checking":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "healthy":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case "checking":
        return (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case "healthy":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
    }
  };

  return (
    <div className={`rounded-lg border p-3 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">Typesense Health Check</span>
      </div>
      <p className="text-xs mt-1">{health.message}</p>

      {health.status === "healthy" && health.details && (
        <div className="mt-2 text-xs">
          <span>
            Found {health.details.found} documents in {health.details.took}ms
          </span>
        </div>
      )}

      {health.status === "error" && health.details && (
        <details className="mt-2">
          <summary className="text-xs cursor-pointer hover:underline">
            Show error details
          </summary>
          <pre className="text-xs mt-1 p-2 bg-red-100 rounded overflow-auto max-h-32">
            {JSON.stringify(health.details, null, 2)}
          </pre>
        </details>
      )}

      {health.status === "error" && (
        <div className="mt-2 text-xs">
          <p className="font-medium">Troubleshooting tips:</p>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>
              Ensure Typesense server is running on{" "}
              {process.env.NEXT_PUBLIC_TYPESENSE_HOST}:
              {process.env.NEXT_PUBLIC_TYPESENSE_PORT}
            </li>
            <li>Check that the API key is correct</li>
            <li>Verify the vm_search collection exists</li>
            <li>Check CORS settings if running locally</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;
