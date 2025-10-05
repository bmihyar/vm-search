#!/usr/bin/env tsx

import dotenv from "dotenv";
import typesenseClient from "../config/typesense";

// Load environment variables
dotenv.config();

const createVMSearchCollection = async () => {
  try {
    console.log("🔍 Creating vm_search collection...");

    const vmSearchCollectionSchema = {
      name: "vm_search",
      fields: [
        { name: "ID", type: "int32" },
        { name: "date", type: "string", facet: true },
        { name: "slug", type: "string" },
        { name: "type", type: "string" },
        { name: "title", type: "string", sort: true },
        { name: "status", type: "string" },
        { name: "content", type: "string" },
      ],
      default_sorting_field: "title",
    };

    // Check if collection exists and delete it if it does
    try {
      await typesenseClient.collections("vm_search").retrieve();
      console.log('📦 Collection "vm_search" exists, deleting...');
      await typesenseClient.collections("vm_search").delete();
      console.log('🗑️ Deleted existing collection "vm_search"');
    } catch (error) {
      // Collection doesn't exist, which is fine
      console.log('📦 Collection "vm_search" does not exist');
    }

    // Create the collection
    const result = await typesenseClient
      .collections()
      .create(vmSearchCollectionSchema);
    console.log('✅ Successfully created collection "vm_search"');
    console.log("📋 Collection details:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error creating collection:", error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  createVMSearchCollection()
    .then(() => {
      console.log("🎉 VM Search collection creation completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

export { createVMSearchCollection };
