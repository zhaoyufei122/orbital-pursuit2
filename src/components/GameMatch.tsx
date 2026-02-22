import React, { useState } from 'react';
import { BookOpen, Satellite } from 'lucide-react';
import { GameBoard } from './GameBoard';
import { GameStatus } from './GameStatus';
import { GameControls } from './GameControls';
import { GameOver } from './GameOver';
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

      {/* 主布局：垂直排列，占据剩余空间 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 w-full h-full relative">
        {/* Debug Info - Temporary */}
        {/* <div className="absolute top-10 left-4 z-50 bg-black/80 text-green-400 p-2 text-[10px] font-mono whitespace-pre pointer-events-none">
            DEBUG:
            Turn: {turn}
            Phase: {matchPhase}
            LastScan: {JSON.stringify(lastScan, null, 2)}
            CurrentPlayer: {currentPlayer}
            Scenario: {scenario?.id}
        </div> */}

        {/* 状态栏放在地图上方 */}
        <div className="absolute top-0 z-30 pointer-events-none w-full flex justify-center">
           {/* 使用 scale 缩小状态栏以避免遮挡 */}
           <div className="scale-90 origin-top">
             <GameStatus 
                turn={turn} 
                bTimeInRange={bTimeInRange} 
                currentPlayer={currentPlayer} 
                resources={resources}
                scenario={scenario}
             />
           </div>
        </div>

        {/* 游戏地图区域 - 占据最大空间 */}
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
      </main>
    </div>
  );
};
