import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import typesenseClient from "./config/typesense";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Typesense health check
app.get("/api/typesense/health", async (req, res) => {
  try {
    const health = await typesenseClient.health.retrieve();
    res.json({
      status: "OK",
      typesense: health,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Typesense connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Search vm_search collection endpoint
app.get("/api/search/vm-search", async (req, res) => {
  try {
    const query = (req.query.q as string) || "*";
    const searchParameters = {
      q: query,
      query_by: "title,content,type,slug",
      filter_by: "",
      sort_by: "title:asc",
      highlight_full_fields: "title,content",
      highlight_affix_num_tokens: 4,
      per_page: 50,
    };

    const searchResults = await typesenseClient
      .collections("vm_search")
      .documents()
      .search(searchParameters);

    res.json({
      results: searchResults,
      query: query,
    });
  } catch (error) {
    res.status(500).json({
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: "VM Search API is running!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      typesenseHealth: "/api/typesense/health",
      searchVMSearch: "/api/search/vm-search",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(
    `🔍 Typesense health: http://localhost:${PORT}/api/typesense/health`,
  );
  console.log(`🔎 Search VMs: http://localhost:${PORT}/api/search/vms?q=test`);
});

export default app;
