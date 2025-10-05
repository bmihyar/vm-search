"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SearchResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    console.log("Results page loaded with query:", query);

    if (!query) {
      console.log("No query, redirecting");
      router.push("/search");
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      // Build API URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const fullUrl = `${baseUrl}/api/search/vm-search?q=${encodeURIComponent(query)}`;
      setApiUrl(fullUrl);

      console.log("Fetching from:", fullUrl);

      try {
        const response = await fetch(fullUrl);
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Data received:", data);

        setResults(data.results?.hits || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">VM Search Results</h1>
          <div className="bg-blue-100 p-4 rounded mb-4">
            <p>
              Loading results for: <strong>{query}</strong>
            </p>
            <p className="text-sm text-gray-600">API URL: {apiUrl}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">VM Search Results</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="font-bold">Error occurred:</h2>
            <p>{error}</p>
            <p className="text-sm mt-2">Query: {query}</p>
            <p className="text-sm">API URL: {apiUrl}</p>
          </div>
          <button
            onClick={() => router.push("/search")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">VM Search Results</h1>

        <div className="bg-green-100 p-4 rounded mb-6">
          <p>
            Search completed for: <strong>{query}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Found {results.length} results
          </p>
          <p className="text-sm text-gray-600">API URL: {apiUrl}</p>
        </div>

        <button
          onClick={() => router.push("/search")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
        >
          ← New Search
        </button>

        {results.length === 0 ? (
          <div className="bg-yellow-100 p-8 rounded text-center">
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p>Try different keywords or check your spelling.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result: any, index: number) => (
              <div
                key={result.document?.ID || index}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  {result.document?.title || "No title"}
                </h3>

                <div className="flex gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {result.document?.type || "unknown"}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {result.document?.status || "unknown"}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ID: {result.document?.ID || "unknown"}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">
                  {result.document?.content?.substring(0, 200) || "No content"}
                  {result.document?.content?.length > 200 && "..."}
                </p>

                <div className="text-sm text-gray-500">
                  <p>Date: {result.document?.date || "unknown"}</p>
                  <p>Slug: {result.document?.slug || "unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
