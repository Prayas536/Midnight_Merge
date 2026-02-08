const app = require("./app");
const { env } = require("./config/env");
const { connectDB } = require("./config/db");

// Connect DB first, then start server
connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`API running on port ${env.PORT} (${env.NODE_ENV})`);
    });
  })
  .catch((e) => {
    console.error("❌Failed to connect DB:", e.message);
    process.exit(1);
  });
