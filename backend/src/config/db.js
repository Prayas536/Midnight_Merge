const mongoose = require("mongoose");
const { env } = require("./env");
const { connectTigerGraph } = require("./tigergraph");

async function connectDB() {
  if (!env.MONGO_URI) throw new Error("❌MONGO_URI missing in environment");
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log("✅MongoDB connected");

  // Connect TigerGraph (non-blocking — app works without it)
  await connectTigerGraph();
}

module.exports = { connectDB };
