import type { Player, MatchPhase, Mode, Pos } from '../types';
import type { GameScenario } from '../config/scenarios';

export interface Resources {
  fuel: number;
  scanPoints: number;
}

export interface PlayerState {
  pos: Pos;
  resources: Resources;
}

export interface GameState {
  // 基础状态
  mode: Mode | null;
  humanRole: Player | null;
  matchPhase: MatchPhase;
  turn: number;
  winner: Player | null;

  // 场景配置
  scenario: GameScenario | null;

  // 玩家状态
  aPos: Pos; // 暂时保持扁平结构以兼容现有逻辑，后续可迁移到 players 对象
  bPos: Pos;
  
  // 游戏逻辑状态
  currentPlayer: Player;
  pendingAMove: Pos | null;
  bTimeInRange: number;
}

export const INITIAL_RESOURCES: Resources = {
  fuel: 100,
  scanPoints: 5,
};
