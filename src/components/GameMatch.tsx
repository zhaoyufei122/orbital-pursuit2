import React, { useState } from 'react';
import { BookOpen, Satellite } from 'lucide-react';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { GameOver } from './GameOver';
import { RULES_TEXT, BACKGROUND_TEXT } from '../constants';
import type { GameEngine } from '../hooks/useGameEngine';
import type { InteractionMode } from '../types';

interface GameMatchProps {
  engine: GameEngine;
  onBackToMenu: () => void;
}

export const GameMatch: React.FC<GameMatchProps> = ({ engine, onBackToMenu }) => {
  const {
    mode,
    humanRole,
    matchPhase,
    currentPlayer,
    aPos,
    bPos,
    turn,
    bTimeInRange,
    winner,
    scenario,
    isHumanTurn,
    isValidMove,
    handlePlayerMove,
    getValidMoves, // Exposed
    startHotseat,
    startAIMatch,
    handleShortScan,
    handleLongScan,
    resources,
    // scanResult, // Removed
    lastScan,      // Added
    previousScan,  // Added
    hasPerformedScan, // Added
    weather,
  } = engine;

  const [interactionMode, setInteractionMode] = useState<InteractionMode>('IDLE');

  const handleToggleScanMode = () => {
    // 如果已经执行过侦察，不响应长观测按钮
    if (hasPerformedScan) return;
    
    setInteractionMode(prev => prev === 'SCAN_LONG_AIM' ? 'IDLE' : 'SCAN_LONG_AIM');
  };

  const handleShortScanWrapper = () => {
    // 如果已经执行过侦察，不执行短观测
    if (hasPerformedScan) return;
    
    // 如果当前正处于长观测选择模式，先取消该模式，再执行短观测
    if (interactionMode === 'SCAN_LONG_AIM') {
      setInteractionMode('IDLE');
    }
    
    handleShortScan();
  };

  const handleCellClick = (x: number, y: number) => {
    if (!scenario) return;

    // 如果在长观测模式下，但本回合已经执行过侦察（理论上按钮已禁用，这里做双重保险），则退出扫描模式
    if (interactionMode === 'SCAN_LONG_AIM' && hasPerformedScan) {
        setInteractionMode('IDLE');
        return;
    }

    if (interactionMode === 'SCAN_LONG_AIM') {
      // 侦察模式逻辑：以点击点为圆心
      handleLongScan({ x, y });
      setInteractionMode('IDLE');
    } else {
      // 移动模式逻辑 (IDLE/MOVING)
      if (matchPhase === 'playing' && isHumanTurn) {
        const validMoves = getValidMoves(currentPlayer, currentPlayer === 'A' ? aPos.x : bPos.x);
        const targetMove = validMoves.find(m => m.x === x && m.y === y);
        
        if (targetMove) {
          handlePlayerMove(targetMove.y);
        }
      }
    }
  };

  const currentModeLabel =
    mode === 'hotseat'
      ? 'Hotseat Mode'
      : mode === 'ai'
      ? `AI Match (${humanRole === 'A' ? 'You are Blue (Evader)' : 'You are Red (Pursuer)'})`
      : 'No Mode Selected';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black text-slate-200 font-sans py-4 overflow-hidden flex flex-col">
      {/* 顶部栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0 px-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-lg flex items-center gap-3">
            Orbital Pursuit
            <span className="text-xs font-normal text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">
              {currentModeLabel}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'ai' && humanRole && (
            <span
              className={`px-3 py-1 rounded-full text-xs border ${
                humanRole === 'A'
                  ? 'bg-blue-950/70 border-blue-800 text-blue-200'
                  : 'bg-red-950/70 border-red-800 text-red-200'
              }`}
            >
              You: {humanRole === 'A' ? 'Blue (Evader)' : 'Red (Pursuer)'}
            </span>
          )}

          <button
            onClick={onBackToMenu}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/70 hover:bg-slate-800 transition text-xs"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* 主布局：左规则 | 中棋盘 | 右背景 */}
      <main className="flex-1 flex flex-row w-full min-h-0 overflow-hidden">
        {/* 左侧：游戏规则 */}
        <aside className="hidden lg:flex w-52 xl:w-60 shrink-0 flex-col border-r border-slate-700/50 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 z-10">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-cyan-300 shrink-0" size={18} />
              <h3 className="text-sm font-bold text-white">Game Rules</h3>
            </div>
          </div>
          <div className="p-4 space-y-2 text-slate-300 text-xs leading-5">
            {RULES_TEXT.map((item, idx) => (
              <p key={idx}>
                <span className="text-cyan-300 font-mono mr-1.5">{idx + 1}.</span>
                {item}
              </p>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-700/50 text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">Action</p>
              <p>
                Orb <span className="font-mono text-slate-200">y</span> → drift <span className="font-mono">dx = y - 2</span>: ←2, ←1, Stay, →1, →2
              </p>
            </div>
          </div>
        </aside>

        {/* 中央：棋盘 + 控制面板 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 min-w-0 min-h-0">
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden min-h-0">
            {scenario && (
            <GameBoard 
              turn={turn} // Pass turn
              aPos={aPos} 
              bPos={bPos} 
              matchPhase={matchPhase} 
              scenario={scenario}
              currentPlayer={isHumanTurn ? currentPlayer : humanRole}
              isHumanTurn={isHumanTurn}
              scanResult={lastScan ? (
                mode === 'hotseat' 
                  ? lastScan[currentPlayer] // 热座模式：显示当前行动玩家的信息
                  : humanRole 
                    ? lastScan[humanRole]   // AI 模式：显示人类玩家的信息
                    : null
              ) : null}
              previousScanResult={previousScan ? (
                mode === 'hotseat'
                  ? previousScan[currentPlayer]
                  : humanRole
                    ? previousScan[humanRole]
                    : null
              ) : null}
              onCellClick={handleCellClick}
              isScanning={interactionMode === 'SCAN_LONG_AIM'}
              validMoves={isHumanTurn && matchPhase === 'playing' ? getValidMoves(currentPlayer, currentPlayer === 'A' ? aPos.x : bPos.x) : []}
            />
          )}
          </div>

          {/* 控制面板 - 固定在底部 */}
          <div className="shrink-0 w-full flex justify-center pb-2 z-30 px-4">
            {matchPhase === 'playing' ? (
              scenario && (
                <GameControls
                isHumanTurn={isHumanTurn}
                currentPlayer={currentPlayer}
                mode={mode}
                aPos={aPos}
                bPos={bPos}
                scenario={scenario}
                isValidMove={isValidMove}
                onPlayerMove={handlePlayerMove}
                onShortScan={handleShortScanWrapper}
                onToggleScanMode={handleToggleScanMode}
                interactionMode={interactionMode}
                turn={turn}
                hasPerformedScan={hasPerformedScan}
                weather={weather}
                bTimeInRange={bTimeInRange}
                resources={resources}
              />
            )
          ) : (
            <GameOver
              winner={winner}
              mode={mode}
              humanRole={humanRole}
              onRestartHotseat={() => scenario && startHotseat(scenario)}
              onRestartAI={(role) => scenario && startAIMatch(role, scenario)}
              onBackToMenu={onBackToMenu}
            />
          )}
          </div>
        </div>

        {/* 右侧：背景介绍 */}
        <aside className="hidden lg:flex w-52 xl:w-60 shrink-0 flex-col border-l border-slate-700/50 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Satellite className="text-blue-300 shrink-0" size={18} />
              <h3 className="text-sm font-bold text-white">Background</h3>
            </div>
          </div>
          <div className="p-4 space-y-2 text-slate-300 text-xs leading-5">
            {BACKGROUND_TEXT.map((item, idx) => (
              <p key={idx}>
                <span className="text-blue-300 font-mono mr-1.5">•</span>
                {item}
              </p>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-700/50 text-slate-400">
              <p className="text-slate-300 font-semibold mb-1">Why interesting?</p>
              <p>
                Involves <span className="text-slate-200">adversarial planning, incomplete information, risk management</span> — ideal for game theory & AI.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
