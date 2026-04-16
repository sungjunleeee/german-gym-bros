"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { API_URL } from "@/config";

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface AdaptChatModalProps {
  program: any;
  onClose: () => void;
  onPlanUpdated: (updatedPlan: any) => void;
}

export function AdaptChatModal({ program, onClose, onPlanUpdated }: AdaptChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial message from the AI
    setMessages([
      {
        role: "ai",
        text: "I have your current plan loaded. How would you like to adapt it? For example, you can say 'I don't have a barbell today' or 'make tomorrow's workout shorter'."
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/adapt-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_plan: program,
          user_request: input,
        }),
      });

      if (!res.ok) {
        throw new Error('The AI could not modify the plan. Please try a different request.');
      }

      const data = await res.json();

      if (data.updated_plan) {
        onPlanUpdated(data.updated_plan);
        // The parent component will close the modal
      } else {
        // If the API sends back a clarifying question
        const aiMsg: Message = { role: 'ai', text: data.message || "I'm not sure how to handle that. Can you be more specific?" };
        setMessages(prev => [...prev, aiMsg]);
      }

    } catch (error: any) {
      const errorMsg: Message = { role: 'ai', text: error.message || "Sorry, something went wrong." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="w-full md:rounded-[30px] h-full bg-[#22281f] max-w-[400px] max-h-[850px] shadow-2xl flex flex-col text-white border-[#1a1f18]">
        {/* Header */}
        <header className="px-4 py-4 flex items-center md:rounded-t-[30px] justify-between shrink-0 bg-[#1a1f18] border-b border-white/10">
          <h2 className="text-xl font-semibold tracking-wide">Adapt Plan</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-gray-600">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 border border-white/5 shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-[#4b5042] text-white rounded-tr-sm'
                : 'bg-[#363d31] text-gray-200 rounded-tl-sm'
                }`}>
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#363d31] rounded-2xl rounded-tl-sm p-4 border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Adapting plan...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the changes..."
              disabled={isLoading}
              className="w-full bg-[#363d31] text-white placeholder-gray-400 rounded-xl py-3 pl-4 pr-12 border border-white/10 focus:outline-none focus:border-[#4b5042] disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
