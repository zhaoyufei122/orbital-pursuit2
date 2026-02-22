import React from 'react';
import { ArrowLeft, BookOpen, Satellite } from 'lucide-react';
import { motion } from 'motion/react';
import { RULES_TEXT, BACKGROUND_TEXT } from '../constants';

interface InstructionsProps {
  onBack: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800/80 transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <div className="text-right">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Instructions</h2>
            <p className="text-slate-400 text-sm">Rules & Background</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-700/70 bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-cyan-300" size={22} />
              <h3 className="text-xl font-bold text-white">Game Rules</h3>
            </div>

            <div className="space-y-3 text-slate-300 text-sm leading-7">
              {RULES_TEXT.map((item, idx) => (
                <p key={idx}>
                  <span className="text-cyan-300 font-mono mr-2">{idx + 1}.</span>
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-400 leading-6">
              <p className="mb-1 text-slate-300 font-semibold">Action Explanation</p>
              <p>
                Choosing orbit <span className="font-mono text-slate-200">Orb y</span> results in a lateral drift of <span className="font-mono text-slate-200">dx = y - 2</span>:
                <br/>
                i.e., <span className="font-mono">←2, ←1, Stay, →1, →2</span>.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-700/70 bg-slate-900/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Satellite className="text-blue-300" size={22} />
              <h3 className="text-xl font-bold text-white">Background: Orbital Pursuit-Evasion</h3>
            </div>

            <div className="space-y-3 text-slate-300 text-sm leading-7">
              {BACKGROUND_TEXT.map((item, idx) => (
                <p key={idx}>
                  <span className="text-blue-300 font-mono mr-2">•</span>
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-400 leading-6">
              <p className="text-slate-300 font-semibold mb-1">Why is this interesting?</p>
              <p>
                It naturally involves <span className="text-slate-200">adversarial planning, incomplete information, risk management, and prediction</span>,
                making it a perfect testbed for game theory and AI experiments.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
