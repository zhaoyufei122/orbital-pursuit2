import React, { useState } from 'react';
import { Satellite, Rocket, Users, Bot, BookOpen, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Screen } from '../types';
import { SCENARIOS, SCENARIO_REALISTIC, type GameScenario } from '../config/scenarios';

// 声明一个新的屏幕类型 (但实际上我们可以复用 home，或者在 Home 组件内部做状态切换)
// 为了简单起见，我们在 Home 组件内部增加一个 CustomConfig 弹窗状态

interface HomeProps {
  onStartHotseat: (scenario: GameScenario) => void;
  onStartAIConfig: (scenario: GameScenario) => void;
  onNavigate: (screen: Screen) => void;
}

export const Home: React.FC<HomeProps> = ({ onStartHotseat, onStartAIConfig, onNavigate }) => {
  const [selectedScenario, setSelectedScenario] = useState<GameScenario>(SCENARIOS[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // 自定义模式的临时配置状态
  const [customConfig, setCustomConfig] = useState<GameScenario>({
    ...SCENARIO_REALISTIC,
    id: 'custom',
    name: 'Custom Mode (Sandbox)',
    description: 'User customized rules configuration.',
  });

  const handleCustomStart = (mode: 'hotseat' | 'ai') => {
    if (mode === 'hotseat') {
      onStartHotseat(customConfig);
    } else {
      onStartAIConfig(customConfig);
    }
  };

  if (isCustomMode) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-2xl rounded-3xl border border-slate-700/70 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-8 overflow-hidden"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-300 p-2 rounded-lg"><Rocket size={20}/></span>
            Custom Rules Configuration
          </h2>
          
          <div className="space-y-6 text-sm text-slate-300">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 p-3 border border-slate-700 rounded-lg bg-slate-800/30">
                <span className="font-bold text-blue-300">Fog of War</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={customConfig.fogOfWar} 
                      onChange={() => setCustomConfig({...customConfig, fogOfWar: true})}
                      className="accent-blue-500"
                    /> ON
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={!customConfig.fogOfWar} 
                      onChange={() => setCustomConfig({...customConfig, fogOfWar: false})}
                      className="accent-blue-500"
                    /> OFF
                  </label>
                </div>
              </label>

              <label className="flex flex-col gap-2 p-3 border border-slate-700 rounded-lg bg-slate-800/30">
                <span className="font-bold text-amber-300">Weather System</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={customConfig.weatherEnabled} 
                      onChange={() => setCustomConfig({...customConfig, weatherEnabled: true})}
                      className="accent-amber-500"
                    /> ON
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={!customConfig.weatherEnabled} 
                      onChange={() => setCustomConfig({...customConfig, weatherEnabled: false})}
                      className="accent-amber-500"
                    /> OFF
                  </label>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <label className="flex flex-col gap-2">
                 <span className="font-bold">Map Width (Grid Width)</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="11" max="51" step="2"
                    value={customConfig.gridW}
                    onChange={(e) => setCustomConfig({...customConfig, gridW: Math.max(11, parseInt(e.target.value) || 11)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">cells</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">Map Height (Grid Height)</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="5" max="31" step="2"
                    value={customConfig.gridH}
                    onChange={(e) => setCustomConfig({...customConfig, gridH: Math.max(5, parseInt(e.target.value) || 5)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">cells</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">H-Scale (km/Cell X)</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="1" 
                    value={customConfig.kmPerCellX}
                    onChange={(e) => setCustomConfig({...customConfig, kmPerCellX: parseInt(e.target.value) || 35})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">km</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">V-Scale (km/Cell Y)</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="1"
                    value={customConfig.kmPerCellY}
                    onChange={(e) => setCustomConfig({...customConfig, kmPerCellY: parseInt(e.target.value) || 15})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">km</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">Capture Range</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="1"
                    value={customConfig.ranges.identification}
                    onChange={(e) => setCustomConfig({...customConfig, ranges: {...customConfig.ranges, identification: parseInt(e.target.value) || 50}})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">km</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">Visual Range</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="1"
                    value={customConfig.ranges.visual}
                    onChange={(e) => setCustomConfig({...customConfig, ranges: {...customConfig.ranges, visual: parseInt(e.target.value) || 100}})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">km</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">Long Scan Radius</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="1"
                    value={customConfig.ranges.longScan}
                    onChange={(e) => setCustomConfig({...customConfig, ranges: {...customConfig.ranges, longScan: parseInt(e.target.value) || 175}})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">km</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">Win Time</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="1"
                    value={customConfig.winTime}
                    onChange={(e) => setCustomConfig({...customConfig, winTime: parseInt(e.target.value) || 2})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">turns</span>
                 </div>
               </label>

               <label className="flex flex-col gap-2">
                 <span className="font-bold">Max Turns</span>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number" min="10"
                    value={customConfig.maxTurns}
                    onChange={(e) => setCustomConfig({...customConfig, maxTurns: parseInt(e.target.value) || 20})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                    <span className="text-xs text-slate-500 w-12">turns</span>
                 </div>
               </label>
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-4 border-t border-slate-700">
            <button 
              onClick={() => setIsCustomMode(false)}
              className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 text-slate-400 transition"
            >
              Cancel
            </button>
            <div className="flex-1"></div>
            <button 
              onClick={() => handleCustomStart('hotseat')}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-900/20"
            >
              Start Hotseat
            </button>
            <button 
              onClick={() => handleCustomStart('ai')}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-900/20"
            >
              Start AI Match
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
            Satellite Pursuit-Evasion · Double-Blind Turn-Based · Orbital Maneuver Strategy
          </p>
        </div>

        {/* 模式选择 */}
        <div className="relative z-10 mb-8">
          <h3 className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider text-center">Select Scenario</h3>
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
                  {scenario.weatherEnabled && <span className="text-amber-300 font-bold">Hardcore</span>}
                </div>
              </button>
            ))}
            
            {/* 自定义模式入口 */}
            <button
                onClick={() => setIsCustomMode(true)}
                className="relative p-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/20 hover:bg-slate-800/40 hover:border-slate-500 transition-all text-left flex items-center justify-center gap-2 group"
            >
                <span className="text-slate-400 font-bold group-hover:text-blue-300 transition-colors">+ Custom Mode (Sandbox)</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onStartHotseat(selectedScenario)}
            className="group rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-cyan-300" size={22} />
              <span className="text-white font-bold text-lg">Hotseat</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Two players take turns on the same device. Double-blind planning followed by simultaneous resolution.
            </p>
          </button>

          <button
            onClick={() => onStartAIConfig(selectedScenario)}
            className="group rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Bot className="text-violet-300" size={22} />
              <span className="text-white font-bold text-lg">AI Match</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Play as either the Pursuer (Red) or Evader (Blue) against an AI opponent.
            </p>
          </button>

          <button
            onClick={() => onNavigate('instructions')}
            className="group rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="text-amber-300" size={22} />
              <span className="text-white font-bold text-lg">Instructions</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              View game rules, win conditions, and background on the "Orbital Pursuit-Evasion" problem.
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
