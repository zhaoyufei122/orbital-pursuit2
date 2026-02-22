import React from 'react';
import { Satellite, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { posOf, chebyshevDist } from '../utils';
import type { Pos, MatchPhase, Player } from '../types';
import type { GameScenario } from '../config/scenarios';
import { isWithinVisualRange } from '../game/rules';
import { getPhysicalDistance } from '../game/physics';

interface GameBoardProps {
  turn: number;
  aPos: Pos;
  bPos: Pos;
  matchPhase: MatchPhase;
  scenario: GameScenario;
  currentPlayer: Player | null;
  isHumanTurn: boolean;
  scanResult: { 
    turn: number; 
    scanType?: 'SHORT' | 'LONG';
    detectedColumn: number | null; 
    detectedPos: Pos | null;
    scannedArea?: { center: Pos; radius: number };
  } | null;
  onCellClick?: (x: number, y: number) => void;
  isScanning?: boolean;
  validMoves?: { x: number; y: number }[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  turn,
  aPos, 
  bPos, 
  matchPhase, 
  scenario, 
  currentPlayer,
  isHumanTurn,
  scanResult,
  onCellClick,
  isScanning,
  validMoves,
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
  
  // 使用物理目视距离判断是否可见 (100km)
  const inVisualRange = isWithinVisualRange(aPos, bPos, scenario);

  const isAVisible = !isFogActive || !currentPlayer || currentPlayer === 'A' || inVisualRange || (scanResult?.detectedPos && scanResult.detectedPos.x === aPos.x && scanResult.detectedPos.y === aPos.y);
  
  const isBVisible = !isFogActive || !currentPlayer || currentPlayer === 'B' || inVisualRange || (scanResult?.detectedPos && scanResult.detectedPos.x === bPos.x && scanResult.detectedPos.y === bPos.y);

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
            const isTargetLock = chebyshevDist({ x, y }, bPos) <= 1; // 仅作为锁定动画参考
            
            const isScannedColumn = scanResult?.detectedColumn === x;
            
            // Check if cell is within Long Scan Rect
            let inScannedArea = false;
            let radius = 0;
            if (scanResult?.scanType === 'LONG' && scanResult.scannedArea) {
                radius = scanResult.scannedArea.radius;
                const { center } = scanResult.scannedArea;
                const distKm = getPhysicalDistance({ x, y }, center, scenario);
                inScannedArea = distKm <= radius;
            }

            const isScanFresh = scanResult?.turn === turn;
            // 调整历史数据样式：不再过度变暗，而是稍微降低饱和度和亮度，保持可读性
            const opacityClass = isScanFresh ? 'opacity-100 z-10' : 'opacity-60 brightness-75 grayscale-[30%] z-0';
            
            const isValidMoveTarget = !isScanning && validMoves?.some(m => m.x === x && m.y === y);
            const isCurrentPos = (currentPlayer === 'A' && aPos.x === x && aPos.y === y) || (currentPlayer === 'B' && bPos.x === x && bPos.y === y);

            // Determine if any scan overlay should be rendered
            // 使用物理距离计算是否在扫描范围内
            // 上面已经计算了 inScannedArea

            // 强制显示：如果当前格子是 detectedPos，无论其他条件如何，都视为 isTargetPos
            // 确保 detectedPos 对象的坐标与当前 x,y 匹配
            const isTargetPos = scanResult?.detectedPos?.x === x && scanResult?.detectedPos?.y === y;

            const showScanOverlay = isScannedColumn || isTargetPos || (inScannedArea && !scanResult?.detectedPos) || (inScannedArea && scanResult?.detectedPos && !isTargetPos);

            // 2. 导引区域 (Visual Guidance Area, 100km)
            const distKmB = getPhysicalDistance({ x, y }, bPos, scenario);
            
            // 判定是否在区域内
            const isIdentZone = distKmB <= (scenario.ranges?.identification || 50);
            const isVisualZone = distKmB <= (scenario.ranges?.visual || 100);

            // 可视化样式：仅在 B 可见时显示
            const showZoneHighlight = isBVisible;

            return (
              <div
                key={`cell-${x}-${y}`}
                onClick={() => onCellClick?.(x, y)}
                className={`absolute w-[40px] h-[40px] rounded-sm transition-all duration-300 backdrop-blur-sm z-10
                  ${
                    isAArea
                      ? 'bg-blue-500/5 border border-blue-400/10'
                      : 'bg-slate-800/10 border border-slate-700/20'
                  }
                  ${showZoneHighlight && isIdentZone ? 'bg-red-500/20 border border-red-500/40' : ''}
                  ${showZoneHighlight && isVisualZone && !isIdentZone ? 'bg-red-500/5 border border-dashed border-red-500/20' : ''}
                  ${isScanning ? 'cursor-crosshair hover:bg-amber-500/30 hover:border-amber-400' : ''}
                  ${isValidMoveTarget && !isCurrentPos ? 'cursor-pointer z-30 border-2 border-emerald-400/80 bg-emerald-500/40 hover:bg-emerald-500/60 hover:scale-105 shadow-[0_0_15px_rgba(52,211,153,0.6)]' : ''}
                  ${isValidMoveTarget && isCurrentPos ? 'cursor-pointer z-30 border-2 border-white/70 bg-white/20 hover:bg-white/30' : ''}
                `}
                style={{ left: pos.x, top: pos.y }}
              >
                 {/* 观测结果背景层 - 独立出来，避免影响移动图标，但要通过 opacityClass 控制其视觉衰减 */}
                 {showScanOverlay && (
                    <div className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-300 ${opacityClass}
                      ${isScannedColumn ? 'bg-amber-500/20 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : ''}
                      ${isTargetPos ? 'bg-red-500/40 border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}
                      ${inScannedArea && !scanResult?.detectedPos ? 'bg-slate-700/30 border border-slate-600/40 border-dashed' : ''}
                      ${inScannedArea && scanResult?.detectedPos && !isTargetPos ? 'bg-red-900/10 border border-red-900/20' : ''}
                    `} />
                 )}

                {/* 移动目标的幽灵图标 - 层级在观测层之上 */}
                {isValidMoveTarget && !isCurrentPos && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    {currentPlayer === 'A' ? (
                      <Satellite size={16} className="text-emerald-100 drop-shadow-md" />
                    ) : (
                      <Rocket size={16} className="text-emerald-100 drop-shadow-md" />
                    )}
                  </div>
                )}
                
                {/* 当前位置作为移动目标的提示 (Hold Position) */}
                {isValidMoveTarget && isCurrentPos && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-[10px] font-mono text-white font-bold drop-shadow-md">HOLD</span>
                   </div>
                )}

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
            className={`absolute w-[40px] h-[40px] flex items-center justify-center text-blue-400 z-30 pointer-events-none drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] ${
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
            className={`absolute w-[40px] h-[40px] flex items-center justify-center text-red-400 z-40 pointer-events-none drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] ${
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
