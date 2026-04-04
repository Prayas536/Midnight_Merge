/**
 * TigerGraph Configuration & Connection Client
 * Uses REST++ API to communicate with TigerGraph Cloud / Savanna
 */
const axios = require("axios");
const { env } = require("./env");

let tgClient = null;

/**
 * Creates a reusable Axios instance pre-configured for TigerGraph REST++ API
 */
function createTigerGraphClient() {
  if (!env.TG_HOST) {
    console.warn("⚠️  TG_HOST not set – TigerGraph features disabled");
    return null;
  }

  const baseURL = `${env.TG_HOST}`;

  tgClient = axios.create({
    baseURL,
    timeout: env.TG_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      ...(env.TG_TOKEN ? { Authorization: `Bearer ${env.TG_TOKEN}` } : {}),
    },
  });

  // Response interceptor – unwrap TigerGraph envelope
  tgClient.interceptors.response.use(
    (res) => {
      // TG returns { version, error, message, results }
      if (res.data && res.data.results !== undefined) {
        res.data._raw = { ...res.data };
        res.data = res.data.results;
      }
      return res;
    },
    (err) => {
      console.error("❌ TigerGraph API error:", err.message);
      return Promise.reject(err);
    }
  );

  return tgClient;
}

/**
 * Connect & verify TigerGraph is reachable
 */
async function connectTigerGraph() {
  const client = createTigerGraphClient();
  if (!client) return null;

  try {
    // Ping the echo endpoint to verify connectivity
    await client.get(`/echo/${env.TG_GRAPH_NAME}`);
    console.log(`✅ TigerGraph connected (graph: ${env.TG_GRAPH_NAME})`);
    return client;
  } catch (e) {
    console.error("❌ TigerGraph connection failed:", e.message);
    console.warn("⚠️  Continuing without TigerGraph – graph features disabled");
    tgClient = null;
    return null;
  }
}

function getTigerGraphClient() {
  return tgClient;
}

module.exports = { connectTigerGraph, getTigerGraphClient };
