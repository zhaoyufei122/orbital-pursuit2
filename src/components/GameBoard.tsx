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
}

export const GameBoard: React.FC<GameBoardProps> = ({ aPos, bPos, matchPhase, scenario }) => {
  // 动态计算容器尺寸
  const containerWidth = scenario.gridW * 42 + 100;
  const containerHeight = scenario.gridH * 42 + 100;

  // 计算中心索引
  const centerRow = (scenario.gridH - 1) / 2;
  const centerCol = (scenario.gridW - 1) / 2;

  // 计算度数映射
  const getDegreeLabel = (x: number) => {
    // 线性映射: x=0 -> -0.5, x=GRID_W-1 -> +0.5
    // 假设场景宽度总覆盖约 1.0 度 (-0.5 to +0.5)
    // 如果是小地图，可能度数范围不同，这里暂且沿用 -0.5 ~ +0.5 的映射逻辑
    const deg = -0.5 + (x / (scenario.gridW - 1));
    const val = deg.toFixed(2);
    if (Math.abs(deg) < 0.001) return '0°';
    return `${deg > 0 ? '+' : ''}${parseFloat(val)}°`;
  };

  const getRowLabel = (y: number) => {
    const val = centerRow - y;
    if (val === 0) return '0';
    return `${val > 0 ? '+' : ''}${val}`;
  };

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

            return (
              <div
                key={`cell-${x}-${y}`}
                className={`absolute w-[40px] h-[40px] rounded-sm transition-colors duration-500 backdrop-blur-sm z-10
                  ${
                    isAArea
                      ? 'bg-blue-500/5 border border-blue-400/10'
                      : 'bg-slate-800/10 border border-slate-700/20'
                  }`}
                style={{ left: pos.x, top: pos.y }}
              >
                {isTargetLock && matchPhase !== 'gameover' && (
                  <div className="absolute inset-[-1px] border-2 border-red-500/40 bg-red-500/5 rounded-sm pointer-events-none" />
                )}
              </div>
            );
          })
        )}

        {/* 蓝方卫星 A */}
        <motion.div
          className="absolute w-[40px] h-[40px] flex items-center justify-center text-blue-400 z-30 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
          initial={false}
          animate={{
            left: posOf(aPos.x, aPos.y).x,
            top: posOf(aPos.x, aPos.y).y,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <Satellite size={24} strokeWidth={1.5} />
        </motion.div>

        {/* 红方追击者 B */}
        <motion.div
          className="absolute w-[40px] h-[40px] flex items-center justify-center text-red-400 z-40 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]"
          initial={false}
          animate={{
            left: posOf(bPos.x, bPos.y).x,
            top: posOf(bPos.x, bPos.y).y,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <Rocket size={24} strokeWidth={1.5} />
        </motion.div>
      </div>
    </div>
  );
};
