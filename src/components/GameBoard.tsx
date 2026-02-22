import React from 'react';
import { Satellite, Rocket, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { posOf, chebyshevDist } from '../utils';
import type { Pos, MatchPhase, Player } from '../types';
import type { GameScenario } from '../config/scenarios';
import { isWithinVisualRange, isWithinCaptureRange } from '../game/rules';
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
  previousScanResult: {
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
  previousScanResult,
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
  
  // 使用物理距离判断是否可见 (100km)，不考虑盲区 (只要距离足够近，就算发现)
  // 否则蓝方也会受到视场盲区限制，这可能不符合“蓝方是被动逃逸者”的直觉
  const inVisualDist = getPhysicalDistance(aPos, bPos, scenario) <= (scenario.ranges.visual || 100);

  const isAVisible = !isFogActive || !currentPlayer || currentPlayer === 'A' || inVisualDist || (scanResult?.detectedPos && scanResult.detectedPos.x === aPos.x && scanResult.detectedPos.y === aPos.y);
  
  const isBVisible = !isFogActive || !currentPlayer || currentPlayer === 'B' || inVisualDist || (scanResult?.detectedPos && scanResult.detectedPos.x === bPos.x && scanResult.detectedPos.y === bPos.y);

  // 获取当前玩家的当前位置 (用于 HUD 定位)
  const currentPos = currentPlayer === 'A' ? aPos : bPos;
  // 获取当前玩家在当前位置是否可见 (如果不可见，HUD 应该也隐藏或特殊处理?) - 玩家自己当然可见
  // 仅在 isHumanTurn 时显示 HUD

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

        {/* HUD：竖直移动控制条 (仅在人类回合且非扫描模式时显示) */}
        {!isScanning && isHumanTurn && matchPhase === 'playing' && currentPlayer && (
          <div className="absolute z-50 pointer-events-none" 
               style={{ 
                 left: posOf(currentPos.x, 0).x - 10, // 稍微左移一点，放在格子左侧
                 top: 50, 
                 bottom: 50,
                 width: 60
               }}
          >
             {/* 这一层是 HUD 容器，覆盖当前列 */}
             {/* 渲染所有合法的目标行按钮 */}
             {validMoves?.map((move) => {
                const isCurrent = move.y === currentPos.y;
                const isUp = move.y < currentPos.y;
                const isDown = move.y > currentPos.y;
                const fuelCost = Math.abs(move.y - currentPos.y) * 0.6;
                const pos = posOf(0, move.y); // 只取 Y 坐标，X 相对定位

                return (
                  <div 
                    key={`hud-btn-${move.y}`}
                    className="absolute left-0 w-full h-[42px] flex items-center justify-center pointer-events-auto group"
                    style={{ top: pos.y - 50 }} // posOf 基于 padding 50
                    onClick={() => onCellClick?.(move.x, move.y)}
                  >

                    {/* 按钮主体 - 确保 z-index 高于预测条 */}
                    <div className={`
                      relative flex items-center justify-center transition-all duration-200 z-10
                      ${isCurrent 
                        ? 'w-10 h-10 bg-transparent border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] z-20 rounded-md' 
                        : 'w-6 h-8 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:w-10 hover:h-8 hover:shadow-[0_0_10px_rgba(16,185,129,0.4)] z-10 rounded'
                      }
                    `}>
                      {isCurrent ? null : (
                        <span className="opacity-0 group-hover:opacity-100 font-mono text-[10px] whitespace-nowrap">
                          {fuelCost.toFixed(1)}
                        </span>
                      )}
                      
                      {/* 装饰性三角/箭头 */}
                      {!isCurrent && (
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/50 group-hover:hidden">
                            {isUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                         </div>
                      )}
                    </div>

                    {/* 位置预测：长圆角矩形 */
                     /* 优化：添加水平偏移，避免与半透明按钮重叠 */
                     /* 优化：延伸至终点格约 3/4 处 (center + 11px) */
                    !isCurrent && Math.abs(move.x - currentPos.x) > 0 && (
                        <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200 z-0"
                             style={{
                               // 计算偏移量：避开按钮区域
                               // 按钮半宽约 14px (gap)
                               // 目标格: 延伸至中心点外约 11px 处 (即覆盖约 3/4 格宽, 21 + 10.5)
                               // width = dist * 42 - gap + extension = dist * 42 - 14 + 11 = dist * 42 - 3
                               // left (左移) = 30 - (dist * 42) - extension = 30 - (dist * 42) - 11
                               // left (右移) = 30 + gap = 30 + 14
                               left: move.x < currentPos.x 
                                 ? 30 - (Math.abs(move.x - currentPos.x) * 42) - 11
                                 : 30 + 14,
                               
                               width: Math.max(0, (Math.abs(move.x - currentPos.x) * 42) - 3), 
                               height: 24,
                               marginTop: -1,
                               
                               // 圆角处理：远离按钮的一端完全圆角，靠近按钮的一端小圆角
                               borderRadius: move.x < currentPos.x ? '12px 2px 2px 12px' : '2px 12px 12px 2px',
                             }}
                        >
                           {/* 浅色背景条 */}
                           <div className={`w-full h-full bg-emerald-500/5 border-emerald-500/20
                             ${move.x < currentPos.x ? 'border-y border-l' : 'border-y border-r'}
                           `} style={{ borderRadius: 'inherit' }} />
                           
                           {/* 悬停时加深 */}
                           <div className={`absolute inset-0 w-full h-full bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)] opacity-0 group-hover:opacity-100 transition-opacity border-emerald-400/50
                             ${move.x < currentPos.x ? 'border-y-2 border-l-2' : 'border-y-2 border-r-2'}
                           `} style={{ borderRadius: 'inherit' }} />
                        </div>
                    )}
                  </div>
                );
             })}
          </div>
        )}

        {/* 渲染矩形网格 */}
        {Array.from({ length: scenario.gridH }).map((_, y) =>
          Array.from({ length: scenario.gridW }).map((_, x) => {
            const pos = posOf(x, y);
            const isAArea = x >= scenario.aMinX && x <= scenario.aMaxX;
            const isTargetLock = chebyshevDist({ x, y }, bPos) <= 1; // 仅作为锁定动画参考
            
            // -------------------------------------------------------------------------
            // 扫描结果显示逻辑 (当前回合 + 上一回合)
            // -------------------------------------------------------------------------

            // 辅助函数：判断格子是否在扫描结果中
            const checkScanCoverage = (result: typeof scanResult, checkX: number, checkY: number) => {
              if (!result) return { isScannedColumn: false, inScannedArea: false, isTargetPos: false };

              const isScannedColumn = result.detectedColumn === checkX;
              const isTargetPos = result.detectedPos?.x === checkX && result.detectedPos?.y === checkY;
              
              let inScannedArea = false;
              if (result.scanType === 'LONG' && result.scannedArea) {
                  const { center, radius } = result.scannedArea;
                  const distKm = getPhysicalDistance({ x: checkX, y: checkY }, center, scenario);
                  inScannedArea = distKm <= radius;
              }

              return { isScannedColumn, inScannedArea, isTargetPos };
            };

            const currentScan = checkScanCoverage(scanResult, x, y);
            const prevScan = checkScanCoverage(previousScanResult, x, y);

            const showCurrentScanOverlay = currentScan.isScannedColumn || currentScan.isTargetPos || (currentScan.inScannedArea && !scanResult?.detectedPos) || (currentScan.inScannedArea && scanResult?.detectedPos && !currentScan.isTargetPos);
            const showPrevScanOverlay = prevScan.isScannedColumn || prevScan.isTargetPos || (prevScan.inScannedArea && !previousScanResult?.detectedPos) || (prevScan.inScannedArea && previousScanResult?.detectedPos && !prevScan.isTargetPos);

            // 检查当前显示的 lastScan 是否是本回合的新鲜数据
            const isCurrentScanFresh = scanResult?.turn === turn;
            const currentOpacityClass = isCurrentScanFresh ? 'opacity-100 z-10' : 'opacity-60 brightness-75 grayscale-[30%] z-0';

            // 2. 导引区域 (Visual Guidance Area, 100km)
            const distKmB = getPhysicalDistance({ x, y }, bPos, scenario);
            
            // 判定是否在区域内 (Identification Range, 50km)
            // 修正：盲区约束已移除，直接使用距离判断
            const isIdentZone = isWithinCaptureRange(bPos, { x, y }, scenario);
            
            // 修正：盲区约束已移除，直接使用距离判断
            const isVisualZone = isWithinVisualRange(bPos, { x, y }, scenario);

            // 可视化样式：仅在 B 可见时显示
            const showZoneHighlight = isBVisible;

            // 如果是扫描模式，允许点击所有格子
            // 如果是移动模式，只允许点击 HUD 按钮 (HUD 已独立渲染)，但为了防止误触或逻辑兼容，这里可以保留基础的点击响应，或者禁用网格点击
            // 实际上，HUD 按钮是在网格之上的，所以网格点击会被 HUD 拦截。但为了支持点击目标格（Ghost Unit 的替代品）
            // 我们之前移除了 Ghost Unit。现在逻辑是：只能点 HUD 按钮。
            // 除非：用户想点击那个“预测终点”？目前 HUD 设计已经覆盖了。
            
            const isInteractive = isScanning; // 只有扫描模式下，网格本身是可交互的

            return (
              <div
                key={`cell-${x}-${y}`}
                onClick={() => isInteractive && onCellClick?.(x, y)}
                className={`absolute w-[40px] h-[40px] rounded-sm transition-all duration-300 backdrop-blur-sm z-10 group
                  ${
                    isAArea
                      ? 'bg-blue-500/5 border border-blue-400/10'
                      : 'bg-slate-800/10 border border-slate-700/20'
                  }
                  ${showZoneHighlight && isIdentZone ? 'bg-red-500/20 border border-red-500/40' : ''}
                  ${showZoneHighlight && isVisualZone && !isIdentZone ? 'bg-red-500/5 border border-dashed border-red-500/20' : ''}
                  ${isScanning ? 'cursor-crosshair hover:bg-amber-500/30 hover:border-amber-400' : ''}
                `}
                style={{ left: pos.x, top: pos.y }}
              >
                 {/* 观测结果背景层 (当前回合) - 优先级高 */}
                 {showCurrentScanOverlay && (
                    <div className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-300 ${currentOpacityClass}
                      ${currentScan.isScannedColumn ? 'bg-amber-500/20 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : ''}
                      ${currentScan.isTargetPos ? 'bg-red-500/40 border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}
                      ${currentScan.inScannedArea && !scanResult?.detectedPos ? 'bg-slate-700/30 border border-slate-600/40 border-dashed' : ''}
                      ${currentScan.inScannedArea && scanResult?.detectedPos && !currentScan.isTargetPos ? 'bg-red-900/10 border border-red-900/20' : ''}
                    `} />
                 )}

                 {/* 观测结果背景层 (上一回合) - 优先级低，如果当前回合未覆盖此格才显示 */}
                 {showPrevScanOverlay && !showCurrentScanOverlay && (
                    <div className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-300 opacity-60 brightness-75 grayscale-[30%] z-0
                      ${prevScan.isScannedColumn ? 'bg-amber-500/20 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : ''}
                      ${prevScan.isTargetPos ? 'bg-red-500/40 border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}
                      ${prevScan.inScannedArea && !previousScanResult?.detectedPos ? 'bg-slate-700/30 border border-slate-600/40 border-dashed' : ''}
                      ${prevScan.inScannedArea && previousScanResult?.detectedPos && !prevScan.isTargetPos ? 'bg-red-900/10 border border-red-900/20' : ''}
                    `} />
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
