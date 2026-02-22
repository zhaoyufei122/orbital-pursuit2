import React from 'react';
import { Satellite, Rocket, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import type { Player, Mode, Pos } from '../types';
import type { GameScenario } from '../config/scenarios';

interface GameControlsProps {
  isHumanTurn: boolean;
  currentPlayer: Player;
  mode: Mode | null;
  aPos: Pos;
  bPos: Pos;
  scenario: GameScenario;
  isValidMove: (player: Player, fromX: number, selectedY: number) => boolean;
  onPlayerMove: (selectedY: number) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isHumanTurn,
  currentPlayer,
  mode,
  aPos,
  bPos,
  scenario,
  isValidMove,
  onPlayerMove,
}) => {
  if (!isHumanTurn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-5 w-full max-w-2xl rounded-2xl border p-5 backdrop-blur-xl shadow-2xl ${
          currentPlayer === 'A'
            ? 'bg-blue-950/50 border-blue-900/50'
            : 'bg-red-950/50 border-red-900/50'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          {currentPlayer === 'A' ? (
            <Satellite className="text-blue-400" />
          ) : (
            <Rocket className="text-red-400" />
          )}
          <div className="text-center">
            <p className="text-white font-semibold">
              AI 正在为{currentPlayer === 'A' ? '蓝方（逃逸者）' : '红方（追击者）'}规划动作…
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {currentPlayer === 'A'
                ? 'AI 将先锁定蓝方动作，再轮到你操作红方。'
                : 'AI 正在基于当前位置进行追击决策。'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 动态生成按钮列表
  const orbs = Array.from({ length: scenario.gridH }, (_, i) => i);
  // 计算中心索引，用于计算相对位移 dx
  // 假设 GRID_H 为 5，中心是 2 (5-1)/2 = 2
  // 假设 GRID_H 为 11，中心是 5 (11-1)/2 = 5
  const centerOrb = (scenario.gridH - 1) / 2;

  return (
    <div
      className={`mt-5 flex flex-col items-center gap-4 p-6 rounded-2xl border w-full max-w-6xl transition-colors duration-500 backdrop-blur-xl shadow-2xl relative z-20 ${
        currentPlayer === 'A'
          ? 'bg-blue-950/60 border-blue-900/50'
          : 'bg-red-950/60 border-red-900/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2 flex-wrap justify-center text-center">
        {currentPlayer === 'A' ? (
          <>
            <Satellite size={24} className="text-blue-400" />
            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2 flex-wrap justify-center">
              {mode === 'hotseat' ? 'Evader (Blue) - 规划动作' : '你（蓝方）- 规划动作'}
              {mode === 'hotseat' && (
                <span className="text-sm font-normal text-blue-300/60 ml-1 border border-blue-800/50 bg-blue-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff size={14} />
                  红方请回避视线
                </span>
              )}
            </h3>
          </>
        ) : (
          <>
            <Rocket size={24} className="text-red-400" />
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 flex-wrap justify-center">
              {mode === 'hotseat' ? 'Pursuer (Red) - 规划动作' : '你（红方）- 规划动作'}
              {mode === 'hotseat' && (
                <span className="text-sm font-normal text-red-300/60 ml-1 border border-red-800/50 bg-red-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff size={14} />
                  蓝方动作已锁定
                </span>
              )}
            </h3>
          </>
        )}
      </div>

      <div className="flex flex-nowrap overflow-x-auto justify-center gap-2 w-full px-2 pb-2">
        {orbs.map((y) => {
          const dx = y - centerOrb;
          const fromX = currentPlayer === 'A' ? aPos.x : bPos.x;
          const valid = isValidMove(currentPlayer, fromX, y);

          return (
            <button
              key={y}
              disabled={!valid}
              onClick={() => onPlayerMove(y)}
              className={`relative px-2 py-2 min-w-[70px] rounded-lg font-mono text-xs transition-all duration-200 overflow-hidden group border shrink-0 ${
                valid
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600/80 shadow-lg hover:-translate-y-0.5'
                  : 'bg-slate-900/50 text-slate-600 border-slate-800/50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <span className="font-bold">Orb {y + 1}</span>
                <span
                  className={`text-[10px] px-1.5 py-px rounded bg-slate-950/50 ${
                    valid
                      ? currentPlayer === 'A'
                        ? 'text-blue-300'
                        : 'text-red-300'
                      : 'text-slate-500'
                  }`}
                >
                  {dx < 0 ? `← ${Math.abs(dx)}` : dx > 0 ? `→ ${dx}` : 'Stay'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
