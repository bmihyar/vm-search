#!/usr/bin/env tsx

import dotenv from 'dotenv';
import typesenseClient from '../config/typesense';

// Load environment variables
dotenv.config();

const searchVMSearch = async (query: string, filters?: string) => {
  try {
    console.log(`🔍 Searching vm_search collection with query: "${query}"`);
    if (filters) {
      console.log(`🎯 Applying filters: ${filters}`);
    }

    const searchParameters = {
      q: query || '*',
      query_by: 'title,content,type,slug',
      filter_by: filters || '',
      sort_by: 'title:asc',
      per_page: 50,
      page: 1,
      highlight_full_fields: 'title,content',
      highlight_affix_num_tokens: 4,
    };

    const searchResults = await typesenseClient
      .collections('vm_search')
      .documents()
      .search(searchParameters);

    console.log(`📊 Found ${searchResults.found} results`);
    console.log('=' .repeat(80));

    if (searchResults.hits && searchResults.hits.length > 0) {
      searchResults.hits.forEach((hit: any, index: number) => {
        const doc = hit.document;
        const highlights = hit.highlights || [];

        console.log(`${index + 1}. ${doc.title} (ID: ${doc.ID})`);
        console.log(`   Type: ${doc.type}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Date: ${doc.date}`);
        console.log(`   Slug: ${doc.slug}`);

        // Show content preview
        const contentPreview = doc.content.length > 150
          ? doc.content.substring(0, 150) + '...'
          : doc.content;
        console.log(`   Content: ${contentPreview}`);

        // Show highlights if available
        if (highlights.length > 0) {
          console.log(`   Highlights:`);
          highlights.forEach((highlight: any) => {
            if (highlight.snippet) {
              console.log(`     ${highlight.field}: ...${highlight.snippet}...`);
            }
          });
        }

        console.log('-'.repeat(60));
      });
    } else {
      console.log('❌ No documents found matching your search criteria');
    }

    // Show facets if available
    if (searchResults.facet_counts && searchResults.facet_counts.length > 0) {
      console.log('\n📈 Facet Counts:');
      searchResults.facet_counts.forEach((facet: any) => {
        console.log(`\n${facet.field_name}:`);
        facet.counts.forEach((count: any) => {
          console.log(`  ${count.value}: ${count.count}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Search failed:', error);
    process.exit(1);
  }
};

const showHelp = () => {
  console.log(`
🔍 VM Search Collection Search Tool

Usage:
  npm run search-vm-search [query] [filters]
  tsx src/scripts/search-vm-search.ts [query] [filters]

Examples:
  # Search all documents
  npm run search-vm-search "*"

  # Search by title or content
  npm run search-vm-search "virtual machine"

  # Search with filters
  npm run search-vm-search "*" "type:article"
  npm run search-vm-search "*" "status:published"
  npm run search-vm-search "*" "date:>=2023-01-01"

  # Complex searches
  npm run search-vm-search "docker" "type:tutorial && status:published"
  npm run search-vm-search "*" "date:[2023-01-01..2023-12-31]"

Filter Examples:
  - type:article
  - type:tutorial
  - status:published
  - status:draft
  - date:>=2023-01-01
  - date:[2023-01-01..2023-12-31]
  - ID:>100

Query Fields:
  The search will look in: title, content, type, slug

Options:
  --help, -h    Show this help message
`);
};

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const query = args[0] || '*';
  const filters = args[1] || '';

  searchVMSearch(query, filters)
    .then(() => {
      console.log('\n🎉 Search completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Search failed:', error);
      process.exit(1);
    });
}

export { searchVMSearch };
