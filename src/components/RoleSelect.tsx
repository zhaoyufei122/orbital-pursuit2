import React from 'react';
import { ArrowLeft, Rocket, Satellite } from 'lucide-react';
import { motion } from 'motion/react';
import { WIN_TIME, MAX_TURNS } from '../constants';
import type { Player } from '../types';

interface RoleSelectProps {
  onStartAIMatch: (role: Player) => void;
  onBack: () => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ onStartAIMatch, onBack }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black text-slate-200 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl rounded-3xl border border-slate-700/70 bg-slate-900/75 backdrop-blur-xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800/80 transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <div className="text-right">
            <h2 className="text-2xl font-bold text-white">AI Match</h2>
            <p className="text-slate-400 text-sm">Choose Your Side</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 红方追击者 */}
          <button
            onClick={() => onStartAIMatch('B')}
            className="group text-left rounded-2xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/35 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <Rocket className="text-red-400" size={28} />
              </div>
              <div>
                <div className="text-white font-bold text-xl">Pursuer (Red)</div>
                <div className="text-red-200/80 text-sm">Hunter</div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-6">
              Track and suppress the Evader using your lock zone. 
              Maintain target lock for <span className="font-mono text-white">{WIN_TIME}</span> cumulative turns to win.
            </p>

            <div className="mt-4 text-xs text-red-200/80 font-mono">
              Playstyle: Aggressive, Predictive
            </div>
          </button>

          {/* 蓝方逃逸者 */}
          <button
            onClick={() => onStartAIMatch('A')}
            className="group text-left rounded-2xl border border-blue-900/40 bg-blue-950/20 hover:bg-blue-950/35 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Satellite className="text-blue-400" size={28} />
              </div>
              <div>
                <div className="text-white font-bold text-xl">Evader (Blue)</div>
                <div className="text-blue-200/80 text-sm">Target</div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-6">
              Evade Red's lock within the constrained zone.
              Survive until <span className="font-mono text-white">Turn {MAX_TURNS}</span> to win.
            </p>

            <div className="mt-4 text-xs text-blue-200/80 font-mono">
              Playstyle: Evasive, Deceptive, Management
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
