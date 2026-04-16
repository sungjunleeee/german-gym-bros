"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { WorkoutDetailView } from "./workout-detail-view";

function WarmupSection({ data, title = "Warmup" }: { data: string[], title?: string }) {
    const validData = data.filter(s => s.trim());
    if (validData.length === 0) return null;

    const displayData = validData.slice(0, 3);
    const hasMore = validData.length > 3;

    return (
        <div className="bg-[#394d26]/30 rounded-lg p-3 border border-[#394d26]">
            <h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">{title}</h4>
            <div className="space-y-1">
                {displayData.map((w, idx) => (
                    <div key={idx} className="text-sm text-gray-300">{w}</div>
                ))}
            </div>
            {hasMore && (
                <div className="text-xs text-gray-500 mt-2 italic">
                    ...and {validData.length - 3} more
                </div>
            )}
        </div>
    );
}


export function WeeklyPlanView({ program, onClose, onRefresh }: { program: any, onClose: () => void, onRefresh: () => void }) {
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

    // When the detail view is refreshed, the whole program is refetched.
    // We need to find the latest version of the selected workout to display.
    const handleRefresh = () => {
        onRefresh();
        if (selectedWorkout) {
            const updatedWorkout = program.workouts.find((w: any) => w.id === selectedWorkout.id);
            setSelectedWorkout(updatedWorkout || null);
        }
    }

    return (
        <>
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-in fade-in duration-300">
                <div className="w-full h-[100dvh] md:h-[850px] md:max-w-[400px] bg-[#22281f] md:rounded-[30px] overflow-hidden shadow-2xl flex flex-col text-white md:border border-[#1a1f18]">
                    {/* Header */}
                    <header className="px-4 py-3 flex items-center justify-between shrink-0 bg-[#1a1f18] border-b border-white/10">
                        <div>
                            <h1 className="text-xl font-semibold tracking-wide">Weekly Plan</h1>
                            <p className="text-xs text-gray-400">{program.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2">
                            <X size={24} />
                        </button>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 px-4 overflow-y-auto pb-6 pt-4">
                        <div className="space-y-6">
                            {/* Program Info */}
                            <div className="bg-[#2a3026] p-4 rounded-xl border border-white/10">
                                <h2 className="font-bold text-lg mb-1">{program.name}</h2>
                                <p className="text-sm text-gray-400">{program.description}</p>
                            </div>

                            {/* Weekly Schedule */}
                            <div className="space-y-4">
                                {program.workouts.map((day: any, index: number) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedWorkout(day)}
                                        className="bg-[#363d31] rounded-xl p-2 border border-white/5 shadow-sm cursor-pointer transition-transform active:scale-[0.98]"
                                    >
                                        {/* Day Header */}
                                        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                                            <h3 className="text-[#fbbf24] font-bold text-lg">Day {day.day_number}</h3>
                                        </div>

                                        {/* Day Content */}
                                        <div className="space-y-2">
                                            {day.components.map((comp: any, i: number) => (
                                                <div key={i}>
                                                    {comp.component_type === 'warmup' && comp.data && (
                                                        <WarmupSection data={comp.data} />
                                                    )}

                                                    {comp.component_type === 'circuit' && (
                                                        <div className="bg-[#2a3025] rounded-lg p-3 border border-[#394d26]">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[#fbbf24] font-medium text-sm">CIRCUIT {comp.order_index}</span>
                                                                <span className="text-xs text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full">{comp.data.rounds} {comp.data.rounds === 1 ? 'Round' : 'Rounds'}</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {comp.data.exercises.map((ex: any, eIdx: number) => (
                                                                    <div key={eIdx} className="flex justify-between text-sm">
                                                                        <span className="text-gray-200">{ex.name}</span>
                                                                        <span className="text-white/50"> {ex.reps} {ex.reps === '1' || ex.reps === 1 ? 'rep' : 'reps'}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {comp.component_type === 'cardio' && (
                                                        <div className="p-3 bg-[#2a3025] rounded-lg border border-[#394d26]">
                                                            <div className="text-[#fbbf24] text-sm font-bold mb-1">CARDIO</div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-white text-sm">{comp.data.type}</span>
                                                                <span className="text-gray-400 text-sm">{comp.data.duration_minutes || comp.data.duration} mins</span>
                                                            </div>
                                                            {comp.data.notes && (
                                                                <div className="text-xs text-white/50 mt-1">{comp.data.notes}</div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {comp.component_type === 'cooldown' && comp.data && (
                                                        <WarmupSection data={comp.data} title="Cooldown" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            {selectedWorkout && (
                <WorkoutDetailView
                    workout={selectedWorkout}
                    onClose={() => setSelectedWorkout(null)}
                    onRefresh={handleRefresh}
                />
            )}
        </>
    );
}
