"use client";

import { ChevronLeft, Star, X, Send } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export default function BuildPlan() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [backendState, setBackendState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [planData, setPlanData] = useState<any>(null);
  const [showPlan, setShowPlan] = useState(false);

  const handleStartOver = async () => {
    setMessages([]);
    setBackendState(null);
    setPlanData(null);
    setShowPlan(false);
    setInput("");

    // Re-init chat
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "", state: null }),
      });
      const data = await res.json();
      setMessages([{ role: 'ai', text: data.message }]);
      setBackendState(data.state);
    } catch (error) {
      console.error("Failed to re-init chat", error);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleAddPlan = async () => {
    if (!planData) return;

    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:8000/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_data: planData }),
      });

      if (!res.ok) throw new Error("Failed to save plan");

      // Success - navigate home
      router.push('/');
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Initial greeting
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "", state: null }),
        });
        const data = await res.json();
        setMessages([{ role: 'ai', text: data.message }]);
        setBackendState(data.state);
      } catch (error) {
        console.error("Failed to connect to chat backend", error);
      }
    };
    initChat();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, state: backendState }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'ai', text: data.message }]);
      setBackendState(data.state);

      if (data.is_complete) {
        if (data.plan_data) {
          setPlanData(data.plan_data);
        }
      }
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 p-4 font-sans">
      {/* Mobile Container */}
      <div className="w-full max-w-[400px] bg-[#22281f] rounded-[30px] overflow-hidden shadow-2xl relative h-[850px] flex flex-col text-white border border-[#1a1f18]">

        {/* Header */}
        <header className="px-4 py-4 flex items-center gap-3 pt-12 shrink-0">
          <div className="w-10 h-10 bg-black border border-[#fbbf24] flex items-center justify-center rounded-sm shrink-0">
            <Star className="text-[#fbbf24] fill-[#fbbf24]" size={20} />
            <span className="text-[6px] text-white absolute mt-6 font-bold tracking-tighter">U.S.ARMY</span>
          </div>

          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            <ChevronLeft size={28} strokeWidth={2.5} />
          </Link>

          <h1 className="text-xl font-semibold tracking-wide ml-1">Build New Plan</h1>
        </header>

        {/* Objective & Constraints Bar */}
        <div className="bg-[#394d26] py-2 flex items-center justify-center mb-4 mx-4 rounded-md shadow-sm shrink-0">
          <h2 className="text-white text-lg font-medium">Objective & Constraints</h2>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-6 flex flex-col overflow-hidden relative">

          {/* Static Form Fields (Visual Only for now as per design) */}
          <div className="space-y-4 mb-6 shrink-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-300 text-sm ml-1">PT Test</label>
                <div className="bg-[#363d31] rounded-lg h-10 flex items-center justify-between px-3 border border-white/5">
                  <span className="text-white">ACFT</span>
                  <ChevronLeft className="rotate-[-90deg] text-white/50" size={16} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-gray-300 text-sm ml-1">Test Date</label>
                <div className="bg-[#363d31] rounded-lg h-10 flex items-center justify-center px-3 border border-white/5">
                  <span className="text-white">03/08/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
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
                    <p className="text-gray-400 text-sm animate-pulse">Thinking...</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {planData && !isLoading && (
                <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
                  <button
                    onClick={() => setShowPlan(true)}
                    className="w-full bg-[#363d31] hover:bg-[#4b5042] text-white font-medium py-3 rounded-xl border border-white/10 transition-colors"
                  >
                    View Generated Plan
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleStartOver}
                      className="flex-1 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium py-3 rounded-xl border border-white/10 transition-colors"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={handleAddPlan}
                      disabled={isSaving}
                      className="flex-1 bg-[#fbbf24] hover:bg-[#d9a51f] text-black font-bold py-3 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Saving..." : "Add Plan"}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-4 pb-6">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your answer..."
                  className="w-full bg-[#363d31] text-white placeholder-gray-400 rounded-xl py-3 pl-4 pr-12 border border-white/10 focus:outline-none focus:border-[#4b5042]"
                />
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Plan Overlay */}
          {showPlan && planData && (
            <div className="absolute inset-0 bg-[#22281f] z-50 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
              <div className="p-4 flex items-center justify-between bg-[#394d26] shadow-md shrink-0">
                <h2 className="text-xl font-bold text-white">Your Squad Plan</h2>
                <button onClick={() => setShowPlan(false)} className="p-2 text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-600">
                {planData.map((day: any, i: number) => (
                  <div key={i} className="bg-[#363d31] rounded-xl p-5 border border-white/5 shadow-sm">
                    <h3 className="text-[#fbbf24] font-bold text-lg mb-3 border-b border-white/10 pb-2">Day {day.day}</h3>

                    {/* Warmup */}
                    {day.warmup && day.warmup.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Warmup</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {day.warmup.slice(0, 3).map((w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          ))}
                          {day.warmup.length > 3 && <li className="text-gray-500 italic">...and {day.warmup.length - 3} more</li>}
                        </ul>
                      </div>
                    )}

                    {/* Circuits */}
                    {day.circuits && day.circuits.map((circuit: any, cIdx: number) => (
                      <div key={cIdx} className="mb-4 bg-[#2a3025] rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium text-sm">Circuit {cIdx + 1}</span>
                          <span className="text-xs text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full">{circuit.rounds} Rounds</span>
                        </div>
                        <div className="space-y-2">
                          {circuit.exercises.map((ex: any, eIdx: number) => (
                            <div key={eIdx} className="flex justify-between text-sm">
                              <span className="text-gray-200">{ex.name}</span>
                              <span className="text-gray-400 text-xs">{ex.difficulty}/5</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Cardio */}
                    {day.cardio && (
                      <div className="mt-2 p-3 bg-[#394d26]/30 rounded-lg border border-[#394d26]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#fbbf24] text-sm font-bold">CARDIO</span>
                          <span className="text-white text-sm">{day.cardio.type}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{day.cardio.duration_minutes} mins</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
