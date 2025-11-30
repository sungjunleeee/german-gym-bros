"use client";

import { ChevronLeft, Star, X, Send, RefreshCw } from "lucide-react";
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
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [planData, setPlanData] = useState<any>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chat_messages');
    const savedState = sessionStorage.getItem('chat_backend_state');
    const savedPlan = sessionStorage.getItem('chat_plan_data');
    const savedIsAdded = sessionStorage.getItem('chat_plan_added');

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedState) {
      setBackendState(JSON.parse(savedState));
    }
    if (savedPlan) {
      setPlanData(JSON.parse(savedPlan));
    }
    if (savedIsAdded) {
      setIsAdded(JSON.parse(savedIsAdded));
    }
    setIsLoaded(true);
  }, []);

  // Save state to sessionStorage on change
  useEffect(() => {
    if (!isLoaded) return;

    if (messages.length > 0) {
      sessionStorage.setItem('chat_messages', JSON.stringify(messages));
    }
    if (backendState) {
      sessionStorage.setItem('chat_backend_state', JSON.stringify(backendState));
    }
    if (planData) {
      sessionStorage.setItem('chat_plan_data', JSON.stringify(planData));
    }
    sessionStorage.setItem('chat_plan_added', JSON.stringify(isAdded));
  }, [messages, backendState, planData, isAdded, isLoaded]);

  const handleStartOver = async () => {
    setMessages([]);
    setBackendState(null);
    setPlanData(null);
    setShowPlan(false);
    setInput("");
    setIsAdded(false);

    // Clear session storage
    sessionStorage.removeItem('chat_messages');
    sessionStorage.removeItem('chat_backend_state');
    sessionStorage.removeItem('chat_plan_data');
    sessionStorage.removeItem('chat_plan_added');

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

      // Success
      setIsAdded(true);
      sessionStorage.setItem('chat_plan_added', JSON.stringify(true));

      // Navigate home immediately
      router.push('/weekly-plan');
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Initial greeting - only if no saved messages
  useEffect(() => {
    const initChat = async () => {
      // Check if we already have messages (loaded from session)
      if (sessionStorage.getItem('chat_messages')) return;

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
        <header className="px-4 py-4 flex items-center justify-between pt-12 shrink-0 bg-[#1a1f18] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border border-[#fbbf24] flex items-center justify-center rounded-sm shrink-0">
              <Star className="text-[#fbbf24] fill-[#fbbf24]" size={20} />
              <span className="text-[6px] text-white absolute mt-6 font-bold tracking-tighter">U.S.ARMY</span>
            </div>
            <div className="h-[44px] flex items-center">
              <h1 className="text-xl font-semibold tracking-wide">Build New Plan</h1>
            </div>
          </div>
          <button
            onClick={handleStartOver}
            className="text-gray-400 hover:text-white transition-colors p-2"
            title="Restart Chat"
          >
            <RefreshCw size={20} />
          </button>
        </header>

        {/* Objective & Constraints Bar */}
        <div className="bg-[#394d26] py-2 flex items-center justify-center m-4 rounded-md shadow-sm shrink-0">
          <h2 className="text-white text-lg font-medium">Objective & Constraints</h2>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-6 flex flex-col overflow-hidden relative pb-20">

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
                      disabled={isSaving || isAdded}
                      className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isAdded
                        ? "bg-green-600 text-white hover:bg-green-600"
                        : "bg-[#fbbf24] hover:bg-[#d9a51f] text-black"
                        }`}
                    >
                      {isSaving ? "Saving..." : isAdded ? "Added!" : "Add Plan"}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-2 pb-2">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={planData ? "Start over to create a new plan." : "Type your answer..."}
                  disabled={!!planData}
                  className="w-full bg-[#363d31] text-white placeholder-gray-400 rounded-xl py-3 pl-4 pr-12 border border-white/10 focus:outline-none focus:border-[#4b5042] disabled:bg-[#22281f] disabled:text-gray-600 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!!planData}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-300"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>



        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-[#1a1f18] border-t border-white/10 flex z-40">
          <Link href="/" className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Daily<br />Plan</span>
          </Link>
          <Link href="/weekly-plan" className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Weekly<br />Plan</span>
          </Link>
          <button className="flex-1 py-4 flex flex-col items-center justify-center gap-1 bg-[#2a3026]">
            <span className="text-xs font-bold text-white leading-tight text-center">Build<br />New Plan</span>
          </button>
          <button className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Squad<br />Info</span>
          </button>
        </nav>

        {/* Plan Overlay - Moved to root to cover everything */}
        {showPlan && planData && (
          <div className="absolute inset-0 bg-[#22281f] z-50 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="p-4 flex items-center justify-between bg-[#394d26] shadow-md shrink-0">
              <h2 className="text-xl font-bold text-white">Your Squad Plan</h2>
              <button onClick={() => setShowPlan(false)} className="p-2 text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 pb-6">
              {planData.map((day: any, i: number) => (
                <div key={i} className="bg-[#363d31] rounded-xl p-2 border border-white/5 shadow-sm">
                  <h3 className="text-[#fbbf24] font-bold text-lg mb-2 border-b border-white/10 pb-2">Day {day.day}</h3>

                  <div className="space-y-2">
                    {/* Warmup */}
                    {day.warmup && day.warmup.length > 0 && (
                      <WarmupSection data={day.warmup} />
                    )}

                    {/* Circuits */}
                    {day.circuits && day.circuits.map((circuit: any, cIdx: number) => (
                      <div key={cIdx} className="bg-[#2a3025] rounded-lg p-3 border border-[#394d26]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#fbbf24] font-medium text-sm">CIRCUIT {cIdx + 1}</span>
                          <span className="text-xs text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full">{circuit.rounds} Rounds</span>
                        </div>
                        <div className="space-y-2">
                          {circuit.exercises.map((ex: any, eIdx: number) => (
                            <div key={eIdx} className="flex justify-between text-sm">
                              <span className="text-gray-200">{ex.name}</span>
                              <span className="text-gray-400 text-sm"> {ex.reps} reps</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Cardio */}
                    {day.cardio && (
                      <div className="p-3 bg-[#2a3025] rounded-lg border border-[#394d26]">
                        <div className="text-[#fbbf24] text-sm font-bold mb-1">CARDIO</div>
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm">{day.cardio.type}</span>
                          <span className="text-gray-400 text-sm">{day.cardio.duration_minutes} mins</span>
                        </div>
                      </div>
                    )}

                    {/* Cooldown */}
                    {day.cooldown && day.cooldown.length > 0 && (
                      <WarmupSection data={day.cooldown} title="Cooldown" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WarmupSection({ data, title = "Warmup" }: { data: string[], title?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayData = isExpanded ? data : data.slice(0, 3);
  const hasMore = data.length > 3;

  return (
    <div className="bg-[#394d26]/30 rounded-lg p-3 border border-[#394d26]">
      <h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">{title}</h4>
      <div className="space-y-1">
        {displayData.map((w, idx) => (
          <div key={idx} className="text-sm text-gray-300">{w}</div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#fbbf24] mt-2 hover:underline focus:outline-none"
        >
          {isExpanded ? "Show less" : `...and ${data.length - 3} more`}
        </button>
      )}
    </div>
  );
}
