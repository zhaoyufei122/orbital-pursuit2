import React, { useState } from 'react';
import { Satellite, Rocket, Users, Bot, BookOpen, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Screen } from '../types';
import { SCENARIOS, type GameScenario } from '../config/scenarios';

interface HomeProps {
  onStartHotseat: (scenario: GameScenario) => void;
  onStartAIConfig: (scenario: GameScenario) => void;
  onNavigate: (screen: Screen) => void;
}

export const Home: React.FC<HomeProps> = ({ onStartHotseat, onStartAIConfig, onNavigate }) => {
  const [selectedScenario, setSelectedScenario] = useState<GameScenario>(SCENARIOS[0]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl rounded-3xl border border-slate-700/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_0_60px_rgba(30,58,138,0.25)] p-8 md:p-10 overflow-hidden"
      >
        {/* 背景光晕 */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-blue-500/15 blur-[70px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-8 right-8 w-40 h-40 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="flex justify-center items-center gap-5 mb-4">
            <Satellite size={44} className="text-blue-400" />
            <Rocket size={44} className="text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
            Orbital Pursuit
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            卫星追逃博弈 · 双盲回合制 · 轨道机动策略游戏
          </p>
        </div>

        {/* 模式选择 */}
        <div className="relative z-10 mb-8">
          <h3 className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider text-center">选择战役模式</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={`relative p-4 rounded-xl border transition-all text-left group ${
                  selectedScenario.id === scenario.id
                    ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold ${selectedScenario.id === scenario.id ? 'text-blue-300' : 'text-slate-300'}`}>
                    {scenario.name}
                  </span>
                  {selectedScenario.id === scenario.id && (
                    <div className="bg-blue-500 rounded-full p-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {scenario.description}
                </p>
                <div className="flex gap-3 mt-3 text-[10px] text-slate-500 font-mono">
                  <span>Map: {scenario.gridW}x{scenario.gridH}</span>
                  <span>Turns: {scenario.maxTurns}</span>
                  <span>Fog: {scenario.fogOfWar ? 'ON' : 'OFF'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onStartHotseat(selectedScenario)}
            className="group rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-cyan-300" size={22} />
              <span className="text-white font-bold text-lg">热座模式</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              两名玩家本地轮流操作，保持双盲规划，再同时结算动作。
            </p>
          </button>

          <button
            onClick={() => onStartAIConfig(selectedScenario)}
            className="group rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Bot className="text-violet-300" size={22} />
              <span className="text-white font-bold text-lg">AI对战</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              选择扮演红方追击者或蓝方逃逸者，与 AI 进行策略对局。
            </p>
          </button>

          <button
            onClick={() => onNavigate('instructions')}
            className="group rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="text-amber-300" size={22} />
              <span className="text-white font-bold text-lg">说明</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              查看游戏规则、胜负条件，以及“卫星追逃问题”的背景介绍。
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
