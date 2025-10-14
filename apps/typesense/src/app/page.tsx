"use client";

import React, { useState } from "react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Stats,
  Configure,
} from "react-instantsearch";
import { searchClient } from "@/config/typesense";

// Hit component to display individual search results
const Hit = ({ hit }: { hit: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract content preview (first 150 characters)
  const getContentPreview = (content: string) => {
    if (!content) return "";
    const plainText = content.replace(/<[^>]*>/g, ""); // Remove HTML tags if any
    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  return (
    <div className="search-result-card bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Title - Always visible and clickable to expand */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="search-result-title text-lg font-semibold text-gray-900 transition-colors flex-grow">
          <span
            dangerouslySetInnerHTML={{
              __html:
                hit._highlightResult?.title?.value || hit.title || "Untitled",
            }}
          />
        </h3>

        {/* Expand/Collapse Icon */}
        <div className="ml-3 flex-shrink-0">
          <svg
            className={`expand-icon w-5 h-5 text-gray-500 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="content-expanded mt-4 pt-4 border-t border-gray-100">
          {/* Content Preview */}
          {hit.content && (
            <div className="text-gray-700 mb-4">
              <div
                className="content-preview leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: hit._highlightResult?.content?.value
                    ? getContentPreview(hit._highlightResult.content.value)
                    : getContentPreview(hit.content),
                }}
              />
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2">
              {hit.type && (
                <span className="metadata-badge metadata-badge-blue">
                  {hit.type}
                </span>
              )}
              {hit.status && (
                <span className="metadata-badge metadata-badge-gray">
                  {hit.status}
                </span>
              )}
              {hit.date && (
                <span className="text-gray-500 text-xs">
                  {new Date(hit.date).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Read Full Article Link */}
            {hit.slug && (
              <a
                href={`${
                  process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000"
                }/${hit.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more-link text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()} // Prevent triggering expand/collapse
              >
                Read Full Article
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Articles
          </h1>
          <p className="text-gray-600">
            Find articles by title, content, or keywords
          </p>
        </div>

        <InstantSearch indexName="vm_search" searchClient={searchClient}>
          {/* Configure search parameters */}
          <Configure
            hitsPerPage={10}
            attributesToSnippet={["content:50"]}
            snippetEllipsisText="..."
            highlightPreTag="<mark class='bg-yellow-200'>"
            highlightPostTag="</mark>"
          />

          {/* Search Box */}
          <div className="mb-6">
            <div className="relative">
              <SearchBox
                placeholder="Search for articles..."
                className="w-full"
                classNames={{
                  root: "relative",
                  form: "relative",
                  input:
                    "w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg",
                  submit: "absolute left-3 top-1/2 transform -translate-y-1/2",
                  submitIcon: "w-5 h-5 text-gray-400",
                  reset: "absolute right-3 top-1/2 transform -translate-y-1/2",
                  resetIcon: "w-5 h-5 text-gray-400 hover:text-gray-600",
                }}
              />
            </div>
          </div>

          {/* Search Stats */}
          <div className="mb-6">
            <Stats
              classNames={{
                root: "text-sm text-gray-600",
                text: "text-sm text-gray-600",
              }}
            />
          </div>

          {/* Search Results */}
          <div className="space-y-3">
            <Hits
              hitComponent={Hit}
              classNames={{
                root: "space-y-3",
                list: "space-y-3",
                item: "",
              }}
            />
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}
