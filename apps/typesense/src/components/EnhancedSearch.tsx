"use client";

import React, { useState } from "react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Stats,
  Configure,
  RefinementList,
  ClearRefinements,
  Pagination,
  SortBy,
  CurrentRefinements,
  Highlight,
  Snippet,
} from "react-instantsearch";
import { searchClient } from "@/config/typesense";

// Enhanced Hit component with expandable titles
const EnhancedHit = ({ hit }: { hit: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract content preview (first 200 characters for enhanced view)
  const getContentPreview = (content: string) => {
    if (!content) return "";
    const plainText = content.replace(/<[^>]*>/g, ""); // Remove HTML tags if any
    return plainText.length > 200
      ? plainText.substring(0, 200) + "..."
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
          <Highlight attribute="title" hit={hit} />
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
          {/* Content Preview with Snippet */}
          {hit.content && (
            <div className="text-gray-700 mb-4">
              <div className="content-preview leading-relaxed">
                <Snippet attribute="content" hit={hit} />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2">
              {hit.type && (
                <span className="metadata-badge metadata-badge-blue">
                  <Highlight attribute="type" hit={hit} />
                </span>
              )}
              {hit.status && (
                <span className="metadata-badge metadata-badge-gray">
                  <Highlight attribute="status" hit={hit} />
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

// Custom Sort Component
const CustomSortBy = () => (
  <div className="mb-4">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">Sort by:</h4>
    <SortBy
      items={[
        { value: "vm_search", label: "Relevance" },
        { value: "vm_search/sort/date:desc", label: "Newest first" },
        { value: "vm_search/sort/date:asc", label: "Oldest first" },
        { value: "vm_search/sort/title:asc", label: "Title A-Z" },
        { value: "vm_search/sort/title:desc", label: "Title Z-A" },
      ]}
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// Sidebar with filters
const SearchSidebar = () => (
  <div className="w-64 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      {/* Clear all filters button */}
      <div className="mb-4">
        <ClearRefinements className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm" />
      </div>

      {/* Current refinements */}
      <div className="mb-4">
        <CurrentRefinements
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              label:
                item.attribute.charAt(0).toUpperCase() +
                item.attribute.slice(1),
            }))
          }
        />
      </div>
    </div>

    {/* Date filter */}
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Date</h4>
      <RefinementList
        attribute="date"
        limit={10}
        showMore={true}
        showMoreLimit={20}
        searchable={true}
      />
    </div>

    {/* Sort options */}
    <CustomSortBy />
  </div>
);

export default function EnhancedSearch() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <InstantSearch indexName="vm_search" searchClient={searchClient}>
          {/* Configure search parameters */}
          <Configure
            hitsPerPage={12}
            attributesToSnippet={["content:100"]}
            snippetEllipsisText="..."
            attributesToHighlight={["title", "content", "type", "status"]}
            highlightPreTag="<mark class='bg-yellow-200 font-semibold'>"
            highlightPostTag="</mark>"
          />

          {/* Search Box */}
          <div className="mb-8">
            <SearchBox placeholder="Search for content..." className="w-full" />
          </div>

          <div className="flex gap-8">
            {/* Sidebar with filters */}
            <SearchSidebar />

            {/* Main content area */}
            <div className="flex-1">
              {/* Search Stats */}
              <div className="mb-6">
                <Stats />
              </div>

              {/* Search Results */}
              <div className="grid gap-6 mb-8">
                <Hits hitComponent={EnhancedHit} />
              </div>

              {/* Pagination */}
              <div className="flex justify-center">
                <Pagination
                  totalPages={100}
                  padding={3}
                  showFirst={true}
                  showLast={true}
                  showPrevious={true}
                  showNext={true}
                />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}
