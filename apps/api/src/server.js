import app from "./app.js";
import { env as environment } from "./config/env.js";

// Start server
app.listen(environment.port, () => {
  console.log(`Server running on http://localhost:${environment.port}`);
  console.log(`Health check: http://localhost:${environment.port}/health`);
  console.log(`Environment: ${environment.nodeEnv}`);
});
