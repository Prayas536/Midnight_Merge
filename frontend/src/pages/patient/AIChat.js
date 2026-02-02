import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import SuggestionChips from '../../components/chat/SuggestionChips';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AIChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [error, setError] = useState(null);
  const [predictionContext, setPredictionContext] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [noPredictionFound, setNoPredictionFound] = useState(false);
  const [usingLocalContext, setUsingLocalContext] = useState(false);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load context based on source
  useEffect(() => {
    const initChat = async () => {
      setLoadingPrediction(true);

      // 1. Check if we came from Prediction page
      if (location.state?.fromPrediction) {
        console.log('🔍 Coming from prediction page, checking local storage...');
        const localContext = localStorage.getItem("prediction_context");
        if (localContext) {
          try {
            const parsed = JSON.parse(localContext);
            console.log('✅ Loaded context from LocalStorage:', parsed);
            setPredictionContext(parsed);
            setUsingLocalContext(true);
            setNoPredictionFound(false);
            setLoadingPrediction(false);
            return;
          } catch (e) {
            console.error("Error parsing local context", e);
          }
        }
      }

      // 2. If not from prediction, or local storage failed, check if we should auto-load or show option
      // User requested: "Sidebar -> Quick Question bubble 'Use Last Checkup Data'"
      // This implies we DO NOT auto-load DB data immediately if coming from sidebar.

      console.log('ℹ️ Not from prediction page (or local load failed). Showing option to load DB data.');
      setLoadingPrediction(false);
      setNoPredictionFound(true);

      // We don't set a system message here yet, we'll let the render logic handle the "No Prediction Found" state
      // which shows the buttons.
      // Actually, existing logic uses system message for "Load Latest Check". Let's reuse or adapt that.

      const systemMessage = {
        id: Date.now(),
        type: 'assistant',
        text: '👋 Hi! I can help you with your health questions.',
        isSystemMessage: true,
        timestamp: new Date()
      };
      setMessages([systemMessage]);
    };

    initChat();
  }, [location.state]);


  // Send initial greeting when prediction context is loaded
  useEffect(() => {
    if (predictionContext && messages.length === 0) {
      console.log('🎉 Setting up greeting message...');
      const greeting = {
        id: Date.now(),
        type: 'assistant',
        text: `Hi 👋 I'm your AI health assistant. I can help you understand your diabetes risk assessment and answer any questions you have about your health. Feel free to ask me anything or use the quick questions below to get started!`,
        timestamp: new Date()
      };
      setMessages([greeting]);
      console.log('✅ Greeting message set');
    }
  }, [predictionContext]);

  // Handle sending message
  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim() || !predictionContext) {
      console.warn('❌ Cannot send message:', {
        hasMessage: !!userMessage.trim(),
        hasContext: !!predictionContext
      });
      return;
    }

    console.log('📤 Sending message:', userMessage);

    // Add user message to chat
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      // Prepare chat history for context (excluding greeting)
      const chatHistory = messages
        .slice(1) // Skip the initial greeting
        .map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      console.log('📨 Sending to AI with context:', {
        userMessage,
        risk_percent: predictionContext.risk_percent,
        chatHistory: chatHistory
      });

      // Call AI service
      const response = await api.post('/ai/chat', {
        userMessage: userMessage,
        predictionContext: predictionContext,
        chatHistory: chatHistory
      });

      console.log('✅ AI Response received:', response.data);

      if (response.data?.success && response.data?.reply) {
        const assistantMsg = {
          id: Date.now() + 1,
          type: 'assistant',
          text: response.data.reply,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'error',
        text: err.response?.data?.message || err.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
      setError(err.response?.data?.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion chip click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Handle clear chat
  const handleClearChat = () => {
    if (predictionContext) {
      const greeting = {
        id: Date.now(),
        type: 'assistant',
        text: `Hi 👋 I'm your AI health assistant. I can help you understand your diabetes risk assessment and answer any questions you have about your health. Feel free to ask me anything or use the quick questions below to get started!`,
        timestamp: new Date()
      };
      setMessages([greeting]);
      setShowSuggestions(true);
      setError(null);
    }
  };

  // Handle navigate back to prediction
  const handleGoToPredict = () => {
    navigate('/patient/predict');
  };

  // Retry loading latest prediction
  const handleLoadLatestCheck = async () => {
    console.log('🔄 Retrying to load latest prediction...');
    try {
      setLoadingPrediction(true);
      const response = await api.get('/my/latest-prediction');

      if (response.data?.success && response.data?.data) {
        console.log('✅ Latest prediction loaded:', response.data.data);
        setPredictionContext(response.data.data);
        setNoPredictionFound(false);
        // Clear the system message and show greeting
        setMessages([]);
      } else {
        setError('No prediction data found. Please complete a prediction first.');
      }
    } catch (err) {
      console.error('Error loading prediction:', err);
      setError('Failed to load prediction. Please try again or complete a new prediction.');
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Loading state while fetching prediction
  if (loadingPrediction) {
    return (
      <div className="ai-chat-container">
        <div className="ai-chat-error-state">
          <div className="error-content">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#667eea' }}></i>
            <h3>Loading Your Prediction</h3>
            <p>Fetching your latest diabetes risk prediction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!predictionContext && noPredictionFound) {
    return (
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <i className="fas fa-comments"></i>
            <div>
              <h2>AI Health Assistant</h2>
              <p>Ask me anything about your health</p>
            </div>
          </div>
        </div>

        <div className="ai-chat-messages">
          <ChatBubble
            message="👋 Hi! I can help you answer health questions based on your diabetes risk assessment. I can use your latest checkup data to provide personalized answers."
            isUser={false}
            timestamp={new Date()}
          />
          <div className="system-message-actions">
            <button
              className="chip-btn"
              style={{ fontSize: '0.95rem', padding: '10px 20px', borderRadius: '20px', border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)' }}
              onClick={handleLoadLatestCheck}
              disabled={loadingPrediction}
            >
              {loadingPrediction ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Loading data...
                </>
              ) : (
                <>
                  <i className="fas fa-file-medical me-2"></i>Use Last Checkup Data
                </>
              )}
            </button>
            <button
              className="chip-btn ms-2"
              style={{ fontSize: '0.95rem', padding: '10px 20px', borderRadius: '20px', border: '1px solid var(--muted)', background: 'transparent', color: 'var(--muted)' }}
              onClick={handleGoToPredict}
              disabled={loadingPrediction}
            >
              <i className="fas fa-plus me-2"></i>New Prediction
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <i className="fas fa-comments"></i>
          <div>
            <h2>AI Health Assistant</h2>
            <p>Ask me anything about your health</p>
          </div>
        </div>
        <div className="ai-chat-actions">
          <button
            className="btn-icon-small"
            onClick={handleClearChat}
            title="Clear chat"
            disabled={messages.length <= 1}
          >
            <i className="fas fa-trash"></i>
          </button>
          <button
            className="btn-icon-small"
            onClick={handleGoToPredict}
            title="Go to prediction"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isUser={message.type === 'user'}
            timestamp={message.timestamp}
            isError={message.type === 'error'}
          />
        ))}
        {loading && (
          <ChatBubble
            message="Thinking..."
            isUser={false}
            timestamp={new Date()}
            isLoading={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-suggestions">
        {showSuggestions && !loading && messages.length >= 1 && (
          <SuggestionChips
            onSelect={handleSuggestionClick}
            disabled={loading}
          />
        )}
      </div>

      <ChatInput
        onSend={handleSendMessage}
        disabled={loading || !predictionContext}
        placeholder="Ask about your health..."
      />

      {error && (
        <div className="ai-chat-error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button
            className="btn-close-error"
            onClick={() => setError(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}
