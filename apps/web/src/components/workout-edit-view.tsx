"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence, PanInfo, useAnimation } from "framer-motion";
import { RepsSlider } from "./reps-slider";
import { ConfirmationModal } from "./confirmation-modal";
import clsx from "clsx";
import { API_URL } from "@/config";

interface WorkoutEditViewProps {
    workout: any;
    onCancel: () => void;
    onSaveSuccess: () => Promise<void> | void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const ensureIds = (components: any[]) => {
    return components.map(comp => {
        const newComp = { ...comp, _ui_id: comp._ui_id || generateId() };
        if (comp.component_type === 'circuit' && comp.data && Array.isArray(comp.data.exercises)) {
            newComp.data = {
                ...comp.data,
                exercises: comp.data.exercises.map((ex: any) => ({
                    ...ex,
                    _ui_id: ex._ui_id || generateId()
                }))
            };
        }
        return newComp;
    });
};

const ensureStructure = (components: any[]) => {
    let withIds = ensureIds(components);

    // Ensure Warmup
    if (!withIds.some(c => c.component_type === 'warmup')) {
        withIds.unshift({ component_type: 'warmup', order_index: 0, data: [], _ui_id: generateId() });
    }

    // Ensure Cooldown
    if (!withIds.some(c => c.component_type === 'cooldown')) {
        withIds.push({ component_type: 'cooldown', order_index: 100, data: [], _ui_id: generateId() });
    }

    return withIds;
};

const stripIds = (components: any[]) => {
    return components.map(({ _ui_id, ...comp }) => {
        if (comp.component_type === 'circuit' && comp.data && Array.isArray(comp.data.exercises)) {
            return {
                ...comp,
                data: {
                    ...comp.data,
                    exercises: comp.data.exercises.map(({ _ui_id, ...ex }: any) => ex)
                }
            };
        }
        return comp;
    });
};

export function WorkoutEditView({ workout, onCancel, onSaveSuccess }: WorkoutEditViewProps) {
    const [components, setComponents] = useState<any[]>(ensureStructure(JSON.parse(JSON.stringify(workout.components))));
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeRepsEditor, setActiveRepsEditor] = useState<{ componentIndex: number, exerciseIndex: number, currentReps: string, componentId?: string } | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
        confirmText?: string;
    } | null>(null);

    // Deep compare to check dirty state
    useEffect(() => {
        // Strip IDs before comparing to avoid false positives if IDs change (though they shouldn't)
        // Actually, we just want to compare the data content.
        const original = JSON.stringify(workout.components);
        const current = JSON.stringify(stripIds(components));
        setIsDirty(original !== current);
    }, [components, workout.components]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/workout/${workout.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ components: stripIds(components) }),
            });

            if (res.ok) {
                await onSaveSuccess();
            } else {
                alert("Failed to save workout");
            }
        } catch (error) {
            console.error("Error saving workout", error);
            alert("Error saving workout");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelClick = () => {
        if (isDirty) {
            setConfirmationModal({
                isOpen: true,
                title: "Discard Changes?",
                message: "You have unsaved changes. Are you sure you want to discard them?",
                confirmText: "Discard",
                isDestructive: true,
                onConfirm: onCancel
            });
        } else {
            onCancel();
        }
    };

    const updateComponent = (id: string, newData: any) => {
        setComponents(prev => prev.map(c => c._ui_id === id ? { ...c, data: newData } : c));
    };

    const removeComponent = (id: string) => {
        setConfirmationModal({
            isOpen: true,
            title: "Delete Section?",
            message: "Are you sure you want to delete it?",
            confirmText: "Delete",
            isDestructive: true,
            onConfirm: () => {
                setComponents(prev => prev.filter(c => c._ui_id !== id));
            }
        });
    };

    // --- Warmup / Cooldown Helpers ---
    const handleTextChange = (id: string, text: string) => {
        const lines = text.split('\n');
        updateComponent(id, lines);
    };

    // --- Circuit Helpers ---
    const updateCircuitField = (id: string, field: string, value: string) => {
        setComponents(prev => prev.map(c => {
            if (c._ui_id === id) {
                return { ...c, data: { ...c.data, [field]: parseInt(value) || 0 } };
            }
            return c;
        }));
    };

    const updateExercise = (compId: string, exIndex: number, field: string, value: any) => {
        setComponents(prev => prev.map(c => {
            if (c._ui_id === compId) {
                const newExercises = [...c.data.exercises];
                newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
                return { ...c, data: { ...c.data, exercises: newExercises } };
            }
            return c;
        }));
    };

    const addExercise = (compId: string) => {
        setComponents(prev => prev.map(c => {
            if (c._ui_id === compId) {
                const newExercises = [...c.data.exercises, { name: "New Exercise", reps: "10", equipment: [], _ui_id: generateId() }];
                return { ...c, data: { ...c.data, exercises: newExercises } };
            }
            return c;
        }));
    };

    const removeExercise = (compId: string, exIndex: number) => {
        setComponents(prev => prev.map(c => {
            if (c._ui_id === compId) {
                const newExercises = c.data.exercises.filter((_: any, i: number) => i !== exIndex);
                return { ...c, data: { ...c.data, exercises: newExercises } };
            }
            return c;
        }));
    };

    const addCircuit = () => {
        const newCircuit = {
            component_type: 'circuit',
            order_index: components.filter(c => c.component_type === 'circuit').length + 1,
            data: {
                rounds: 3,
                work_seconds: 45,
                rest_seconds: 15,
                rest_between_rounds: 60,
                exercises: [{ name: "New Exercise", reps: "10", equipment: [], _ui_id: generateId() }]
            },
            _ui_id: generateId()
        };

        // Insert logic: Warmup -> Circuits -> [New Circuit] -> Cardio -> Cooldown
        // We can just append it to the circuits list effectively by inserting before cardio or cooldown.
        const cardioIndex = components.findIndex(c => c.component_type === 'cardio');
        const cooldownIndex = components.findIndex(c => c.component_type === 'cooldown');

        const newComponents = [...components];

        if (cardioIndex !== -1) {
            newComponents.splice(cardioIndex, 0, newCircuit);
        } else if (cooldownIndex !== -1) {
            newComponents.splice(cooldownIndex, 0, newCircuit);
        } else {
            newComponents.push(newCircuit);
        }
        setComponents(newComponents);
    };

    // --- Equipment Helpers ---
    const addEquipment = (compId: string, exIndex: number, eqName: string) => {
        if (!eqName.trim()) return;
        setComponents(prev => prev.map(c => {
            if (c._ui_id === compId) {
                const currentEq = c.data.exercises[exIndex].equipment || [];
                if (!currentEq.includes(eqName.trim())) {
                    const newExercises = [...c.data.exercises];
                    newExercises[exIndex] = { ...newExercises[exIndex], equipment: [...currentEq, eqName.trim()] };
                    return { ...c, data: { ...c.data, exercises: newExercises } };
                }
            }
            return c;
        }));
    };

    const removeEquipment = (compId: string, exIndex: number, eqName: string) => {
        setComponents(prev => prev.map(c => {
            if (c._ui_id === compId) {
                const currentEq = c.data.exercises[exIndex].equipment || [];
                const newExercises = [...c.data.exercises];
                newExercises[exIndex] = { ...newExercises[exIndex], equipment: currentEq.filter((e: string) => e !== eqName) };
                return { ...c, data: { ...c.data, exercises: newExercises } };
            }
            return c;
        }));
    };

    const hasCircuits = components.some(c => c.component_type === 'circuit');
    const hasCooldown = components.some(c => c.component_type === 'cooldown');
    const hasCardio = components.some(c => c.component_type === 'cardio');

    const AddCircuitButton = () => (
        <button
            onClick={addCircuit}
            className="w-full py-4 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 mb-6"
        >
            <Plus size={24} />
            <span className="text-sm font-medium">Add Circuit</span>
        </button>
    );

    return (
        <div className="absolute inset-0 bg-[#22281f] z-50 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-[#394d26] shadow-md shrink-0 border-b border-white/10">
                <button onClick={handleCancelClick} className="text-gray-300 hover:text-white text-sm font-medium">
                    Cancel
                </button>
                <h2 className="text-lg font-bold text-white tracking-wide">Edit Workout</h2>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                        isDirty && !isSaving
                            ? "bg-[#fbbf24] text-black hover:bg-[#d9a51f]"
                            : "bg-white/10 text-gray-500 cursor-not-allowed"
                    )}
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-gray-600 pb-32">

                {/* Warmup */}
                {components.filter(c => c.component_type === 'warmup').map((comp) => (
                    <div key={comp._ui_id} className="space-y-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider border-b border-white/10 pb-1">Warm Up</h3>
                        <div className="bg-[#363d31] rounded-xl p-4 border border-white/5 shadow-sm">
                            <textarea
                                value={Array.isArray(comp.data) ? comp.data.join('\n') : comp.data}
                                onChange={(e) => handleTextChange(comp._ui_id, e.target.value)}
                                className="w-full bg-transparent text-base md:text-sm text-gray-200 focus:outline-none resize-none min-h-[100px]"
                                placeholder="Enter warmup exercises (one per line)..."
                            />
                        </div>
                    </div>
                ))}

                {/* Circuits */}
                {/* Header for Circuits if none exist */}
                {!hasCircuits && (
                    <div className="flex justify-between items-end border-b border-white/10 pb-1 mb-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider">Circuits</h3>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {components.filter(c => c.component_type === 'circuit').map((comp, i) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            key={comp._ui_id}
                            className="space-y-3 overflow-hidden"
                        >
                            <div className="flex justify-between items-end border-b border-white/10 pb-1">
                                <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider">Circuit {i + 1}</h3>
                                <button onClick={() => removeComponent(comp._ui_id)} className="text-red-400 text-xs hover:text-red-300 pb-1">Delete Circuit</button>
                            </div>

                            <div className="bg-[#363d31] rounded-xl overflow-hidden border border-white/5 shadow-sm">
                                {/* Circuit Header Inputs */}
                                <div className="bg-[#2a3026] p-3 border-b border-white/5 grid grid-cols-4 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400 uppercase">{comp.data.rounds === 1 ? 'Round' : 'Rounds'}</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={comp.data.rounds}
                                            onChange={(e) => updateCircuitField(comp._ui_id, 'rounds', e.target.value)}
                                            className="bg-black/20 rounded px-2 py-1 text-white text-base md:text-sm w-full text-center focus:outline-none focus:ring-1 focus:ring-[#fbbf24]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400 uppercase">Work(s)</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={comp.data.work_seconds}
                                            onChange={(e) => updateCircuitField(comp._ui_id, 'work_seconds', e.target.value)}
                                            className="bg-black/20 rounded px-2 py-1 text-white text-base md:text-sm w-full text-center focus:outline-none focus:ring-1 focus:ring-[#fbbf24]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400 uppercase">Rest(s)</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={comp.data.rest_seconds}
                                            onChange={(e) => updateCircuitField(comp._ui_id, 'rest_seconds', e.target.value)}
                                            className="bg-black/20 rounded px-2 py-1 text-white text-base md:text-sm w-full text-center focus:outline-none focus:ring-1 focus:ring-[#fbbf24]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400 uppercase">R.Rest(s)</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={comp.data.rest_between_rounds}
                                            onChange={(e) => updateCircuitField(comp._ui_id, 'rest_between_rounds', e.target.value)}
                                            className="bg-black/20 rounded px-2 py-1 text-white text-base md:text-sm w-full text-center focus:outline-none focus:ring-1 focus:ring-[#fbbf24]"
                                        />
                                    </div>
                                </div>

                                {/* Exercises List */}
                                <div className="divide-y divide-white/5">
                                    <AnimatePresence initial={false}>
                                        {comp.data.exercises.map((ex: any, exIdx: number) => (
                                            <SwipeToDeleteItem
                                                key={ex._ui_id || `${comp._ui_id}-${exIdx}`}
                                                onDelete={() => removeExercise(comp._ui_id, exIdx)}
                                            >
                                                <div className="p-3 flex flex-col gap-2">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <input
                                                            type="text"
                                                            value={ex.name}
                                                            onChange={(e) => updateExercise(comp._ui_id, exIdx, 'name', e.target.value)}
                                                            className="bg-transparent text-base md:text-sm font-medium text-white focus:outline-none focus:border-b focus:border-[#fbbf24] w-full"
                                                            placeholder="Exercise Name"
                                                        />
                                                        <button
                                                            onClick={() => setActiveRepsEditor({ componentIndex: -1, exerciseIndex: exIdx, currentReps: ex.reps, componentId: comp._ui_id })}
                                                            className="text-sm font-mono text-[#fbbf24] whitespace-nowrap bg-[#fbbf24]/10 px-2 py-1 rounded hover:bg-[#fbbf24]/20 transition-colors"
                                                        >
                                                            {ex.reps} {ex.reps === '1' || ex.reps === 1 ? 'rep' : 'reps'}
                                                        </button>
                                                    </div>

                                                    {/* Equipment Chips */}
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {(ex.equipment || []).map((eq: string, eqIdx: number) => (
                                                            <span key={eqIdx} className="inline-flex items-center gap-1 text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                                                                {eq}
                                                                <button
                                                                    onClick={() => removeEquipment(comp._ui_id, exIdx, eq)}
                                                                    className="hover:text-white"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <input
                                                            type="text"
                                                            placeholder="+ Add Eq"
                                                            className="bg-transparent text-base md:text-[10px] text-gray-500 focus:text-white focus:outline-none min-w-[60px]"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    addEquipment(comp._ui_id, exIdx, e.currentTarget.value);
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </SwipeToDeleteItem>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Add Workout Button */}
                                <button
                                    onClick={() => addExercise(comp._ui_id)}
                                    className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-[#fbbf24] bg-[#fbbf24]/5 hover:bg-[#fbbf24]/10 transition-colors border-t border-white/5"
                                >
                                    <Plus size={14} />
                                    ADD WORKOUT
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <AddCircuitButton />

                {/* Cardio */}
                {components.filter(c => c.component_type === 'cardio').map((comp) => (
                    <div key={comp._ui_id} className="space-y-3">
                        <div className="flex justify-between items-end border-b border-white/10 pb-1">
                            <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider">Cardio</h3>
                            <button onClick={() => removeComponent(comp._ui_id)} className="text-red-400 text-xs hover:text-red-300 pb-1">Delete Cardio</button>
                        </div>
                        <div className="bg-[#363d31] rounded-xl p-4 border border-white/5 shadow-sm space-y-3 opacity-75">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-white font-bold text-lg">{comp.data.type}</h4>
                                    <div className="text-sm text-[#fbbf24]">{comp.data.duration_minutes} Minutes</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 italic">Cardio details are read-only for now.</div>
                        </div>
                    </div>
                ))}

                {/* Cooldown */}
                {components.filter(c => c.component_type === 'cooldown').map((comp) => (
                    <div key={comp._ui_id} className="space-y-3">
                        <h3 className="text-[#fbbf24] font-bold text-lg uppercase tracking-wider border-b border-white/10 pb-1">Cooldown</h3>
                        <div className="bg-[#363d31] rounded-xl p-4 border border-white/5 shadow-sm">
                            <textarea
                                value={Array.isArray(comp.data) ? comp.data.join('\n') : comp.data}
                                onChange={(e) => handleTextChange(comp._ui_id, e.target.value)}
                                className="w-full bg-transparent text-base md:text-sm text-gray-200 focus:outline-none resize-none min-h-[100px]"
                                placeholder="Enter cooldown exercises (one per line)..."
                            />
                        </div>
                    </div>
                ))}

            </div>

            {/* Reps Slider Modal */}
            <AnimatePresence>
                {activeRepsEditor && (
                    <RepsSlider
                        initialReps={activeRepsEditor.currentReps}
                        onSave={(newReps) => {
                            if (activeRepsEditor.componentId) {
                                updateExercise(activeRepsEditor.componentId, activeRepsEditor.exerciseIndex, 'reps', newReps);
                            }
                        }}
                        onClose={() => setActiveRepsEditor(null)}
                    />
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            {confirmationModal && (
                <ConfirmationModal
                    isOpen={confirmationModal.isOpen}
                    onClose={() => setConfirmationModal(null)}
                    onConfirm={confirmationModal.onConfirm}
                    title={confirmationModal.title}
                    message={confirmationModal.message}
                    confirmText={confirmationModal.confirmText}
                    isDestructive={confirmationModal.isDestructive}
                />
            )}
        </div>
    );
}

function SwipeToDeleteItem({ children, onDelete }: { children: React.ReactNode, onDelete: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const controls = useAnimation();

    // Threshold to trigger delete
    const DELETE_THRESHOLD = -100;

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x < DELETE_THRESHOLD) {
            setIsDeleting(true);
            setTimeout(onDelete, 200); // Wait for animation
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={isDeleting ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden bg-[#363d31]"
        >
            <motion.div
                drag="x"
                dragConstraints={{ left: -200, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="relative z-10 bg-[#363d31]"
            >
                {children}
            </motion.div>

            {/* Delete Background */}
            <div className="absolute inset-y-0 right-0 w-[200px] bg-red-500 flex items-center justify-end px-6 z-0">
                <Trash2 className="text-white" size={20} />
            </div>
        </motion.div>
    );
}
