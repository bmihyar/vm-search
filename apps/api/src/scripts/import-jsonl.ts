#!/usr/bin/env tsx

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import typesenseClient from '../config/typesense';

// Load environment variables
dotenv.config();

interface VMSearchDocument {
  ID: number;
  date: string;
  slug: string;
  type: string;
  title: string;
  status: string;
  content: string;
}

const importJSONL = async (filePath: string, collectionName: string = 'vm_search') => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    // Check if collection exists
    try {
      await typesenseClient.collections(collectionName).retrieve();
      console.log(`📦 Collection "${collectionName}" found`);
    } catch (error) {
      console.error(`❌ Collection "${collectionName}" does not exist. Please create it first.`);
      process.exit(1);
    }

    console.log(`📖 Reading JSONL file: ${filePath}`);

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineNumber = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{line: number, error: string, data: string}> = [];

    console.log('🚀 Starting import...');

    for await (const line of rl) {
      lineNumber++;

      // Skip empty lines
      if (line.trim() === '') {
        continue;
      }

      try {
        const document: VMSearchDocument = JSON.parse(line);

        // Validate required fields
        const requiredFields = ['ID', 'date', 'slug', 'type', 'title', 'status', 'content'];
        const missingFields = requiredFields.filter(field => !(field in document));

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Import document to Typesense
        await typesenseClient.collections(collectionName).documents().create(document);

        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Imported ${successCount} documents...`);
        }

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          line: lineNumber,
          error: errorMessage,
          data: line.substring(0, 100) + (line.length > 100 ? '...' : '')
        });

        console.error(`❌ Error on line ${lineNumber}: ${errorMessage}`);
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} documents`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n🚨 Error Details:');
      errors.slice(0, 5).forEach(err => {
        console.log(`   Line ${err.line}: ${err.error}`);
        console.log(`   Data: ${err.data}\n`);
      });

      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more errors`);
      }
    }

    // Verify collection count
    const searchResults = await typesenseClient.collections(collectionName).documents().search({
      q: '*',
      query_by: 'title',
      per_page: 1
    });

    console.log(`\n📈 Total documents in collection: ${searchResults.found}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

const showHelp = () => {
  console.log(`
📥 JSONL Import Tool for vm_search Collection

Usage:
  npm run import-jsonl <file_path> [collection_name]
  tsx src/scripts/import-jsonl.ts <file_path> [collection_name]

Arguments:
  file_path        Path to the JSONL file to import
  collection_name  Target collection name (default: vm_search)

Examples:
  # Import to vm_search collection
  npm run import-jsonl data/vm_search.jsonl

  # Import to custom collection
  npm run import-jsonl data/vm_search.jsonl my_collection

JSONL Format:
Each line should be a valid JSON object with these fields:
{
  "ID": 1,
  "date": "2023-01-01",
  "slug": "example-slug",
  "type": "article",
  "title": "Example Title",
  "status": "published",
  "content": "Example content..."
}

Required Fields:
  - ID (integer)
  - date (string)
  - slug (string)
  - type (string)
  - title (string)
  - status (string)
  - content (string)

Options:
  --help, -h    Show this help message
`);
};

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const filePath = args[0];
  const collectionName = args[1] || 'vm_search';

  if (!filePath) {
    console.error('❌ Please provide a file path');
    showHelp();
    process.exit(1);
  }

  // Convert relative paths to absolute
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  importJSONL(absolutePath, collectionName)
    .then(() => {
      console.log('\n🎉 Import completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

export { importJSONL };
