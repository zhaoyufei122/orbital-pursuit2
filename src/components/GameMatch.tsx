import React, { useState } from 'react';
import { BookOpen, Satellite } from 'lucide-react';
import { GameBoard } from './GameBoard';
import { GameStatus } from './GameStatus';
import { GameControls } from './GameControls';
import { GameOver } from './GameOver';
import type { GameEngine } from '../hooks/useGameEngine';

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
    startHotseat,
    startAIMatch,
    handleShortScan,
    handleLongScan,
    resources,
    // scanResult, // Removed
    lastScan,      // Added
    hasPerformedScan, // Added
  } = engine;

  const [isScanning, setIsScanning] = useState(false);

  const handleToggleScanMode = () => {
    setIsScanning(!isScanning);
  };

  const handleCellClick = (x: number, y: number) => {
    if (!isScanning || !scenario) return;

    // 计算 10x10 区域，以 (x, y) 为中心
    // 10x10 意味着半径约为 5。
    // 左上角: x - 5, y - 5 (如果 10 是偶数，中心偏左上或右下，这里假设 x-4 到 x+5 或 x-5 到 x+4)
    // 让我们用 x-5 到 x+4，共 10 格。
    // y 同理。
    
    // 边界检查：minX >= 0, maxX < gridW
    // 但实际上扫描区域可以超出边界，只是无效而已。为了逻辑简单，我们计算理论区域，reducer 会处理是否命中。
    
    const minX = Math.max(0, x - 5);
    const maxX = Math.min(scenario.gridW - 1, x + 4);
    const minY = Math.max(0, y - 5);
    const maxY = Math.min(scenario.gridH - 1, y + 4);
    
    handleLongScan({ minX, maxX, minY, maxY });
    setIsScanning(false);
  };

  const currentModeLabel =
    mode === 'hotseat'
      ? '热座模式 Hotseat'
      : mode === 'ai'
      ? `AI对战 (${humanRole === 'A' ? '你是蓝方逃逸者' : '你是红方追击者'})`
      : '未选择模式';

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
              你扮演：{humanRole === 'A' ? '蓝方逃逸者' : '红方追击者'}
            </span>
          )}

          <button
            onClick={onBackToMenu}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/70 hover:bg-slate-800 transition text-xs"
          >
            返回首页
          </button>
        </div>
      </div>

      {/* 主布局：垂直排列，占据剩余空间 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 w-full h-full relative">
        {/* 状态栏放在地图上方 */}
        <div className="absolute top-0 z-30 pointer-events-none">
           {/* 使用 scale 缩小状态栏以避免遮挡 */}
           <div className="scale-90 origin-top">
             <GameStatus turn={turn} bTimeInRange={bTimeInRange} currentPlayer={currentPlayer} />
           </div>
        </div>

        {/* 游戏地图区域 - 占据最大空间 */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden min-h-0">
          {scenario && (
            <GameBoard 
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
              onCellClick={handleCellClick}
              isScanning={isScanning}
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
                onShortScan={handleShortScan}
                onToggleScanMode={handleToggleScanMode}
                isScanning={isScanning}
                turn={turn}
                hasPerformedScan={hasPerformedScan}
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
