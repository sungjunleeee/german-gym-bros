import { X, Pencil } from "lucide-react";

export function WorkoutDetailView({ workout, onClose }: { workout: any; onClose: () => void }) {
    // Helper to get components by type
    const getComponents = (type: string) => workout.components.filter((c: any) => c.component_type === type);

    const warmups = getComponents('warmup');
    const circuits = getComponents('circuit');
    const cardios = getComponents('cardio');
    const cooldowns = getComponents('cooldown');

    return (
        <div className="absolute inset-0 bg-[#22281f] z-50 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-[#394d26] shadow-md shrink-0 border-b border-white/10">
                <h2 className="text-lg font-bold text-white tracking-wide">Workout Details</h2>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <Pencil size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 pb-24">

                {/* Warmup Section */}
                {warmups.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider border-b border-white/10 pb-1">Warm Up</h3>
                        {warmups.map((w: any, i: number) => (
                            <div key={i} className="bg-[#363d31] rounded-xl p-4 border border-white/5 shadow-sm">
                                <ul className="space-y-2">
                                    {w.data.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-200">
                                            <span className="text-[#fbbf24] mt-1.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Strength / Circuits Section */}
                {circuits.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider border-b border-white/10 pb-1">Strength</h3>
                        {circuits.map((circuit: any, i: number) => (
                            <div key={i} className="bg-[#363d31] rounded-xl overflow-hidden border border-white/5 shadow-sm">
                                {/* Circuit Header */}
                                <div className="bg-[#2a3026] p-3 border-b border-white/5 flex justify-between items-center">
                                    <span className="font-bold text-white">Circuit {i + 1}</span>
                                    <span className="text-xs font-bold bg-[#fbbf24] text-black px-2 py-0.5 rounded-full">
                                        {circuit.data.rounds} Rounds
                                    </span>
                                </div>

                                {/* Circuit Stats */}
                                <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/5 bg-[#363d31]/50">
                                    <div className="p-2 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Work</div>
                                        <div className="text-sm font-medium text-white">{circuit.data.work_seconds}s</div>
                                    </div>
                                    <div className="p-2 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Rest</div>
                                        <div className="text-sm font-medium text-white">{circuit.data.rest_seconds}s</div>
                                    </div>
                                    <div className="p-2 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Round Rest</div>
                                        <div className="text-sm font-medium text-white">{circuit.data.rest_between_rounds}s</div>
                                    </div>
                                </div>

                                {/* Exercises */}
                                <div className="p-3 space-y-3">
                                    {circuit.data.exercises.map((ex: any, idx: number) => (
                                        <div key={idx} className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">{ex.name}</div>
                                                {ex.equipment && ex.equipment.length > 0 && (
                                                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                                                        {ex.equipment.join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm font-mono text-[#fbbf24] whitespace-nowrap">
                                                {ex.reps} reps
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cardio Section */}
                {cardios.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider border-b border-white/10 pb-1">Cardio</h3>
                        {cardios.map((c: any, i: number) => (
                            <div key={i} className="bg-[#363d31] rounded-xl p-4 border border-white/5 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{c.data.type}</h4>
                                        <div className="text-sm text-[#fbbf24]">{c.data.duration_minutes} Minutes</div>
                                    </div>
                                    {c.data.details?.effort && (
                                        <div className="bg-white/5 px-2 py-1 rounded text-xs text-gray-300 max-w-[120px] text-right">
                                            {c.data.details.effort}
                                        </div>
                                    )}
                                </div>

                                {c.data.details?.structure && (
                                    <div className="text-sm text-gray-300 bg-[#2a3026] p-2 rounded border border-white/5">
                                        <span className="text-gray-500 text-xs uppercase mr-2">Structure:</span>
                                        {c.data.details.structure}
                                    </div>
                                )}

                                {c.data.details?.instructions && (
                                    <div className="text-sm text-gray-400 italic">
                                        "{c.data.details.instructions}"
                                    </div>
                                )}

                                {c.data.details?.exercises && c.data.details.exercises.length > 0 && (
                                    <div className="pt-2 border-t border-white/5">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Exercises</div>
                                        <div className="flex flex-wrap gap-2">
                                            {c.data.details.exercises.map((ex: string, idx: number) => (
                                                <span key={idx} className="text-xs bg-white/10 text-gray-200 px-2 py-1 rounded">
                                                    {ex}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Cooldown Section */}
                {cooldowns.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider border-b border-white/10 pb-1">Cooldown</h3>
                        {cooldowns.map((w: any, i: number) => (
                            <div key={i} className="bg-[#363d31] rounded-xl p-4 border border-white/5 shadow-sm">
                                <ul className="space-y-2">
                                    {w.data.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-200">
                                            <span className="text-[#fbbf24] mt-1.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
