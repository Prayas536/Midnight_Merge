import React from "react";

// Parse markdown to HTML elements
const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Split by lines first to handle numbered lists and paragraphs
  const lines = text.split('\n');
  const elements = [];
  
  lines.forEach((line, index) => {
    let element = line;
    
    // Handle bold text (**text** or __text__)
    element = element.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    element = element.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Handle italic text (*text* or _text_)
    element = element.replace(/\*(.+?)\*/g, '<em>$1</em>');
    element = element.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Handle code blocks (`code`)
    element = element.replace(/`(.+?)`/g, '<code>$1</code>');
    
    if (element.trim()) {
      elements.push(
        <div key={index} dangerouslySetInnerHTML={{ __html: element }} />
      );
    } else if (line === '') {
      // Add spacing for empty lines
      elements.push(<div key={index} style={{ height: '0.5rem' }} />);
    }
  });
  
  return elements.length > 0 ? elements : text;
};

export default function ChatBubble({ 
  message, 
  isUser, 
  timestamp, 
  isError, 
  isLoading 
}) {
  // Handle different message formats
  // If message is a string, use it directly
  // If message is an object, extract text property
  let text = '';
  
  if (typeof message === 'string') {
    text = message;
  } else if (message?.text) {
    text = message.text;
  } else if (message?.content) {
    text = message.content;
  } else {
    text = String(message) || '';
  }

  const actualIsUser = typeof isUser !== 'undefined' ? isUser : message?.role === "user";
  const actualTimestamp = timestamp || (message?.timestamp ? new Date(message.timestamp) : new Date());
  const actualIsLoading = isLoading || message?.loading;
  const actualIsError = isError || message?.type === 'error';

  if (actualIsLoading) {
    return (
      <div className="chat-bubble-group assistant">
        <div className="bubble loading">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble-group ${actualIsUser ? 'user' : actualIsError ? 'error' : 'assistant'}`}>
      <div className={`bubble ${actualIsUser ? 'user' : actualIsError ? 'error' : 'assistant'}`}>
        {actualIsError && (
          <div className="error-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
        )}
        <div className="message-text">
          {!actualIsUser && !actualIsError ? parseMarkdown(text) : text}
        </div>
        <span className="message-time">
          {actualTimestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

