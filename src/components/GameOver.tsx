import React from 'react';
import { Crosshair, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { MAX_TURNS } from '../constants';
import type { Player, Mode } from '../types';

interface GameOverProps {
  winner: Player | null;
  mode: Mode | null;
  humanRole: Player | null;
  onRestartHotseat: () => void;
  onRestartAI: (role: Player) => void;
  onBackToMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  winner,
  mode,
  humanRole,
  onRestartHotseat,
  onRestartAI,
  onBackToMenu,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl text-center max-w-md w-full shadow-2xl relative overflow-hidden z-20"
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          winner === 'B' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-blue-600/10 blur-3xl -z-10 translate-y-1/2" />

      <div className="flex justify-center mb-4">
        {winner === 'B' ? (
          <Crosshair size={48} className="text-red-400" />
        ) : (
          <ShieldAlert size={48} className="text-blue-400" />
        )}
      </div>

      <h2
        className={`text-3xl font-bold mb-3 drop-shadow-lg ${
          winner === 'B' ? 'text-red-400' : 'text-blue-400'
        }`}
      >
        {winner === 'B' ? 'TARGET LOCKED (Pursuer Wins)' : 'EVADER ESCAPED (Evader Wins)'}
      </h2>

      <p className="text-slate-400 text-sm">
        {winner === 'B'
          ? 'Pursuer successfully maintained target lock.'
          : `Evader survived until Turn ${MAX_TURNS}.`}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={() => {
            if (mode === 'hotseat') {
              onRestartHotseat();
            } else if (mode === 'ai' && humanRole) {
              onRestartAI(humanRole);
            }
          }}
          className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95"
        >
          Play Again
        </button>

        <button
          onClick={onBackToMenu}
          className="px-6 py-3 border border-slate-700 bg-slate-900/70 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );
};
