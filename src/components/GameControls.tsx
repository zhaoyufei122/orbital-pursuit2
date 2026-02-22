import React, { useState } from 'react';
import { Satellite, Rocket, EyeOff, Search, Radar, Sun, Moon } from 'lucide-react';
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
  onShortScan: () => void;
  onToggleScanMode: () => void;
  isScanning: boolean;
  turn: number; // Added turn prop
  hasPerformedScan: boolean; // Added
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
  onShortScan,
  onToggleScanMode,
  isScanning,
  turn,
  hasPerformedScan,
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

  // 昼夜逻辑：每四回合循环，1-2为夜（可观测），3-4为昼（不可观测）
  // turn 1: 1%4=1 (Night)
  // turn 2: 2%4=2 (Night)
  // turn 3: 3%4=3 (Day)
  // turn 4: 0%4=0 (Day)
  const isNight = (turn % 4 === 1) || (turn % 4 === 2);
  
  // 检查是否已观测
  // 我们需要从外部传入 hasPerformedScan，或者在 GameMatch 中处理按钮禁用逻辑
  // 但为了简化，我们假设 onShortScan 和 onToggleScanMode 如果被禁用就不应该被触发
  // 这里暂时只根据 isNight 禁用，后续通过 props 接收 hasPerformedScan
  // TODO: Add hasPerformedScan prop
  const canScan = isNight && !hasPerformedScan;
  
  return (
    <div
      className={`mt-5 flex flex-col items-center gap-4 p-6 rounded-2xl border w-full max-w-6xl transition-colors duration-500 backdrop-blur-xl shadow-2xl relative z-20 ${
        currentPlayer === 'A'
          ? 'bg-blue-950/60 border-blue-900/50'
          : 'bg-red-950/60 border-red-900/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2 flex-wrap justify-center text-center">
        {/* 昼夜指示器 */}
        {scenario.fogOfWar && (
          <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${
            isNight 
              ? hasPerformedScan 
                ? 'bg-slate-800/80 border-slate-600/50 text-slate-400' // Night but scanned
                : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200' // Night ready
              : 'bg-amber-950/80 border-amber-500/50 text-amber-200' // Day
          }`}>
            {isNight ? <Moon size={14} /> : <Sun size={14} />}
            <span>{isNight ? (hasPerformedScan ? 'NIGHT (Scanned)' : 'NIGHT (Scan Ready)') : 'DAY (No Scan)'}</span>
          </div>
        )}

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

      {/* 观测控制面板 (仅在有迷雾且是真实模式时显示，或者总是显示如果是拟真模式) */}
      {scenario.fogOfWar && (
        <div className="w-full flex justify-center gap-4 mb-2">
          <button
            onClick={onShortScan}
            disabled={!canScan}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
              !canScan
                ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <Search size={14} />
            <span>短观测 (Short Scan)</span>
          </button>

          <div className="relative">
            <button
              onClick={onToggleScanMode}
              disabled={!canScan}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
                !canScan
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                  : isScanning 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              <Radar size={14} />
              <span>{isScanning ? '点击地图选择中心点...' : '长观测 (Sector Scan)'}</span>
            </button>
          </div>
        </div>
      )}

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
