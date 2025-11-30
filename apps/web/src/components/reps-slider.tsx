"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";

interface RepsSliderProps {
    initialReps: string | number;
    onSave: (reps: string) => void;
    onClose: () => void;
}

export function RepsSlider({ initialReps, onSave, onClose }: RepsSliderProps) {
    const MIN_REPS = 1;
    const MAX_REPS = 21;
    const SLIDER_WIDTH = 260;

    // Parse initial reps
    const parseInitial = (val: string | number): [number, number] => {
        const str = val.toString();
        if (str.includes('-')) {
            const [min, max] = str.split('-').map(Number);
            return [min || 10, max || 10];
        }
        const num = parseInt(str);
        const safeNum = isNaN(num) ? 10 : num;
        return [safeNum, safeNum];
    };

    const [initialMin, initialMax] = parseInitial(initialReps);

    // State for display
    const [minVal, setMinVal] = useState(initialMin);
    const [maxVal, setMaxVal] = useState(initialMax);

    // Helpers for conversion
    const valToPos = (val: number) => {
        const clamped = Math.min(Math.max(val, MIN_REPS), MAX_REPS);
        return ((clamped - MIN_REPS) / (MAX_REPS - MIN_REPS)) * SLIDER_WIDTH;
    };

    const posToVal = (pos: number) => {
        const raw = (pos / SLIDER_WIDTH) * (MAX_REPS - MIN_REPS) + MIN_REPS;
        return Math.round(Math.min(Math.max(raw, MIN_REPS), MAX_REPS));
    };

    // Motion values for thumb positions
    const x1 = useMotionValue(valToPos(initialMin));
    const x2 = useMotionValue(valToPos(initialMax));

    // Sync state and bar
    const updateValues = () => {
        const v1 = posToVal(x1.get());
        const v2 = posToVal(x2.get());
        setMinVal(Math.min(v1, v2));
        setMaxVal(Math.max(v1, v2));
    };

    useMotionValueEvent(x1, "change", updateValues);
    useMotionValueEvent(x2, "change", updateValues);

    // Derived positions for the bar (using state to trigger re-render is fine for this simple UI)
    // Actually, for 60fps smoothness, we should use useTransform, but React state is fast enough for 2 thumbs.
    // Let's stick to state for simplicity of "min/max" logic swapping.

    const barLeft = Math.min(x1.get(), x2.get());
    const barWidth = Math.abs(x1.get() - x2.get());

    const handleSave = () => {
        let result = "";
        const format = (v: number) => v >= 21 ? "20+" : v.toString();

        if (minVal === maxVal) {
            result = format(minVal);
        } else {
            result = `${format(minVal)}-${format(maxVal)}`;
        }
        onSave(result);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#2a3026] border border-white/10 rounded-2xl p-6 w-full max-w-[340px] shadow-2xl space-y-8"
            >
                <div className="text-center space-y-1">
                    <h3 className="text-white font-bold text-lg">Adjust Reps Range</h3>
                    <div className="text-4xl font-bold text-[#fbbf24] font-mono">
                        {minVal === maxVal
                            ? (minVal >= 21 ? "20+" : minVal)
                            : `${minVal}-${maxVal >= 21 ? "20+" : maxVal}`
                        }
                    </div>
                </div>

                <div className="relative h-12 flex items-center justify-center px-4 select-none touch-none">
                    {/* Track Background */}
                    <div className="absolute h-2 bg-white/10 rounded-full w-[260px]" />

                    {/* Active Range Bar */}
                    <motion.div
                        className="absolute h-2 bg-[#fbbf24] rounded-full opacity-50"
                        style={{
                            left: `calc(50% - 130px + ${Math.min(valToPos(minVal), valToPos(maxVal))}px)`,
                            width: Math.abs(valToPos(maxVal) - valToPos(minVal)),
                        }}
                    />

                    {/* Thumb 1 */}
                    <motion.div
                        drag="x"
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={{ left: 0, right: SLIDER_WIDTH }}
                        style={{ x: x1, left: `calc(50% - 130px)` }} // Center the drag origin
                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing z-20 flex items-center justify-center top-1/2 -mt-3"
                    >
                        <div className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full" />
                    </motion.div>

                    {/* Thumb 2 */}
                    <motion.div
                        drag="x"
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={{ left: 0, right: SLIDER_WIDTH }}
                        style={{ x: x2, left: `calc(50% - 130px)` }}
                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing z-20 flex items-center justify-center top-1/2 -mt-3"
                    >
                        <div className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full" />
                    </motion.div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 rounded-xl bg-[#fbbf24] text-black font-bold hover:bg-[#d9a51f] transition-colors"
                    >
                        Set Range
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
