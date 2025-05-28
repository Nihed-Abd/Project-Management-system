import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiX, FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const ChatBot = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm HEC Assistant. How can I help you with your electrical needs today?", sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: newMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Show bot is typing
    setIsTyping(true);

    try {
      // Send message to Gemini API via our backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot/message`,
        { message: newMessage }
      );

      // Add bot response to chat
      setTimeout(() => {
        setIsTyping(false);
        if (response.data.success) {
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: response.data.message, sender: 'bot' }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { 
              id: Date.now(), 
              text: "I'm sorry, I'm having trouble connecting to my services. Please try again later.",
              sender: 'bot' 
            }
          ]);
        }
      }, 700); // Slight delay for a more natural feeling
    } catch (error) {
      console.error('Chatbot error:', error);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now(), 
            text: "I'm sorry, I'm having trouble connecting to my services. Please try again later.",
            sender: 'bot' 
          }
        ]);
      }, 700);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <motion.button
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg ${
          isOpen ? 'bg-gray-100' : 'bg-coquelicot text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMessageSquare className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute bottom-20 right-0 w-80 md:w-96 rounded-lg shadow-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat header */}
            <div className="bg-coquelicot text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3">
                  <span className="text-coquelicot font-bold text-sm">HEC</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">HEC Assistant</h3>
                  <p className="text-xs opacity-75">Electrical Services Expert</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white p-1 rounded hover:bg-coquelicot-600 transition-colors"
                aria-label="Minimize chat"
              >
                <FiChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Chat messages */}
            <div 
              className={`h-80 p-4 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} 
              ref={chatContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-coquelicot text-white rounded-tr-none'
                        : `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-tl-none`
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex mb-4">
                  <div className={`p-3 rounded-lg rounded-tl-none ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className={`border-t p-3 flex ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-coquelicot focus:border-coquelicot ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                disabled={isTyping}
              />
              <button
                type="submit"
                className={`bg-coquelicot text-white p-2 rounded-r-md ${
                  newMessage.trim() === '' || isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-coquelicot-600'
                }`}
                disabled={newMessage.trim() === '' || isTyping}
              >
                <FiSend className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
