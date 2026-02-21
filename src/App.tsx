import React, { useState } from 'react';
import { Satellite, Rocket, Crosshair, ShieldAlert, Play, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

// --- 游戏核心参数配置 ---
const GRID_W = 12; // 总共 12 列 (索引 0-11)
const GRID_H = 5;  // 总共 5 条轨道 (索引 0-4)
const A_MIN_X = 5; // 蓝方最小边界 (对应第 6 列)
const A_MAX_X = 9; // 蓝方最大边界 (对应第 10 列) - 完美形成 5x5 的活动区
const WIN_TIME = 2;
const MAX_TURNS = 20;

type GameState = 'start' | 'playing' | 'gameover';
type Player = 'A' | 'B';

// --- 纯数学魔法：计算弯曲网格的坐标 ---
// 制造出一个类似于“议会”或者“雷达扇面”的弯曲效果
const getCurvedPos = (x: number, y: number) => {
  const dx = x - 5.5; // 以网格中心 (5.5) 为对称轴
  // 计算抛物线偏移量 (dx的平方)，形成两边低、中间高的彩虹弧线
  const curveY = Math.pow(dx, 2) * 1.5; 
  // 根据位置计算倾斜角度，让格子顺着弧线旋转
  const rotate = dx * 2.5; 
  
  return {
    x: x * 52 + 70,       // 70px 左侧边距预留给轨道标签
    y: y * 52 + curveY + 50, // 50px 顶部边距预留给列数标签
    rotate
  };
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('A');
  
  // A(蓝方) 出生在 5x5 区域的中心 (第8列，第3轨道)
  const [aPos, setAPos] = useState({ x: 7, y: 2 });
  // B(红方) 出生在左侧 (第2列，第3轨道)
  const [bPos, setBPos] = useState({ x: 1, y: 2 });
  
  const [pendingAMove, setPendingAMove] = useState<{x: number, y: number} | null>(null);
  const [turn, setTurn] = useState(1);
  const [bTimeInRange, setBTimeInRange] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);

  const handlePlayerMove = (selectedY: number) => {
      if (gameState !== 'playing') return;
      
      if (currentPlayer === 'A') {
          const nextA = { x: aPos.x + (selectedY - 2), y: selectedY };
          setPendingAMove(nextA);
          setCurrentPlayer('B');
      } else {
          const nextB = { x: bPos.x + (selectedY - 2), y: selectedY };
          const finalA = pendingAMove || aPos;
          
          setAPos(finalA);
          setBPos(nextB);
          
          const dist = Math.max(Math.abs(finalA.x - nextB.x), Math.abs(finalA.y - nextB.y));
          const newTimeInRange = dist <= 1 ? bTimeInRange + 1 : 0;
          
          setBTimeInRange(newTimeInRange);
          
          if (newTimeInRange >= WIN_TIME) {
              setGameState('gameover');
              setWinner('B');
          } else if (turn >= MAX_TURNS) {
              setGameState('gameover');
              setWinner('A');
          } else {
              setTurn(turn + 1);
              setCurrentPlayer('A');
              setPendingAMove(null);
          }
      }
  };

  const startGame = () => {
    setAPos({ x: 7, y: 2 });
    setBPos({ x: 1, y: 2 });
    setTurn(1);
    setBTimeInRange(0);
    setWinner(null);
    setCurrentPlayer('A');
    setPendingAMove(null);
    setGameState('playing');
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-10 rounded-3xl max-w-lg text-center shadow-[0_0_50px_rgba(30,58,138,0.3)] relative overflow-hidden"
        >
          {/* 地球微光背景 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[200px] bg-blue-500/20 blur-[60px] rounded-[100%] pointer-events-none"></div>
          
          <div className="flex justify-center gap-6 mb-6 relative z-10">
            <Satellite size={48} className="text-blue-400" />
            <Rocket size={48} className="text-red-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-lg relative z-10">Orbital Pursuit</h1>
          <div className="inline-block bg-slate-800/80 text-slate-300 px-4 py-1 rounded-full text-sm font-mono mb-6 border border-slate-700 relative z-10">
            Simultaneous Hotseat Mode
          </div>
          <div className="text-slate-400 mb-8 text-left space-y-3 text-sm leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800 relative z-10">
            <p><strong>RULES:</strong></p>
            <p>1. <strong>Double-Blind System:</strong> Both players plan moves secretly. Actions execute simultaneously.</p>
            <p>2. <strong className="text-blue-400">Evader (Blue):</strong> Restricted to the central 5x5 zone (Cols 6-10). Survive 20 turns.</p>
            <p>3. <strong className="text-red-400">Pursuer (Red):</strong> Has full access to all 12 columns. Keep Evader in your 3x3 target lock for 2 turns.</p>
          </div>
          <button 
            onClick={startGame}
            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] active:scale-95 text-lg relative z-10"
          >
            <Play size={20} fill="currentColor" /> INITIATE PURSUIT
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black text-slate-200 font-sans flex flex-col items-center py-8 px-4 overflow-hidden">
      <div className="max-w-5xl w-full flex flex-col items-center">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Orbital Pursuit</h1>
        </header>

        {/* Status Dashboard */}
        <div className="flex gap-8 mb-6 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/60 shadow-xl z-20">
          <div className="flex flex-col items-center px-4">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Turn</span>
            <span className="text-3xl font-mono text-white">{turn} <span className="text-slate-600 text-lg">/ {MAX_TURNS}</span></span>
          </div>
          <div className="w-px bg-slate-800"></div>
          <div className="flex flex-col items-center px-4">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Target Lock</span>
            <div className="flex gap-2 mt-1">
              <div className={`w-10 h-3 rounded-full transition-colors duration-300 ${bTimeInRange >= 1 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />
              <div className={`w-10 h-3 rounded-full transition-colors duration-300 ${bTimeInRange >= 2 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />
            </div>
          </div>
        </div>

        {/* --- 游戏战术面板 (弯曲的网格) --- */}
        <div className="relative w-[760px] h-[460px] bg-slate-900/30 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden shrink-0">
          
          {/* 地球底部光晕装饰 */}
          <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-blue-900/10 to-transparent blur-2xl rounded-t-[100%] pointer-events-none z-0" />

          {/* 渲染列数标签 (1 to 12) - 同样沿着弧线排布 */}
          {Array.from({ length: GRID_W }).map((_, x) => {
            const pos = getCurvedPos(x, -0.8);
            return (
              <div 
                key={`col-${x}`}
                className="absolute w-12 text-center text-slate-500 font-mono text-sm font-bold z-10"
                style={{ left: pos.x, top: pos.y, transform: `rotate(${pos.rotate}deg)` }}
              >
                {x + 1}
              </div>
            );
          })}

          {/* 渲染轨道标签 (Orb 1 to 5) */}
          {Array.from({ length: GRID_H }).map((_, y) => {
            const pos = getCurvedPos(-1, y);
            return (
              <div 
                key={`row-${y}`}
                className="absolute text-slate-400 font-mono text-xs whitespace-nowrap z-10"
                style={{ left: pos.x - 10, top: pos.y + 16, transform: `rotate(${pos.rotate}deg)` }}
              >
                Orb {y + 1}
              </div>
            );
          })}

          {/* 渲染弯曲的网格系统 */}
          {Array.from({ length: GRID_H }).map((_, y) => (
            Array.from({ length: GRID_W }).map((_, x) => {
              const pos = getCurvedPos(x, y);
              const isAArea = x >= A_MIN_X && x <= A_MAX_X;
              // 判断当前格子是否处于追击者(B)的 3x3 锁定范围内
              const isTargetLock = Math.max(Math.abs(x - bPos.x), Math.abs(y - bPos.y)) <= 1;

              return (
                <div 
                  key={`cell-${x}-${y}`} 
                  className={`absolute w-11 h-11 rounded-lg transition-colors duration-500 backdrop-blur-sm z-10
                    ${isAArea ? 'bg-blue-500/10 border border-blue-400/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)]' : 'bg-slate-800/20 border border-slate-700/40'}
                  `} 
                  style={{ left: pos.x, top: pos.y, transform: `rotate(${pos.rotate}deg)` }}
                >
                  {/* 红方 3x3 锁定区域的高亮框（完美贴合弯曲网格） */}
                  {isTargetLock && gameState !== 'gameover' && (
                    <div className="absolute inset-[-2px] border-2 border-red-500/50 bg-red-500/10 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] pointer-events-none" />
                  )}
                </div>
              );
            })
          ))}
          
          {/* Satellite A (Evader 蓝方卫星) */}
          <motion.div
            className="absolute w-11 h-11 flex items-center justify-center text-blue-400 z-30 drop-shadow-[0_0_10px_rgba(96,165,250,1)]"
            initial={false}
            animate={{ 
              left: getCurvedPos(aPos.x, aPos.y).x, 
              top: getCurvedPos(aPos.x, aPos.y).y,
              rotate: getCurvedPos(aPos.x, aPos.y).rotate
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 14 }}
          >
            <Satellite size={26} strokeWidth={1.5} />
          </motion.div>
          
          {/* Satellite B (Pursuer 红方追击者) */}
          <motion.div
            className="absolute w-11 h-11 flex items-center justify-center text-red-400 z-40 drop-shadow-[0_0_10px_rgba(248,113,113,1)]"
            initial={false}
            animate={{ 
              left: getCurvedPos(bPos.x, bPos.y).x, 
              top: getCurvedPos(bPos.x, bPos.y).y,
              rotate: getCurvedPos(bPos.x, bPos.y).rotate
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 14 }}
          >
            <Rocket size={26} strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Controls Panel */}
        {gameState === 'playing' ? (
          <div className={`mt-8 flex flex-col items-center gap-4 p-6 rounded-2xl border w-full max-w-2xl transition-colors duration-500 backdrop-blur-xl shadow-2xl relative z-20 ${
            currentPlayer === 'A' ? 'bg-blue-950/60 border-blue-900/50' : 'bg-red-950/60 border-red-900/50'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {currentPlayer === 'A' ? (
                <>
                  <Satellite size={24} className="text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    Evader (Blue) - Plan Move 
                    <span className="text-sm font-normal text-blue-300/60 ml-2 border border-blue-800/50 bg-blue-950 px-2 py-0.5 rounded-full flex items-center gap-1"><EyeOff size={14}/> Red, look away!</span>
                  </h3>
                </>
              ) : (
                <>
                  <Rocket size={24} className="text-red-400" />
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    Pursuer (Red) - Plan Move
                    <span className="text-sm font-normal text-red-300/60 ml-2 border border-red-800/50 bg-red-950 px-2 py-0.5 rounded-full flex items-center gap-1"><EyeOff size={14}/> Blue's move is locked</span>
                  </h3>
                </>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {[0, 1, 2, 3, 4].map(y => {
                const dx = y - 2;
                let isValid = false;
                // --- 严格的越界验证逻辑 ---
                if (currentPlayer === 'A') {
                  const nextX = aPos.x + dx;
                  // 蓝方不能离开 5-9 的索引区域 (第6-10列)
                  isValid = nextX >= A_MIN_X && nextX <= A_MAX_X;
                } else {
                  const nextX = bPos.x + dx;
                  // 红方可以活动在 0-11 的索引区域 (第1-12列)
                  isValid = nextX >= 0 && nextX < GRID_W;
                }
                
                return (
                  <button
                    key={y}
                    disabled={!isValid}
                    onClick={() => handlePlayerMove(y)}
                    className={`relative px-5 py-3 rounded-xl font-mono text-sm transition-all duration-200 overflow-hidden group border ${
                      isValid
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600/80 shadow-lg hover:-translate-y-0.5' 
                        : 'bg-slate-900/50 text-slate-600 border-slate-800/50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <span className="font-bold">Orb {y + 1}</span>
                      <span className={`text-xs px-2 py-0.5 rounded bg-slate-950/50 ${
                        isValid ? (currentPlayer === 'A' ? 'text-blue-300' : 'text-red-300') : 'text-slate-500'
                      }`}>
                        {dx < 0 ? `← ${Math.abs(dx)}` : dx > 0 ? `→ ${dx}` : 'Stay'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl text-center max-w-md w-full shadow-2xl relative overflow-hidden z-20"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${winner === 'B' ? 'bg-red-500' : 'bg-blue-500'}`} />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-blue-600/10 blur-3xl -z-10 translate-y-1/2"></div>
            <div className="flex justify-center mb-4">
              {winner === 'B' ? <Crosshair size={48} className="text-red-400" /> : <ShieldAlert size={48} className="text-blue-400" />}
            </div>
            <h2 className={`text-3xl font-bold mb-3 drop-shadow-lg ${winner === 'B' ? 'text-red-400' : 'text-blue-400'}`}>
              {winner === 'B' ? 'TARGET LOCKED (Red Wins)' : 'EVADER ESCAPED (Blue Wins)'}
            </h2>
            <button 
              onClick={() => setGameState('start')}
              className="mt-6 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Back to Menu
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}