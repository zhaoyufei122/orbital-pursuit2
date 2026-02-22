import type { GameState } from './types';
import type { GameAction } from './actions';
import { SCENARIO_CLASSIC } from '../config/scenarios';
import { chebyshevDist } from '../utils';
import { isValidMove, calcNextPos, checkWinCondition } from '../game/rules';
import { INITIAL_RESOURCES } from './types';
import type { Player, Pos } from '../types';

export const initialState: GameState = {
  mode: null,
  humanRole: null,
  matchPhase: 'playing',
  turn: 1,
  winner: null,
  scenario: SCENARIO_CLASSIC,
  aPos: SCENARIO_CLASSIC.initialAPos,
  bPos: SCENARIO_CLASSIC.initialBPos,
  currentPlayer: 'A',
  pendingAMove: null,
  bTimeInRange: 0,
  resources: {
    A: { ...INITIAL_RESOURCES },
    B: { ...INITIAL_RESOURCES },
  },
  lastScan: { A: null, B: null },
  hasPerformedScan: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_HOTSEAT': {
      const scenario = action.payload?.scenario || state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario,
        aPos: scenario.initialAPos,
        bPos: scenario.initialBPos,
        mode: 'hotseat',
        matchPhase: 'playing',
        resources: {
          A: { ...INITIAL_RESOURCES },
          B: { ...INITIAL_RESOURCES },
        },
        lastScan: { A: null, B: null },
        hasPerformedScan: false,
      };
    }

    case 'START_AI_MATCH': {
      const scenario = action.payload?.scenario || state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario,
        aPos: scenario.initialAPos,
        bPos: scenario.initialBPos,
        mode: 'ai',
        humanRole: action.payload.role,
        matchPhase: 'playing',
        resources: {
          A: { ...INITIAL_RESOURCES },
          B: { ...INITIAL_RESOURCES },
        },
        lastScan: { A: null, B: null },
        hasPerformedScan: false,
      };
    }

    case 'RESET_GAME': {
      const currentScenario = state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario: currentScenario,
        aPos: currentScenario.initialAPos,
        bPos: currentScenario.initialBPos,
        mode: state.mode,
        humanRole: state.humanRole,
        resources: {
          A: { ...INITIAL_RESOURCES },
          B: { ...INITIAL_RESOURCES },
        },
        lastScan: { A: null, B: null },
        hasPerformedScan: false,
      };
    }

    case 'SCAN_SHORT': {
      const { currentPlayer, scenario, aPos, bPos, hasPerformedScan } = state;
      if (!scenario) return state;
      if (hasPerformedScan) return state; // 本回合已观测过

      // 确定对手
      const opponent = currentPlayer === 'A' ? 'B' : 'A';
      const opponentPos = opponent === 'A' ? aPos : bPos;

      const result = {
        turn: state.turn,
        detectedColumn: opponentPos.x,
        detectedPos: null,
      };

      return {
        ...state,
        hasPerformedScan: true,
        lastScan: {
          ...state.lastScan,
          [currentPlayer]: result,
        },
      };
    }

    case 'SCAN_LONG': {
      const { currentPlayer, scenario, aPos, bPos, hasPerformedScan } = state;
      if (!scenario) return state;
      if (hasPerformedScan) return state; // 本回合已观测过

      const { targetRect } = action.payload;

      const opponent = currentPlayer === 'A' ? 'B' : 'A';
      const opponentPos = opponent === 'A' ? aPos : bPos;

      // 检查是否在区域内
      const inRect = 
        opponentPos.x >= targetRect.minX && 
        opponentPos.x <= targetRect.maxX &&
        opponentPos.y >= targetRect.minY && 
        opponentPos.y <= targetRect.maxY;

      const result = {
        turn: state.turn,
        detectedColumn: null,
        detectedPos: inRect ? opponentPos : null,
      };

      return {
        ...state,
        hasPerformedScan: true,
        lastScan: {
          ...state.lastScan,
          [currentPlayer]: result,
        },
      };
    }

    case 'PLAYER_MOVE': {
      const { selectedY } = action.payload;
      const { currentPlayer, aPos, bPos, pendingAMove, turn, bTimeInRange, scenario } = state;

      if (!scenario) return state;

      // 1. 蓝方移动逻辑
      if (currentPlayer === 'A') {
        if (!isValidMove('A', aPos.x, selectedY, scenario)) return state;
        const nextA = calcNextPos(aPos, selectedY, scenario);
        return {
          ...state,
          pendingAMove: nextA,
          currentPlayer: 'B',
          hasPerformedScan: false, // 重置回合内观测标记
        };
      }

      // 2. 红方移动逻辑
      if (currentPlayer === 'B') {
        if (!isValidMove('B', bPos.x, selectedY, scenario)) return state;
        
        const nextB = calcNextPos(bPos, selectedY, scenario);
        const finalA = pendingAMove || aPos;
        
        const dist = chebyshevDist(finalA, nextB);
        const newTimeInRange = dist <= 1 ? bTimeInRange + 1 : 0;
        
        const { nextPhase, nextWinner } = checkWinCondition(newTimeInRange, turn + 1, scenario);

        return {
          ...state,
          aPos: finalA,
          bPos: nextB,
          turn: state.turn + 1,
          bTimeInRange: newTimeInRange,
          matchPhase: nextPhase,
          winner: nextWinner,
          currentPlayer: 'A',
          pendingAMove: null,
          hasPerformedScan: false, // 重置回合内观测标记
        };
      }

      return state;
    }

    default:
      return state;
  }
}
