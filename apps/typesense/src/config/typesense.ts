import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

// Typesense InstantSearch Adapter configuration
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY || "xyz", // Use search-only API key for frontend
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || "localhost",
        port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "8108"),
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "http",
      },
    ],
    connectionTimeoutSeconds: 2,
  },
  additionalSearchParameters: {
    query_by: "title,content",
  },
});

export const searchClient = typesenseInstantsearchAdapter.searchClient;
export default typesenseInstantsearchAdapter;
