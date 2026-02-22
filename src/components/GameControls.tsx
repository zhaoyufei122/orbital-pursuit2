import React, { useState } from 'react';
import { Satellite, Rocket, EyeOff, Search, Radar, Sun, Moon, Cloud, CloudRain } from 'lucide-react';
import { motion } from 'motion/react';
import type { Player, Mode, Pos, InteractionMode, Weather } from '../types';
import type { GameScenario } from '../config/scenarios';
import type { Resources } from '../state/types';
import { getTimeOfDay, isGroundObservationAllowed } from '../game/rules';
import { GameStatus } from './GameStatus';

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
  interactionMode: InteractionMode;
  turn: number;
  hasPerformedScan: boolean;
  weather: Weather;
  bTimeInRange: number;
  resources: Record<Player, Resources>;
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
  interactionMode,
  turn,
  hasPerformedScan,
  weather,
  bTimeInRange,
  resources,
}) => {
  if (!isHumanTurn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-5 flex flex-row items-stretch gap-4 p-4 rounded-2xl border w-full max-w-4xl backdrop-blur-xl shadow-2xl ${
          currentPlayer === 'A'
            ? 'bg-blue-950/50 border-blue-900/50'
            : 'bg-red-950/50 border-red-900/50'
        }`}
      >
        <div className="shrink-0 pr-4 border-r border-slate-700/50 flex items-center">
          <GameStatus turn={turn} bTimeInRange={bTimeInRange} currentPlayer={currentPlayer} resources={resources} scenario={scenario} embedded compact />
        </div>
        <div className="flex-1 flex items-center gap-3">
          {currentPlayer === 'A' ? (
            <Satellite className="text-blue-400 shrink-0" size={20} />
          ) : (
            <Rocket className="text-red-400 shrink-0" size={20} />
          )}
          <div>
            <p className="text-white font-semibold text-sm">
              AI planning: {currentPlayer === 'A' ? 'Blue (Evader)' : 'Red (Pursuer)'}...
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {currentPlayer === 'A'
                ? 'Blue moves first, then your turn as Red.'
                : 'AI is making pursuit decisions.'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 动态生成按钮列表
  const orbs = Array.from({ length: scenario.gridH }, (_, i) => i);
  const centerOrb = (scenario.gridH - 1) / 2;

  // 获取时间段
  const timeOfDay = getTimeOfDay(turn);
  const isNight = timeOfDay === 'NIGHT';
  const isDay = timeOfDay === 'DAY';
  const isDawnDusk = timeOfDay === 'DAWN' || timeOfDay === 'DUSK';

  // 检查观测权限
  const shortScanCheck = isGroundObservationAllowed(turn, weather, 'SHORT', scenario);
  const longScanCheck = isGroundObservationAllowed(turn, weather, 'LONG', scenario);

  const canShortScan = !hasPerformedScan && shortScanCheck.allowed;
  const canLongScan = !hasPerformedScan && longScanCheck.allowed;
  
  return (
    <div
      className={`mt-5 flex flex-row items-stretch gap-4 p-4 rounded-2xl border w-full max-w-4xl transition-colors duration-500 backdrop-blur-xl shadow-2xl relative z-20 ${
        currentPlayer === 'A'
          ? 'bg-blue-950/60 border-blue-900/50'
          : 'bg-red-950/60 border-red-900/50'
      }`}
    >
      {/* 左侧：状态栏 Turn、Target Lock、ΔV */}
      <div className="shrink-0 pr-4 border-r border-slate-700/50 flex items-center">
        <GameStatus turn={turn} bTimeInRange={bTimeInRange} currentPlayer={currentPlayer} resources={resources} scenario={scenario} embedded compact />
      </div>

      {/* 右侧：操作区 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            {currentPlayer === 'A' ? (
              <Satellite size={20} className="text-blue-400 shrink-0" />
            ) : (
              <Rocket size={20} className="text-red-400 shrink-0" />
            )}
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 flex-wrap">
              {currentPlayer === 'A'
                ? (mode === 'hotseat' ? 'Evader (Blue)' : 'You (Blue)')
                : (mode === 'hotseat' ? 'Pursuer (Red)' : 'You (Red)')}
              {mode === 'hotseat' && (
                <span className="text-xs font-normal text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <EyeOff size={12} />
                  {currentPlayer === 'A' ? 'Red look away' : 'Blue locked'}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold ${
              isNight ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200' :
              isDay ? 'bg-amber-100/80 border-amber-500/50 text-amber-800' :
              'bg-orange-900/80 border-orange-500/50 text-orange-200'
            }`}>
              {isNight ? <Moon size={12} /> : <Sun size={12} />}
              <span>{timeOfDay}</span>
            </div>
            {scenario.weatherEnabled && (
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold ${
                weather === 'CLEAR' ? 'bg-blue-400/20 border-blue-400/50 text-blue-200' :
                'bg-slate-500/50 border-slate-400/50 text-slate-200'
              }`}>
                {weather === 'CLEAR' ? <Sun size={12} /> : <CloudRain size={12} />}
                <span>{weather === 'CLEAR' ? 'CLEAR' : 'CLOUDY'}</span>
              </div>
            )}
          </div>
        </div>

        {scenario.fogOfWar && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onShortScan}
              disabled={!canShortScan}
              title={!shortScanCheck.allowed ? shortScanCheck.reason : ''}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors text-xs font-bold ${
                !canShortScan
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              <Search size={12} />
              <span>Short Scan</span>
            </button>
            <button
              onClick={onToggleScanMode}
              disabled={!canLongScan}
              title={!longScanCheck.allowed ? longScanCheck.reason : ''}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors text-xs font-bold ${
                !canLongScan
                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                  : interactionMode === 'SCAN_LONG_AIM'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              <Radar size={12} />
              <span>{interactionMode === 'SCAN_LONG_AIM' ? 'Click map...' : 'Sector Scan (Long)'}</span>
            </button>
            {(!shortScanCheck.allowed || !longScanCheck.allowed) && !hasPerformedScan && (
              <span className="text-[10px] text-red-400">Scan: {!shortScanCheck.allowed ? shortScanCheck.reason : longScanCheck.reason}</span>
            )}
          </div>
        )}

        <div className="text-slate-400 text-xs">
          {interactionMode === 'SCAN_LONG_AIM'
            ? 'Click anywhere on the map to scan...'
            : 'Click HUD buttons to move.'}
        </div>
      </div>
    </div>
  );
};
