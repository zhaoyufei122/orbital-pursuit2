import { useReducer, useEffect, useCallback } from 'react';
import type { Player, MatchPhase, Mode, Pos } from '../types';
import { gameReducer, initialState } from '../state/gameReducer';
import { isValidMove as checkValidMove, getValidOrbs as getAllValidOrbs } from '../game/rules';
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
  handleLongScan: (targetRect: { minX: number; maxX: number; minY: number; maxY: number }) => void;
  resources: Record<Player, Resources>;
  lastScan: Record<Player, { turn: number; detectedColumn: number | null; detectedPos: Pos | null } | null>;
  hasPerformedScan: boolean;
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
  } = state;

  const isAIMode = mode === 'ai';

  // 保持 isValidMove 作为一个纯查询函数暴露给 UI
  const isValidMove = useCallback((player: Player, fromX: number, selectedY: number) => {
    if (!scenario) return false;
    return checkValidMove(player, fromX, selectedY, scenario);
  }, [scenario]);

  const getValidOrbs = useCallback(
    (player: Player, fromX: number) => {
      if (!scenario) return [];
      return getAllValidOrbs(player, fromX, scenario);
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

  const handleLongScan = useCallback((targetRect: { minX: number; maxX: number; minY: number; maxY: number }) => {
    dispatch({ type: 'SCAN_LONG', payload: { targetRect } });
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
    startHotseat,
    startAIMatch,
    handlePlayerMove,
    handleShortScan,
    handleLongScan,
    resources,
    lastScan,
    hasPerformedScan,
  };
};
