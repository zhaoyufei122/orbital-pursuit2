import type { Pos } from '../types';

export interface GameScenario {
  id: string;
  name: string;
  description: string;
  gridW: number;
  gridH: number;
  initialAPos: Pos;
  initialBPos: Pos;
  fogOfWar: boolean;

  // 游戏规则参数 (Movement & Win Condition)
  aMinX: number;
  aMaxX: number;
  winTime: number;
  maxTurns: number;
  
  // 物理参数
  kmPerCellX: number; // 每个X格对应的公里数 (约35km)
  kmPerCellY: number; // 每个Y格对应的公里数 (15km)

  // 判定阈值 (单位: km)
  ranges: {
    identification: number; // 胜利判定半径 (50km)
    visual: number;         // 目视导引半径 (100km)
    longScan: number;       // 长观测半径 (0.25度 -> 175km)
  };
}

export const SCENARIO_CLASSIC: GameScenario = {
  id: 'classic',
  name: '经典模式 (Standard)',
  description: '小规模对抗，无战争迷雾。',
  gridW: 11,
  gridH: 7,
  initialAPos: { x: 5, y: 3 },
  initialBPos: { x: 1, y: 3 },
  fogOfWar: false,

  aMinX: 2,
  aMaxX: 8,
  winTime: 2,
  maxTurns: 15,
  
  kmPerCellX: 35, // 仅做参考，经典模式逻辑可能简化
  kmPerCellY: 35, // 经典模式假定正方形网格

  ranges: {
    identification: 50, // 约1.5格
    visual: 100,        // 约3格
    longScan: 175,      // 约5格
  },
};

export const SCENARIO_REALISTIC: GameScenario = {
  id: 'realistic',
  name: '拟真模式 (Realistic)',
  description: '大型地图 (21x11)，包含战争迷雾与物理距离判定。',
  gridW: 21,
  gridH: 11,
  initialAPos: { x: 10, y: 5 },
  initialBPos: { x: 2, y: 5 },
  fogOfWar: true,
  
  aMinX: 5,
  aMaxX: 14,
  winTime: 2,
  maxTurns: 20,

  // 物理参数: 0.05度经度差 ≈ 35km (GEO), 高度差 15km
  kmPerCellX: 35,
  kmPerCellY: 15,

  ranges: {
    identification: 50, // 胜利判定半径
    visual: 100,        // 目视导引半径
    longScan: 175,      // 0.25度 ≈ 175km (直径0.5度)
  },
};

export const SCENARIOS = [SCENARIO_CLASSIC, SCENARIO_REALISTIC];
