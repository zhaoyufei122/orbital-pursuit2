import type { Pos } from '../types';

export interface GameScenario {
  id: string;
  name: string;
  description: string;
  gridW: number;
  gridH: number;
  aMinX: number;
  aMaxX: number;
  winTime: number;
  maxTurns: number;
  initialAPos: Pos;
  initialBPos: Pos;
  fogOfWar: boolean;
  driftPerLayer: number; // 漂移率，仅用于描述或高级计算，目前主要影响逻辑
  observationCost: {
    short: number;
    long: number;
  };
}

export const SCENARIO_CLASSIC: GameScenario = {
  id: 'classic',
  name: '经典模式 (Standard)',
  description: '小规模对抗，无战争迷雾。',
  gridW: 11,
  gridH: 7,
  aMinX: 2,
  aMaxX: 8,
  winTime: 2,
  maxTurns: 15,
  initialAPos: { x: 5, y: 3 },
  initialBPos: { x: 1, y: 3 },
  fogOfWar: false,
  driftPerLayer: 0,
  observationCost: { short: 0, long: 0 },
};

export const SCENARIO_REALISTIC: GameScenario = {
  id: 'realistic',
  name: '拟真模式 (Realistic)',
  description: '大型地图 (21x11)，包含战争迷雾与侦察机制。',
  gridW: 21,
  gridH: 11,
  aMinX: 5,
  aMaxX: 14,
  winTime: 2,
  maxTurns: 20,
  initialAPos: { x: 10, y: 5 },
  initialBPos: { x: 2, y: 5 },
  fogOfWar: true,
  driftPerLayer: 0.05,
  observationCost: { short: 1, long: 2 },
};

export const SCENARIOS = [SCENARIO_CLASSIC, SCENARIO_REALISTIC];
