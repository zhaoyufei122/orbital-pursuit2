import type { Player, Mode } from '../types';
import type { GameScenario } from '../config/scenarios';

export type GameAction =
  | { type: 'START_HOTSEAT'; payload?: { scenario?: GameScenario } }
  | { type: 'START_AI_MATCH'; payload: { role: Player; scenario?: GameScenario } }
  | { type: 'PLAYER_MOVE'; payload: { selectedY: number } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_SCENARIO'; payload: { scenario: GameScenario } };
