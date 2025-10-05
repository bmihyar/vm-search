"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Mobile", href: "#" },
  { label: "Home Internet", href: "#" },
  { label: "Devices", href: "#" },
  { label: "Help", href: "#" },
];

interface VirginSearchHeroProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  isLoading?: boolean;
  placeholder?: string;
  showNavigation?: boolean;
}

export default function VirginSearchHero({
  onSearch,
  initialQuery = "",
  isLoading = false,
  placeholder = "Search for your question (use keywords too)",
  showNavigation = true,
}: VirginSearchHeroProps) {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const router = useRouter();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (onSearch) {
      // If onSearch prop is provided, use it (for custom handling)
      onSearch(searchQuery.trim());
    } else {
      // Default behavior: navigate to results page
      const params = new URLSearchParams({ q: searchQuery.trim() });
      router.push(`/search/results?${params.toString()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-[#1a2332] text-white text-center py-2 px-4 text-sm">
        Get 50% off a Yearly Plan{" "}
        <a href="#" className="font-semibold underline hover:no-underline">
          Learn More
        </a>
      </div>

      {/* Navigation */}
      {showNavigation && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <a
                href="/"
                className="flex items-center hover:opacity-80 transition"
              >
                <img
                  src="https://www.virginmobile.ae/site/template/img/onboarding/virgin-mobile-logo.svg"
                  alt="Virgin Mobile UAE Logo"
                  width={64}
                  height={64}
                  className="h-12 w-auto"
                />
              </a>

              {/* Nav Links */}
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-gray-700 hover:text-gray-900 font-medium transition"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* CTA & Search */}
              <div className="flex items-center space-x-4">
                <button className="bg-red-100 text-red-600 px-6 py-2 rounded-full font-semibold hover:bg-red-200 transition">
                  JOIN US
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  aria-label="Search"
                  onClick={() =>
                    document.getElementById("main-search")?.focus()
                  }
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <div className="bg-red-600 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            You got questions?
          </h1>

          {/* Subheading */}
          <p className="text-white text-2xl sm:text-3xl mb-12">
            We have answers
          </p>

          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto">
            <input
              id="main-search"
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full px-6 py-5 rounded-full text-gray-700 text-lg focus:outline-none focus:ring-4 focus:ring-red-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Search questions"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Submit search"
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 text-gray-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Search Tips */}
          <div className="mt-8 max-w-2xl mx-auto">
            <p className="text-red-100 text-sm mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["eSIM", "data plans", "roaming", "billing", "apple watch"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      if (onSearch) {
                        onSearch(term);
                      } else {
                        const params = new URLSearchParams({ q: term });
                        router.push(`/search/results?${params.toString()}`);
                      }
                    }}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    {term}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Search
              </h3>
              <p className="text-gray-600">
                Advanced search with highlighting and instant results
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Get answers in milliseconds with our powerful search engine
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Always Updated
              </h3>
              <p className="text-gray-600">
                Fresh content and real-time updates to help you find what you
                need
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
