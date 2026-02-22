import React, { useState } from 'react';
import { Satellite, Rocket, EyeOff, Search, Radar, Sun, Moon, Cloud, CloudRain } from 'lucide-react';
import { motion } from 'motion/react';
import type { Player, Mode, Pos, InteractionMode, Weather } from '../types';
import type { GameScenario } from '../config/scenarios';
import { getTimeOfDay, isGroundObservationAllowed } from '../game/rules';

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
      className={`mt-5 flex flex-col items-center gap-4 p-6 rounded-2xl border w-full max-w-6xl transition-colors duration-500 backdrop-blur-xl shadow-2xl relative z-20 ${
        currentPlayer === 'A'
          ? 'bg-blue-950/60 border-blue-900/50'
          : 'bg-red-950/60 border-red-900/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2 flex-wrap justify-center text-center">
        {/* 昼夜与天气指示器 */}
        <div className={`absolute top-4 right-4 flex flex-col gap-2 items-end`}>
            {/* 时间指示 */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${
                isNight ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200' :
                isDay ? 'bg-amber-100/80 border-amber-500/50 text-amber-800' :
                'bg-orange-900/80 border-orange-500/50 text-orange-200' // Dawn/Dusk
            }`}>
                {isNight ? <Moon size={14} /> : <Sun size={14} />}
                <span>{timeOfDay} (Turn {turn})</span>
            </div>
            
            {/* 天气指示 (仅在开启天气系统时显示) */}
            {scenario.weatherEnabled && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${
                    weather === 'CLEAR' ? 'bg-blue-400/20 border-blue-400/50 text-blue-200' :
                    'bg-slate-500/50 border-slate-400/50 text-slate-200'
                }`}>
                    {weather === 'CLEAR' ? <Sun size={14} /> : <CloudRain size={14} />}
                    <span>{weather === 'CLEAR' ? 'CLEAR' : 'CLOUDY'}</span>
                </div>
            )}
        </div>

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
        <div className="w-full flex justify-center gap-4 mb-2 flex-col items-center">
          <div className="flex gap-4">
            <button
                onClick={onShortScan}
                disabled={!canShortScan}
                title={!shortScanCheck.allowed ? shortScanCheck.reason : ''}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
                !canShortScan
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
                disabled={!canLongScan}
                title={!longScanCheck.allowed ? longScanCheck.reason : ''}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
                    !canLongScan
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                    : interactionMode === 'SCAN_LONG_AIM'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                }`}
                >
                <Radar size={14} />
                <span>{interactionMode === 'SCAN_LONG_AIM' ? '点击地图选择中心点...' : '长观测 (Sector Scan)'}</span>
                </button>
            </div>
          </div>
          
          {/* 显示观测被禁用的原因 (如果有) */}
          {(!shortScanCheck.allowed || !longScanCheck.allowed) && !hasPerformedScan && (
             <div className="text-[10px] text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                观测受限: {!shortScanCheck.allowed ? shortScanCheck.reason : longScanCheck.reason}
             </div>
          )}
        </div>
      )}

      {/* 底部提示信息 (原按钮区域) */}
      <div className="w-full flex justify-center px-4 pb-2">
        <div className="text-center text-slate-400 text-sm py-2 px-4 rounded-lg bg-slate-900/30 border border-slate-800/50">
          {interactionMode === 'SCAN_LONG_AIM'
            ? '请在地图上点击任意位置执行扫描...' 
            : '点击地图上的高亮位置（幽灵图标）以移动单位。'}
        </div>
      </div>
    </div>
  );
};
