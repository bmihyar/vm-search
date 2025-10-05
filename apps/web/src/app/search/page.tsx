"use client";

import VirginSearchHero from "@/components/virgin-search-hero";
import EnvironmentDebug from "@/components/EnvironmentDebug";

export default function SearchPage() {
  return (
    <>
      <VirginSearchHero />

      {/* Development Debug Panel */}
      <EnvironmentDebug />
    </>
  );
}
