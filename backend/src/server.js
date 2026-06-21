import "./config/env.js";
import app from "./app.js";
import { testDbConnection } from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testDbConnection();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
