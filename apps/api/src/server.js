import app from "./app.js";
import { env } from "./config/env.js";

// Start server
app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`Health check: http://localhost:${env.port}/health`);
  console.log(`Environment: ${env.nodeEnv}`);
});
