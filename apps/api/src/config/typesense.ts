import { Client } from 'typesense';

// Typesense client configuration
const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 2,
});

// Function to test Typesense connection
export const testTypesenseConnection = async (): Promise<boolean> => {
  try {
    const health = await typesenseClient.health.retrieve();
    console.log('✅ Typesense connection successful:', health);
    return true;
  } catch (error) {
    console.error('❌ Typesense connection failed:', error);
    return false;
  }
};

// Function to initialize Typesense collections
export const initializeTypesenseCollections = async () => {
  try {
    // Example: Create a sample collection for VMs
    const vmCollectionSchema = {
      name: 'vms',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'operating_system', type: 'string', facet: true },
        { name: 'cpu_cores', type: 'int32', facet: true },
        { name: 'memory_gb', type: 'int32', facet: true },
        { name: 'disk_size_gb', type: 'int32', facet: true },
        { name: 'status', type: 'string', facet: true },
        { name: 'tags', type: 'string[]', facet: true },
        { name: 'created_at', type: 'int64' },
        { name: 'updated_at', type: 'int64' },
      ],
      default_sorting_field: 'created_at',
    };

    // Check if collection exists
    try {
      await typesenseClient.collections('vms').retrieve();
      console.log('📦 Collection "vms" already exists');
    } catch (error) {
      // Collection doesn't exist, create it
      await typesenseClient.collections().create(vmCollectionSchema);
      console.log('✅ Created collection "vms"');
    }

  } catch (error) {
    console.error('❌ Error initializing Typesense collections:', error);
    throw error;
  }
};

export default typesenseClient;
