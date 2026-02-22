import React from 'react';
import { MAX_TURNS } from '../constants';
import type { Player } from '../types';

interface GameStatusProps {
  turn: number;
  bTimeInRange: number;
  currentPlayer: Player;
}

export const GameStatus: React.FC<GameStatusProps> = ({ turn, bTimeInRange, currentPlayer }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-5 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/60 shadow-xl z-20">
      <div className="flex flex-col items-center px-4">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
          Turn
        </span>
        <span className="text-3xl font-mono text-white">
          {turn} <span className="text-slate-600 text-lg">/ {MAX_TURNS}</span>
        </span>
      </div>

      <div className="hidden md:block w-px bg-slate-800"></div>

      <div className="flex flex-col items-center px-4">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
          Target Lock
        </span>
        <div className="flex gap-2 mt-1">
          <div
            className={`w-10 h-3 rounded-full transition-colors duration-300 ${
              bTimeInRange >= 1
                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'bg-slate-800'
            }`}
          />
          <div
            className={`w-10 h-3 rounded-full transition-colors duration-300 ${
              bTimeInRange >= 2
                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'bg-slate-800'
            }`}
          />
        </div>
      </div>

      <div className="hidden md:block w-px bg-slate-800"></div>

      <div className="flex flex-col items-center px-4">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
          Current
        </span>
        <span
          className={`text-sm font-semibold ${
            currentPlayer === 'A' ? 'text-blue-300' : 'text-red-300'
          }`}
        >
          {currentPlayer === 'A' ? '蓝方规划中' : '红方规划中'}
        </span>
      </div>
    </div>
  );
};
