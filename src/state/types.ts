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

  // 资源与侦察
  resources: Record<Player, Resources>;
  // 废弃旧的 scanResult，改为每个玩家独立的侦察记录
  // scanResult: {
  //   turn: number;
  //   detectedColumn: number | null;
  //   detectedPos: Pos | null;
  // } | null;
  
  // 新增：每个玩家最后一次的侦察结果
  lastScan: Record<Player, {
    turn: number;
    scanType: 'SHORT' | 'LONG';
    detectedColumn: number | null;
    detectedPos: Pos | null;
    scannedArea?: { center: Pos; radius: number }; // 记录长观测的区域 (圆形)
  } | null>;
  
  // 新增：当前回合当前玩家是否已执行侦察
  hasPerformedScan: boolean;
}

export const INITIAL_RESOURCES: Resources = {
  fuel: 100,
  scanPoints: 5,
};
