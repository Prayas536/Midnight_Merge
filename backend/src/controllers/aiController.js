const axios = require("axios");
const { env } = require("../config/env");

const chatWithAI = async (req, res) => {
  try {
    const { userMessage, predictionContext, chatHistory } = req.body;

    if (!userMessage || !predictionContext) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userMessage or predictionContext"
      });
    }

    // Use environment variable or default to localhost
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

    console.log("🤖 AI Chat Request:");
    console.log("  URL:", `${mlServiceUrl}/ai/chat`);
    console.log("  User Message:", userMessage);
    console.log("  Prediction Context Risk:", predictionContext.risk_percent);
    console.log("  Chat History Length:", chatHistory?.length || 0);

    const response = await axios.post(
      `${mlServiceUrl}/ai/chat`,
      {
        user_message: userMessage,
        prediction_context: predictionContext,
        chat_history: chatHistory || []
      },
      {
        timeout: 30000  // Increased timeout
      }
    );

    console.log("✅ AI Response received");

    if (!response.data || !response.data.reply) {
      console.error("❌ Invalid response structure:", response.data);
      return res.status(500).json({
        success: false,
        message: "Invalid response from AI service"
      });
    }

    return res.status(200).json({
      success: true,
      reply: response.data.reply
    });

  } catch (error) {
    console.error("❌ AI Chat Error:", error.message);
    
    if (error.response) {
      // Server responded with error status
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("   No response from ML Service");
      console.error("   Request details:", error.request);
    } else {
      // Error in request setup
      console.error("   Error details:", error.config);
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "❌ ML service is offline. Make sure Python ML service is running on port 8000"
      });
    }

    if (error.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        message: "❌ Cannot reach ML service. Check if it's running"
      });
    }

    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message: error.response.data?.detail || "AI service unavailable"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || "AI service error"
    });
  }
};

module.exports = { chatWithAI };
