import React, { useState } from 'react';
import { Satellite, Rocket, Crosshair, ShieldAlert, Play, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const GRID_W = 10;
const GRID_H = 5;
const A_MIN_X = 5;
const A_MAX_X = 9;
const WIN_TIME = 2;
const MAX_TURNS = 20;

type GameState = 'start' | 'playing' | 'gameover';
type Player = 'A' | 'B';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('A'); // A (Evader) goes first
  
  const [aPos, setAPos] = useState({ x: 7, y: 2 });
  const [bPos, setBPos] = useState({ x: 0, y: 2 });
  
  // New state to hold A's secret move until B moves
  const [pendingAMove, setPendingAMove] = useState<{x: number, y: number} | null>(null);

  const [turn, setTurn] = useState(1);
  const [bTimeInRange, setBTimeInRange] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);

  // Handle Double-Blind Moves
  const handlePlayerMove = (selectedY: number) => {
      if (gameState !== 'playing') return;
      
      if (currentPlayer === 'A') {
          // A (Evader) moves: Store move secretly, do NOT update UI yet
          const nextA = { x: aPos.x + (selectedY - 2), y: selectedY };
          setPendingAMove(nextA);
          setCurrentPlayer('B'); // Pass turn to B
      } else {
          // B (Pursuer) moves: Resolve BOTH moves simultaneously
          const nextB = { x: bPos.x + (selectedY - 2), y: selectedY };
          const finalA = pendingAMove || aPos; // Retrieve A's secret move
          
          // Execute movements simultaneously
          setAPos(finalA);
          setBPos(nextB);
          
          // Calculate distance based on new positions
          const dist = Math.max(Math.abs(finalA.x - nextB.x), Math.abs(finalA.y - nextB.y));
          const newTimeInRange = dist <= 1 ? bTimeInRange + 1 : 0;
          
          setBTimeInRange(newTimeInRange);
          
          // Check Win/Loss conditions
          if (newTimeInRange >= WIN_TIME) {
              setGameState('gameover');
              setWinner('B');
          } else if (turn >= MAX_TURNS) {
              setGameState('gameover');
              setWinner('A');
          } else {
              setTurn(turn + 1);
              setCurrentPlayer('A'); // Back to A for the next turn
              setPendingAMove(null); // Clear secret move
          }
      }
  };

  const startGame = () => {
    setAPos({ x: 7, y: 2 });
    setBPos({ x: 0, y: 2 });
    setTurn(1);
    setBTimeInRange(0);
    setWinner(null);
    setCurrentPlayer('A');
    setPendingAMove(null);
    setGameState('playing');
  };

  // Start Screen Render
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-700 p-10 rounded-3xl max-w-lg text-center shadow-2xl"
        >
          <div className="flex justify-center gap-6 mb-6">
            <Satellite size={48} className="text-blue-400" />
            <Rocket size={48} className="text-red-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4">Orbital Pursuit</h1>
          <div className="inline-block bg-slate-800 text-slate-300 px-4 py-1 rounded-full text-sm font-mono mb-6 border border-slate-700">
            Simultaneous Hotseat Mode
          </div>
          <div className="text-slate-400 mb-8 text-left space-y-3 text-sm leading-relaxed">
            <p><strong>RULES:</strong></p>
            <p>1. <strong>Double-Blind System:</strong> Both players plan their moves secretly. Actions are executed simultaneously.</p>
            <p>2. <strong className="text-blue-400">Evader (Blue):</strong> Stay within the right-side sector. Survive for 20 turns to win.</p>
            <p>3. <strong className="text-red-400">Pursuer (Red):</strong> Predict Evader's moves. Keep them inside your 3x3 target lock area for 2 consecutive turns to win.</p>
          </div>
          <button 
            onClick={startGame}
            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 text-lg"
          >
            <Play size={20} fill="currentColor" /> START MATCH
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Orbital Pursuit</h1>
        </header>

        <div className="flex flex-col items-center">
          {/* Status Dashboard */}
          <div className="flex gap-8 mb-8 bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 shadow-xl">
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

          {/* Game Board */}
          <div className="flex flex-col select-none relative">
            <div className="flex mb-2">
              <div className="w-16"></div>
              <div className="flex gap-1 px-1 text-slate-500 font-mono text-xs">
                {Array.from({ length: GRID_W }).map((_, i) => (
                  <div key={i} className="w-12 flex justify-center">{i + 1}</div>
                ))}
              </div>
            </div>
            
            <div className="flex">
              <div className="flex flex-col gap-1 py-1 pr-2 w-16 text-slate-400 font-mono text-xs">
                {['Orb 1', 'Orb 2', 'Orb 3', 'Orb 4', 'Orb 5'].map((label, i) => (
                  <div key={i} className="h-12 flex items-center justify-end">{label}</div>
                ))}
              </div>
              
              <div className="relative grid grid-cols-10 gap-1 bg-slate-800 p-1 rounded-xl w-max overflow-hidden shadow-2xl border border-slate-700">
                {/* Grid Cells */}
                {Array.from({ length: GRID_H }).map((_, y) => (
                  Array.from({ length: GRID_W }).map((_, x) => {
                    const isAArea = x >= A_MIN_X && x <= A_MAX_X;
                    return (
                      <div 
                        key={`${x}-${y}`} 
                        className={`w-12 h-12 rounded-md ${isAArea ? 'bg-blue-950/30 border border-blue-900/30' : 'bg-slate-900 border border-slate-800/50'}`} 
                      />
                    );
                  })
                ))}
                
                {/* 3x3 Target Area around Pursuer */}
                <motion.div
                  className="absolute top-1 left-1 w-[152px] h-[152px] border-2 border-red-500/40 bg-red-500/10 rounded-lg z-0 pointer-events-none"
                  initial={false}
                  animate={{ 
                    x: (bPos.x - 1) * 52, 
                    y: (bPos.y - 1) * 52,
                    opacity: gameState === 'gameover' ? 0 : 1
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                />
                
                {/* Satellite A (Evader) */}
                <motion.div
                  className="absolute top-1 left-1 w-12 h-12 flex items-center justify-center text-blue-400 z-10 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                  initial={false}
                  animate={{ x: aPos.x * 52, y: aPos.y * 52 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                >
                  <Satellite size={28} />
                </motion.div>
                
                {/* Satellite B (Pursuer) */}
                <motion.div
                  className="absolute top-1 left-1 w-12 h-12 flex items-center justify-center text-red-400 z-20 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                  initial={false}
                  animate={{ x: bPos.x * 52, y: bPos.y * 52 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                >
                  <Rocket size={28} />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Controls - Hotseat Double-Blind Panel */}
          {gameState === 'playing' ? (
            <div className={`mt-10 flex flex-col items-center gap-4 p-6 rounded-2xl border w-full max-w-2xl transition-colors duration-500 ${
              currentPlayer === 'A' ? 'bg-blue-950/30 border-blue-900/50' : 'bg-red-950/30 border-red-900/50'
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
                  if (currentPlayer === 'A') {
                    const nextX = aPos.x + dx;
                    isValid = nextX >= A_MIN_X && nextX <= A_MAX_X;
                  } else {
                    const nextX = bPos.x + dx;
                    isValid = nextX >= 0 && nextX < GRID_W;
                  }
                  
                  return (
                    <button
                      key={y}
                      disabled={!isValid}
                      onClick={() => handlePlayerMove(y)}
                      className={`relative px-5 py-3 rounded-xl font-mono text-sm transition-all duration-200 overflow-hidden group ${
                        isValid
                          ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-slate-500 shadow-lg hover:-translate-y-0.5' 
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <span className="font-bold">Orbit {y + 1}</span>
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
              className="mt-10 p-8 bg-slate-900 border border-slate-700 rounded-2xl text-center max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${winner === 'B' ? 'bg-red-500' : 'bg-blue-500'}`} />
              <div className="flex justify-center mb-4">
                {winner === 'B' ? <Crosshair size={48} className="text-red-400" /> : <ShieldAlert size={48} className="text-blue-400" />}
              </div>
              <h2 className={`text-3xl font-bold mb-3 ${winner === 'B' ? 'text-red-400' : 'text-blue-400'}`}>
                {winner === 'B' ? 'TARGET LOCKED (Red Wins)' : 'EVADER ESCAPED (Blue Wins)'}
              </h2>
              <button 
                onClick={() => setGameState('start')}
                className="mt-6 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Back to Menu
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}