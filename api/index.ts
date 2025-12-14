// Vercel serverless function wrapper for Express app
// Import from compiled backend or source depending on environment
let app;
try {
  // Try compiled version first
  app = require('../backend/dist/index.js').default;
} catch {
  // Fallback to source (for development)
  app = require('../backend/src/index.ts').default;
}

// Export as Vercel serverless function
export default app;

