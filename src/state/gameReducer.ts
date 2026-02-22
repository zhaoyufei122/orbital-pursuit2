import type { GameState } from './types';
import type { GameAction } from './actions';
import { SCENARIO_CLASSIC } from '../config/scenarios';
import { chebyshevDist } from '../utils';
import { isValidMove, calcNextPos, checkWinCondition } from '../game/rules';
import type { Player, Pos } from '../types';

export const initialState: GameState = {
  mode: null,
  humanRole: null,
  matchPhase: 'playing',
  turn: 1,
  winner: null,
  scenario: SCENARIO_CLASSIC, // 默认为经典模式，防止 null 导致渲染错误
  aPos: SCENARIO_CLASSIC.initialAPos,
  bPos: SCENARIO_CLASSIC.initialBPos,
  currentPlayer: 'A',
  pendingAMove: null,
  bTimeInRange: 0,
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
      };
    }

    case 'RESET_GAME': {
      // 保持当前场景配置
      const currentScenario = state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario: currentScenario,
        aPos: currentScenario.initialAPos,
        bPos: currentScenario.initialBPos,
        mode: state.mode,
        humanRole: state.humanRole,
      };
    }

    case 'PLAYER_MOVE': {
      const { selectedY } = action.payload;
      const { currentPlayer, aPos, bPos, pendingAMove, turn, bTimeInRange, scenario } = state;

      if (!scenario) return state; // Should not happen

      // 1. 蓝方移动逻辑
      if (currentPlayer === 'A') {
        if (!isValidMove('A', aPos.x, selectedY, scenario)) return state;
        const nextA = calcNextPos(aPos, selectedY, scenario);
        return {
          ...state,
          pendingAMove: nextA,
          currentPlayer: 'B',
        };
      }

      // 2. 红方移动逻辑
      if (currentPlayer === 'B') {
        if (!isValidMove('B', bPos.x, selectedY, scenario)) return state;
        
        const nextB = calcNextPos(bPos, selectedY, scenario);
        const finalA = pendingAMove || aPos; // 理论上 pendingAMove 必存在
        
        // 3. 结算回合
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
        };
      }

      return state;
    }

    default:
      return state;
  }
}
