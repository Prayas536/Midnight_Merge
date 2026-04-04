const axios = require("axios");
const { env } = require("../config/env");
const graphService = require("../services/graphService");

const chatWithAI = async (req, res) => {
  try {
    const { userMessage, predictionContext, chatHistory, patientPid } = req.body;

    if (!userMessage || !predictionContext) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userMessage or predictionContext"
      });
    }

    // ── Graph RAG: fetch patient's graph context ──
    let graphContext = null;
    if (patientPid && graphService.isGraphAvailable()) {
      try {
        graphContext = await graphService.getPatientGraphContext(patientPid);
        console.log("📊 Graph RAG context loaded for:", patientPid);
      } catch (graphErr) {
        console.warn("⚠️  Graph context unavailable:", graphErr.message);
      }
    }

    // Use environment variable or default to localhost
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

    console.log("🤖 AI Chat Request:");
    console.log("  URL:", `${mlServiceUrl}/ai/chat`);
    console.log("  User Message:", userMessage);
    console.log("  Prediction Context Risk:", predictionContext.risk_percent);
    console.log("  Chat History Length:", chatHistory?.length || 0);
    console.log("  Graph Context:", graphContext ? "✅ loaded" : "⏭️ skipped");

    const response = await axios.post(
      `${mlServiceUrl}/ai/chat`,
      {
        user_message: userMessage,
        prediction_context: predictionContext,
        chat_history: chatHistory || [],
        // ── Inject graph context into LLM payload ──
        graph_context: graphContext ? {
          family_members: graphContext.find(r => r.family_members)?.family_members || [],
          conditions: graphContext.find(r => r.conditions)?.conditions || [],
          medications: graphContext.find(r => r.medications)?.medications || [],
          lab_history: graphContext.find(r => r.lab_history)?.lab_history || [],
          current_risk_score: graphContext.find(r => r.current_risk_score !== undefined)?.current_risk_score,
          current_risk_label: graphContext.find(r => r.current_risk_label !== undefined)?.current_risk_label,
        } : null,
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

const generateNotes = async (req, res) => {
  try {
    const { patient_data, current_metrics, visit_history } = req.body;

    if (!patient_data || !current_metrics) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: patient_data or current_metrics"
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

    console.log("🤖 AI Notes Generation Request for:", patient_data.name);

    const response = await axios.post(
      `${mlServiceUrl}/ai/generate-notes`,
      { patient_data, current_metrics, visit_history: visit_history || [] },
      { timeout: 30000 }
    );

    console.log("✅ AI Notes generated");

    return res.status(200).json({
      success: true,
      data: {
        notes: response.data.notes,
        recommendations: response.data.recommendations
      }
    });

  } catch (error) {
    console.error("❌ AI Notes Generation Error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "ML service is offline"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || "Notes generation failed"
    });
  }
};

const analyzeHealthJourney = async (req, res) => {
  try {
    const { patient_data, all_visits } = req.body;

    if (!patient_data || !all_visits) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: patient_data or all_visits"
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

    console.log("🤖 Health Journey Analysis Request for:", patient_data.name);

    const response = await axios.post(
      `${mlServiceUrl}/ai/health-journey-analysis`,
      { patient_data, all_visits },
      { timeout: 45000 }
    );

    console.log("✅ Health Journey Analysis complete");

    return res.status(200).json({
      success: true,
      data: {
        analysis: response.data.analysis,
        visits_analyzed: response.data.visits_analyzed
      }
    });

  } catch (error) {
    console.error("❌ Health Journey Analysis Error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "ML service is offline"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || "Analysis failed"
    });
  }
};

module.exports = { chatWithAI, generateNotes, analyzeHealthJourney };

