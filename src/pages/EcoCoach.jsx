import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import ecoCoachImg from '../assets/images/eco-coach.png';
import ecoCoachAltImg from '../assets/images/eco-coach-alt.png';
import { useCarbon } from '../context/CarbonContext';
import { generateMockCoachResponse, conversationStarters } from '../data/ecoCoach';

const impactColors = {
  high: 'border-l-rose-500 bg-rose-500/5',
  medium: 'border-l-amber-500 bg-amber-500/5',
  low: 'border-l-blue-500 bg-blue-500/5',
  info: 'border-l-blue-500 bg-blue-500/5',
  positive: 'border-l-emerald-500 bg-emerald-500/5',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function BotMessage({ response }) {
  const colorClass = impactColors[response.impact] || impactColors.info;
  return (
    <div className="flex items-end gap-2 animate-slide-up">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-emerald-500/20">
        <img src={ecoCoachAltImg} alt="Coach" className="w-full h-full object-cover" />
      </div>
      <div className={`glass-card p-4 rounded-2xl rounded-bl-md max-w-[80%] border-l-4 ${colorClass}`}>
        {response.title && (
          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">{response.title}</h4>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{response.message}</p>
        <span className="text-[10px] text-gray-400 mt-2 block">
          {new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end animate-slide-in-right">
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%]">
        <p className="text-sm">{text}</p>
        <span className="text-[10px] text-white/70 mt-1 block">
          {new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function EcoCoach() {
  const { state, addChatMessage } = useCarbon();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history or send initial greeting
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    if (state.chatHistory && state.chatHistory.length > 0) {
      setMessages(state.chatHistory);
    } else {
      // Auto-send welcome greeting via Local Mock Engine
      setIsTyping(true);
      const fetchGreeting = async () => {
        try {
          const responses = await generateMockCoachResponse(state, '');
          const botMessages = responses.map((r) => ({ type: 'bot', ...r, timestamp: Date.now() }));
          setMessages(botMessages);
          botMessages.forEach((m) => addChatMessage(m));
        } catch (error) {
          console.error('[EcoCoach fetchGreeting] Error:', error);
          const errorMsg = { 
            type: 'bot', 
            title: 'System Error', 
            message: `I encountered a local error: ${error.message || 'Unknown error'}. Please check the console.`, 
            impact: 'high', 
            timestamp: Date.now() 
          };
          setMessages([errorMsg]);
          addChatMessage(errorMsg);
        } finally {
          setIsTyping(false);
        }
      };
      fetchGreeting();
    }
  }, [initialized, state, addChatMessage]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg = { type: 'user', text: msg, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const responses = await generateMockCoachResponse(state, msg);
      const botMessages = responses.map((r) => ({ type: 'bot', ...r, timestamp: Date.now() }));
      setMessages((prev) => [...prev, ...botMessages]);
      botMessages.forEach((m) => addChatMessage(m));
    } catch (error) {
      console.error('[EcoCoach handleSend] Error:', error);
      const errorMsg = { 
        type: 'bot', 
        title: 'System Error', 
        message: `Sorry, I encountered a local error: ${error.message || 'Unknown error'}.`, 
        impact: 'high', 
        timestamp: Date.now() 
      };
      setMessages((prev) => [...prev, errorMsg]);
      addChatMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showStarters = messages.length === 0 && !isTyping;

  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100dvh-32px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 md:p-6 pb-3 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden ring-2 ring-emerald-500/20">
            <img src={ecoCoachAltImg} alt="Coach" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              EcoWise AI Coach
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your personalized sustainability advisor</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-4 pb-4">
        {showStarters && (
          <div className="py-8 space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <img src={ecoCoachImg} alt="AI Coach" className="w-full h-full object-contain relative z-10 animate-float" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">How can I help?</h2>
              <p className="text-sm text-gray-500 mt-1">Ask me anything about reducing your carbon footprint</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conversationStarters.map((starter) => (
                <button
                  key={starter.query}
                  onClick={() => handleSend(starter.query)}
                  className="glass-card p-3 text-left text-sm hover:bg-emerald-500/5 transition-all group"
                >
                  <span className="mr-2">{starter.label.split(' ')[0]}</span>
                  <span className="text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {starter.label.split(' ').slice(1).join(' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.type === 'user' ? (
            <UserMessage key={i} text={msg.text} />
          ) : (
            <BotMessage key={i} response={msg} />
          )
        )}

        {isTyping && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 md:p-6 pt-3">
        <div className="glass-card flex items-center gap-2 p-2 ring-1 ring-gray-200/50 dark:ring-white/10 focus-within:ring-emerald-500/50 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your eco coach..."
            className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:hover:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
