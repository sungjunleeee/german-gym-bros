import { Star, CloudRain, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 p-4 font-sans">
      {/* Mobile Container */}
      <div className="w-full max-w-[400px] bg-[#22281f] rounded-[30px] overflow-hidden shadow-2xl relative h-[850px] flex flex-col text-white border border-[#1a1f18]">

        {/* Header */}
        <header className="px-4 py-4 flex flex-col items-center pt-12 space-y-4">
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
            <p className="text-sm text-gray-300">Objective: ACFT Prep-Strength & Endurance</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 overflow-y-auto pb-24">

          {/* PT Schedule Table */}
          <div className="border border-white/20 rounded-lg overflow-hidden mb-4 text-sm">
            {[
              { label: "Warm-up", value: "Army Prep Drill - 10 mins" },
              { label: "Strength", value: "Deadlift Progression" },
              { label: "Conditioning", value: "1.5 mile run" },
              { label: "Cool-down", value: "Recovery Drill- 5 mins" },
            ].map((row, i) => (
              <div key={i} className={`flex ${i !== 3 ? 'border-b border-white/20' : ''}`}>
                <div className="w-[100px] bg-[#363d31] p-3 flex items-center justify-center font-medium border-r border-white/20">
                  {row.label}
                </div>
                <div className="flex-1 bg-[#22281f] p-3 flex items-center justify-center text-center">
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button className="flex-1 bg-[#394d26] hover:bg-[#4b5f36] py-3 rounded-lg font-medium text-sm transition-colors shadow-sm border border-white/10">
              Edit Plan
            </button>
            <button className="flex-1 bg-[#394d26] hover:bg-[#4b5f36] py-3 rounded-lg font-medium text-sm transition-colors shadow-sm border border-white/10">
              Auto-Adapt
            </button>
            <button className="flex-1 bg-[#394d26] hover:bg-[#4b5f36] py-3 rounded-lg font-medium text-sm transition-colors shadow-sm border border-white/10 leading-tight">
              Send To Squad
            </button>
          </div>

          {/* Operational Alerts */}
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Operational Alerts</h3>
            <div className="space-y-2">
              {/* Weather Alert */}
              <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#2a3026]">
                <div className="w-[140px] bg-[#363d31] p-3 flex flex-col items-center justify-center text-center border-r border-white/10">
                  <span className="font-bold text-sm">Weather Shifts</span>
                  <span className="text-xs text-gray-400 mt-1">Rain at 0700</span>
                </div>
                <div className="flex-1 p-3 flex items-center justify-center text-center text-xs text-gray-300">
                  Consider swapping Tempo run with indoor circuit
                </div>
              </div>

              {/* Equipment Alert */}
              <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#2a3026]">
                <div className="w-[140px] bg-[#363d31] p-3 flex flex-col items-center justify-center text-center border-r border-white/10">
                  <span className="font-bold text-sm leading-tight">Equipment Unavailable</span>
                  <span className="text-xs text-gray-400 mt-1">1 weight missing</span>
                </div>
                <div className="flex-1 p-3 flex items-center justify-center text-center text-xs text-gray-300">
                  Auto-Adapt to redistribute tools
                </div>
              </div>

              {/* Soldier Conditions */}
              <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#2a3026]">
                <div className="w-[140px] bg-[#363d31] p-3 flex flex-col items-center justify-center text-center border-r border-white/10">
                  <span className="font-bold text-sm leading-tight">Soldier Conditions</span>
                  <span className="text-xs text-gray-400 mt-1">1 soldier injured</span>
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
            <h3 className="text-xl font-semibold mb-3">Squad Readiness</h3>
            <div className="bg-[#363d31] h-4 rounded-full overflow-hidden">
              <div className="bg-[#4b5f36] w-[75%] h-full rounded-full" />
            </div>
          </section>

        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-[#1a1f18] border-t border-white/10 flex">
          <Link href="/" className="flex-1 py-4 flex flex-col items-center justify-center gap-1 bg-[#2a3026]">
            <span className="text-xs font-bold text-white leading-tight text-center">Daily<br />Plan</span>
          </Link>
          <button className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Weekly<br />Plan</span>
          </button>
          <Link href="/build-plan" className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Build<br />New Plan</span>
          </Link>
          <button className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-[#2a3026] transition-colors">
            <span className="text-xs font-medium text-gray-400 leading-tight text-center">Squad<br />Info</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
