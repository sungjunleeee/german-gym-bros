"use client";

import { Star, CloudRain, AlertTriangle, Activity, Dumbbell, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { WeatherWidget } from "@/components/weather-widget";
import { WorkoutDetailView } from "@/components/workout-detail-view";
import { getCachedProgram, setCachedProgram } from "@/lib/program-cache";
import { WeeklyPlanView } from "@/components/weekly-plan-view";
import { useScrollSave } from "@/hooks/use-scroll-save";
import { AdaptChatModal } from "@/components/adapt-chat-modal";

import { API_URL } from "@/config";

export default function Home() {
  const [activeProgram, setActiveProgram] = useState<any>(getCachedProgram());
  const [isLoading, setIsLoading] = useState(!getCachedProgram());
  const scrollRef = useScrollSave("daily-plan-scroll", !isLoading);
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);

  const fetchProgram = async (force: boolean = false) => {
    try {
      if (!force) {
        const cached = getCachedProgram();
        if (cached) {
          setActiveProgram(cached);
          setIsLoading(false);
          return;
        }
      }

      const res = await fetch(`${API_URL}/active-program?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setActiveProgram(data);
        setCachedProgram(data);
      }
    } catch (error) {
      console.error("Failed to fetch active program", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, []);

  const handlePlanUpdated = (updatedPlan: any) => {
    setActiveProgram(updatedPlan);
    setCachedProgram(updatedPlan);
    setIsAdaptModalOpen(false);
  };

  // Helper to render workout components
  const renderWorkoutTable = (workout: any) => {
    if (!workout || !workout.components) return null;

    const rows = [];

    // Warmup
    const warmup = workout.components.find((c: any) => c.component_type === 'warmup');
    if (warmup && warmup.data && Array.isArray(warmup.data) && warmup.data.length > 0) {
      const firstItem = warmup.data[0];
      const remainingCount = warmup.data.length - 1;

      const value = (
        <div className="flex items-center justify-center w-full overflow-hidden">
          <span className="truncate min-w-0">{firstItem}</span>
          {remainingCount > 0 && (
            <span className="shrink-0 whitespace-nowrap ml-1">+{remainingCount} more</span>
          )}
        </div>
      );
      rows.push({ label: "Warm-up", value });
    }

    // Circuits (Strength/Work)
    const circuits = workout.components.filter((c: any) => c.component_type === 'circuit');
    if (circuits.length > 0) {
      rows.push({ label: "Strength", value: `${circuits.length} ${circuits.length === 1 ? 'Circuit' : 'Circuits'} - See Details` });
    }

    // Cardio
    const cardio = workout.components.find((c: any) => c.component_type === 'cardio');
    if (cardio && cardio.data) {
      rows.push({ label: "Cardio", value: cardio.data.type || "Cardio Session" });
    }

    // Cooldown
    const cooldown = workout.components.find((c: any) => c.component_type === 'cooldown');
    if (cooldown && cooldown.data && Array.isArray(cooldown.data) && cooldown.data.length > 0) {
      const firstItem = cooldown.data[0];
      const remainingCount = cooldown.data.length - 1;

      const value = (
        <div className="flex items-center justify-center w-full overflow-hidden">
          <span className="truncate min-w-0">{firstItem}</span>
          {remainingCount > 0 && (
            <span className="shrink-0 whitespace-nowrap ml-1">+{remainingCount} more</span>
          )}
        </div>
      );
      rows.push({ label: "Cooldown", value });
    }

    return (
      <div className="border border-white/20 rounded-lg overflow-hidden mb-4 text-sm">
        {rows.map((row, i) => (
          <div key={i} className={`flex ${i !== rows.length - 1 ? 'border-b border-white/20' : ''}`}>
            <div className="w-[100px] bg-[#363d31] p-3 flex items-center justify-center font-medium border-r border-white/20">
              {row.label}
            </div>
            <div className="flex-1 bg-[#22281f] p-3 flex items-center justify-center text-center min-w-0">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get today's workout (Day 1 for MVP)
  const todaysWorkout = activeProgram?.workouts?.[0];

  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="h-[100dvh] md:min-h-screen w-full flex md:items-center md:justify-center md:bg-black/90 md:p-4 bg-[#22281f] font-sans overflow-hidden overscroll-none">
      {/* Mobile Container */}
      <div className="w-full h-[100dvh] md:h-[850px] md:max-w-[400px] bg-[#22281f] md:rounded-[30px] overflow-hidden shadow-2xl relative flex flex-col text-white md:border border-[#1a1f18]">

        {/* Header */}
        <header className="px-4 py-4 flex flex-col items-center pt-4 md:pt-12 space-y-4">
          <div className="flex items-center gap-3">
            {/* Army Logo */}
            <div className="w-10 h-10 bg-black border border-[#fbbf24] flex items-center justify-center rounded-sm shrink-0">
              <Star className="text-[#fbbf24] fill-[#fbbf24]" size={20} />
              <span className="text-[6px] text-white absolute mt-6 font-bold tracking-tighter">U.S.ARMY</span>
            </div>
            <h1 className="text-xl font-semibold tracking-wide">2CR PT COMMAND</h1>
          </div>

          <div className="w-full text-center space-y-1">
            <h2 className="text-2xl font-bold">Today’s PT: 0630 - 0800</h2>
            <p className="text-sm text-gray-300">
              {activeProgram ? `Objective: ${todaysWorkout?.focus || "General Fitness"}` : "No Active Plan"}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main ref={scrollRef as any} className="flex-1 px-4 overflow-y-auto pb-24">

          {/* PT Schedule Table or Empty State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">Loading plan...</div>
          ) : activeProgram ? (
            <>
              <div onClick={() => setShowDetail(true)} className="cursor-pointer transition-transform">
                {renderWorkoutTable(todaysWorkout)}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-6">

                <button
                  onClick={() => setIsAdaptModalOpen(true)}
                  className="bg-[#394d26] hover:bg-[#4b5f36] py-3 rounded-lg font-medium text-sm transition-colors shadow-sm border border-white/10"
                >
                  Auto-Adapt
                </button>
                <button
                  onClick={() => setShowWeeklyPlan(true)}
                  className="bg-[#394d26] hover:bg-[#4b5f36] py-3 rounded-lg font-medium text-sm transition-colors shadow-sm border border-white/10 leading-tight"
                >
                  View Full Week
                </button>
                <button className="bg-[#394d26] hover:bg-[#4b5f36] py-3 rounded-lg font-medium text-sm transition-colors shadow-sm border border-white/10 leading-tight">
                  Send To Squad
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/20 rounded-xl mb-6 p-6 text-center space-y-4">
              <Dumbbell className="text-gray-500" size={48} />
              <div>
                <h3 className="text-lg font-bold text-white">No Active Plan</h3>
                <p className="text-sm text-gray-400">Your squad needs a mission.<br />Build a new PT plan to get started.</p>
              </div>
              <Link href="/build-plan" className="bg-[#fbbf24] hover:bg-[#d9a51f] text-black font-bold py-3 px-6 rounded-xl shadow-lg transition-colors w-full">
                Build New Plan
              </Link>
            </div>
          )}


          {/* Operational Alerts */}
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Operational Alerts</h3>
            <div className="space-y-2">
              {/* Weather Widget */}
              <WeatherWidget />

              {/* Soldier Conditions */}
              <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#2a3026]">
                <div className="w-[140px] bg-[#363d31] p-3 flex flex-col items-center justify-center text-center border-r border-white/10">
                  <span className="font-bold text-sm leading-tight">Soldier Conditions</span>
                  <span className="text-xs text-red-400 mt-1">1 soldier injured</span>
                </div>
                <div className="flex-1 p-3 flex flex-col items-center justify-center text-center text-xs text-gray-300">
                  <span>1 soldier logged knee pain</span>
                  <span>2 soldiers logged high fatigue</span>
                </div>
              </div>
            </div>
          </section>

          {/* Squad Readiness */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Squad Preparedness</h3>
            <div className="bg-[#363d31] h-4 rounded-full overflow-hidden">
              <div className="bg-[#4b5f36] w-[5%] h-full rounded-full" />
            </div>
          </section>

        </main>

        {/* Bottom Navigation */}
        <nav
          className="absolute bottom-0 w-full bg-[#1a1f18] border-t border-white/10 flex select-none"
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none' } as any}
        >
          <Link href="/" className="flex-1 py-4 flex flex-col items-center justify-center gap-1 bg-[#2a3026]">
            <span className="text-xs font-bold text-white leading-tight text-center">Current<br />Plan</span>
          </Link>
          <Link href="/build-plan" className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Build<br />New Plan</span>
          </Link>
          <button className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Squad<br />Info</span>
          </button>
        </nav>

        {/* Workout Detail Overlay */}
        {showDetail && todaysWorkout && (
          <WorkoutDetailView
            workout={todaysWorkout}
            onClose={() => setShowDetail(false)}
            onRefresh={() => fetchProgram(true)}
          />
        )}

        {/* Adapt Plan Chat Modal */}
        {isAdaptModalOpen && activeProgram && (
          <AdaptChatModal
            program={activeProgram}
            onClose={() => setIsAdaptModalOpen(false)}
            onPlanUpdated={handlePlanUpdated}
          />
        )}

        {/* Weekly Plan Overlay */}
        {showWeeklyPlan && activeProgram && (
          <WeeklyPlanView
            program={activeProgram}
            onClose={() => setShowWeeklyPlan(false)}
            onRefresh={() => fetchProgram(true)}
          />
        )}
      </div>
    </div>
  );
}
