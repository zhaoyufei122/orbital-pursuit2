import React from 'react';
import { Satellite, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { posOf, chebyshevDist } from '../utils';
import type { Pos, MatchPhase } from '../types';
import type { GameScenario } from '../config/scenarios';

interface GameBoardProps {
  aPos: Pos;
  bPos: Pos;
  matchPhase: MatchPhase;
  scenario: GameScenario;
  currentPlayer: Player | null; // 添加 currentPlayer 以支持迷雾逻辑
  isHumanTurn: boolean;         // 用于区分 AI 思考时是否显示真实信息（如果是热座，通常显示当前行动者视角）
  scanResult: { turn: number; detectedColumn: number | null; detectedPos: Pos | null } | null;
  onCellClick?: (x: number, y: number) => void;
  isScanning?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  aPos, 
  bPos, 
  matchPhase, 
  scenario, 
  currentPlayer,
  isHumanTurn,
  scanResult,
  onCellClick,
  isScanning
}) => {
  // 动态计算容器尺寸
  const containerWidth = scenario.gridW * 42 + 100;
  const containerHeight = scenario.gridH * 42 + 100;

  // 计算中心索引
  const centerRow = (scenario.gridH - 1) / 2;
  const centerCol = (scenario.gridW - 1) / 2;

  // 计算度数映射
  const getDegreeLabel = (x: number) => {
    // 线性映射: x=0 -> -0.5, x=GRID_W-1 -> +0.5
    const deg = -0.5 + (x / (scenario.gridW - 1));
    const val = deg.toFixed(2);
    if (Math.abs(deg) < 0.001) return '0°';
    return `${deg > 0 ? '+' : ''}${parseFloat(val)}°`;
  };

  const getRowLabel = (y: number) => {
    // 之前逻辑：centerRow - y (上正下负)
    // 现在逻辑：y - centerRow (上负下正)
    // y=0 (Top) -> 0 - 5 = -5
    // y=5 (Center) -> 5 - 5 = 0
    // y=10 (Bottom) -> 10 - 5 = +5
    const val = y - centerRow;
    if (val === 0) return '0';
    return `${val > 0 ? '+' : ''}${val}`;
  };

  // 可见性逻辑
  // 1. 如果没有迷雾，总是可见
  // 2. 游戏结束，总是可见
  // 3. 当前是 A 的回合：A 可见，B 只有在检测范围内或被侦察到才可见
  // 4. 当前是 B 的回合：B 可见，A 只有在检测范围内或被侦察到才可见
  const isFogActive = scenario.fogOfWar && matchPhase === 'playing';
  
  const isAVisible = !isFogActive || !currentPlayer || currentPlayer === 'A' || chebyshevDist(aPos, bPos) <= 1 || (scanResult?.detectedPos?.x === aPos.x && scanResult?.detectedPos?.y === aPos.y);
  
  const isBVisible = !isFogActive || !currentPlayer || currentPlayer === 'B' || chebyshevDist(aPos, bPos) <= 1 || (scanResult?.detectedPos?.x === bPos.x && scanResult?.detectedPos?.y === bPos.y);

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800/50">
      <div 
        className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-700/30 shadow-2xl overflow-hidden shrink-0"
        style={{ 
          width: containerWidth, 
          height: containerHeight,
          minWidth: containerWidth,
          minHeight: containerHeight
        }}
      >
        {/* 网格背景线 */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: `42px 42px`,
            backgroundPosition: `50px 50px`
          }} 
        />

        {/* 列标签 (度数) - 放在顶部和底部 */}
        {Array.from({ length: scenario.gridW }).map((_, x) => {
          const pos = posOf(x, -0.6); // 顶部标签
          return (
            <div
              key={`col-top-${x}`}
              className="absolute w-10 text-center text-slate-500 font-mono text-[10px] z-10 -translate-x-1/2"
              style={{ left: pos.x + 21, top: pos.y + 10 }}
            >
              {getDegreeLabel(x)}
            </div>
          );
        })}

        {/* 轨道标签 (行号) - 放在左侧 */}
        {Array.from({ length: scenario.gridH }).map((_, y) => {
          const pos = posOf(-0.8, y);
          return (
            <div
              key={`row-${y}`}
              className="absolute w-8 text-right text-slate-400 font-mono text-xs z-10 flex items-center justify-end"
              style={{
                left: pos.x,
                top: pos.y,
                height: 42
              }}
            >
              {getRowLabel(y)}
            </div>
          );
        })}

        {/* 渲染矩形网格 */}
        {Array.from({ length: scenario.gridH }).map((_, y) =>
          Array.from({ length: scenario.gridW }).map((_, x) => {
            const pos = posOf(x, y);
            const isAArea = x >= scenario.aMinX && x <= scenario.aMaxX;
            const isTargetLock = chebyshevDist({ x, y }, bPos) <= 1;
            
            // 扫描高亮
            const isScannedColumn = scanResult?.detectedColumn === x;
            const isScannedPos = scanResult?.detectedPos?.x === x && scanResult?.detectedPos?.y === y;

            return (
              <div
                key={`cell-${x}-${y}`}
                onClick={() => isScanning && onCellClick?.(x, y)}
                className={`absolute w-[40px] h-[40px] rounded-sm transition-colors duration-500 backdrop-blur-sm z-10
                  ${
                    isAArea
                      ? 'bg-blue-500/5 border border-blue-400/10'
                      : 'bg-slate-800/10 border border-slate-700/20'
                  }
                  ${isScannedColumn ? 'bg-amber-500/20 border-amber-500/40' : ''}
                  ${isScannedPos ? 'bg-red-500/30 border-red-500/60' : ''}
                  ${isScanning ? 'cursor-crosshair hover:bg-amber-500/30 hover:border-amber-400' : ''}
                `}
                style={{ left: pos.x, top: pos.y }}
              >
                {/* 锁定框只在 B 视角或无迷雾时可见，或者是游戏结束 */}
                {isTargetLock && matchPhase !== 'gameover' && (currentPlayer === 'B' || !isFogActive) && (
                  <div className="absolute inset-[-1px] border-2 border-red-500/40 bg-red-500/5 rounded-sm pointer-events-none" />
                )}
              </div>
            );
          })
        )}

        {/* 蓝方卫星 A */}
        {isAVisible && (
          <motion.div
            className={`absolute w-[40px] h-[40px] flex items-center justify-center text-blue-400 z-30 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] ${
              isFogActive && currentPlayer !== 'A' ? 'opacity-70 grayscale' : ''
            }`}
            initial={false}
            animate={{
              left: posOf(aPos.x, aPos.y).x,
              top: posOf(aPos.x, aPos.y).y,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            <Satellite size={24} strokeWidth={1.5} />
          </motion.div>
        )}

        {/* 红方追击者 B */}
        {isBVisible && (
          <motion.div
            className={`absolute w-[40px] h-[40px] flex items-center justify-center text-red-400 z-40 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] ${
              isFogActive && currentPlayer !== 'B' ? 'opacity-70 grayscale' : ''
            }`}
            initial={false}
            animate={{
              left: posOf(bPos.x, bPos.y).x,
              top: posOf(bPos.x, bPos.y).y,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            <Rocket size={24} strokeWidth={1.5} />
          </motion.div>
        )}
      </div>
    </div>
  );
};
