import { useReducer, useEffect, useCallback } from 'react';
import type { Player, MatchPhase, Mode, Pos, Weather } from '../types';
import { gameReducer, initialState } from '../state/gameReducer';
import { isValidMove as checkValidMove, getValidOrbs as getAllValidOrbs, calcNextPos } from '../game/rules';
import { assessGameState } from '../game/ai';

import type { GameScenario } from '../config/scenarios';

export interface GameEngine {
  mode: Mode | null;
  humanRole: Player | null;
  matchPhase: MatchPhase;
  currentPlayer: Player;
  aPos: Pos;
  bPos: Pos;
  turn: number;
  bTimeInRange: number;
  winner: Player | null;
  scenario: GameScenario | null;
  isHumanTurn: boolean;
  isValidMove: (player: Player, fromX: number, selectedY: number) => boolean;
  startHotseat: (scenario: GameScenario) => void;
  startAIMatch: (role: Player, scenario: GameScenario) => void;
  handlePlayerMove: (selectedY: number) => void;
  handleShortScan: () => void;
  handleLongScan: (center: { x: number; y: number }) => void;
  getValidMoves: (player: Player, fromX: number) => { x: number; y: number }[]; // Added
  resources: Record<Player, Resources>;
  lastScan: Record<Player, {
    turn: number;
    scanType?: 'SHORT' | 'LONG';
    detectedColumn: number | null;
    detectedPos: Pos | null;
    scannedArea?: { center: Pos; radius: number };
  } | null>;
  hasPerformedScan: boolean;
  weather: Weather;
}

export const useGameEngine = (): GameEngine => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

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
    pendingAMove,
    scenario,
    resources,
    // scanResult, // Removed
    lastScan,      // Added
    hasPerformedScan, // Added
    weather,       // Added
  } = state;

  const isAIMode = mode === 'ai';

  // 保持 isValidMove 作为一个纯查询函数暴露给 UI
  const isValidMove = useCallback((player: Player, fromX: number, selectedY: number) => {
    if (!scenario) return false;
    return checkValidMove(player, fromX, selectedY, scenario);
  }, [scenario]);

  const getValidMoves = useCallback(
    (player: Player, fromX: number) => {
      if (!scenario) return [];
      const orbs = getAllValidOrbs(player, fromX, scenario);
      return orbs.map(y => {
        // 使用 rules 中的逻辑计算具体坐标
        // 注意：这里需要重新计算 calcNextPos
        // 由于 calcNextPos 需要 Pos 对象作为输入，我们构造一个临时对象
        // 这有点笨拙，最好重构 rules 使其分离计算
        // 实际上 rules.ts 导出了 calcNextPos，直接用即可
        // 导入 calcNextPos
        return {
          y,
          // 需要临时构造一个 Pos，只有 x 相关
          // 实际上 calcNextPos 只需要 x，y 只是输入
          // let's import calcNextPos from rules
          ...calcNextPos({ x: fromX, y: 0 }, y, scenario)
        };
      });
    },
    [scenario]
  );

  const startHotseat = (scenario: GameScenario) => {
    dispatch({ type: 'START_HOTSEAT', payload: { scenario } });
  };

  const startAIMatch = (role: Player, scenario: GameScenario) => {
    dispatch({ type: 'START_AI_MATCH', payload: { role, scenario } });
  };

  const handlePlayerMove = (selectedY: number) => {
    dispatch({ type: 'PLAYER_MOVE', payload: { selectedY } });
  };

  const handleShortScan = useCallback(() => {
    dispatch({ type: 'SCAN_SHORT' });
  }, []);

  const handleLongScan = useCallback((center: { x: number; y: number }) => {
    dispatch({ type: 'SCAN_LONG', payload: { center } });
  }, []);

  // --- AI 自动行动 ---
  useEffect(() => {
    if (matchPhase !== 'playing') return;
    if (!isAIMode) return;
    if (!humanRole) return;

    const aiRole: Player = humanRole === 'A' ? 'B' : 'A';
    if (currentPlayer !== aiRole) return;

    const timer = window.setTimeout(() => {
      // 使用纯函数获取最佳移动
      const aiMove = assessGameState(state, aiRole);
      handlePlayerMove(aiMove);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    matchPhase,
    isAIMode,
    humanRole,
    currentPlayer,
    state, // 依赖整个 state 以进行决策
  ]);

  const isHumanTurn = (() => {
    if (matchPhase !== 'playing') return false;
    if (mode === 'hotseat') return true;
    if (mode === 'ai') return humanRole === currentPlayer;
    return false;
  })();

  return {
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
    getValidMoves, // Exposed
    startHotseat,
    startAIMatch,
    handlePlayerMove,
    handleShortScan,
    handleLongScan,
    resources,
    lastScan,
    hasPerformedScan,
    weather,
  };
};
