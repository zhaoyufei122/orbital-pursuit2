import type { Pos } from './types';

// --- 游戏核心参数配置 ---
export const GRID_W = 21; // 总共 21 列 (索引 0-20)
export const GRID_H = 11; // 总共 11 条轨道 (索引 0-10)

// 蓝方活动区域：中间 10 列区域 (21列 -> 5~14)
export const A_MIN_X = 5; 
export const A_MAX_X = 14; 

export const WIN_TIME = 2;
export const MAX_TURNS = 20;

// 调整初始位置到新地图的合理位置
export const INITIAL_A_POS: Pos = { x: 10, y: 5 }; // 蓝方居中
export const INITIAL_B_POS: Pos = { x: 2, y: 5 };  // 红方在左侧

export const RULES_TEXT = [
  'Double-Blind Turns: Blue plans first, then Red plans, moves resolve simultaneously.',
  'Blue (Evader) is constrained to the central region (Columns 6-15).',
  'Red (Pursuer) moves freely across the map and has a 3x3 Lock Zone.',
  `Red wins by keeping Blue in the Lock Zone for ${WIN_TIME} consecutive turns.`,
  `Blue wins by surviving until Turn ${MAX_TURNS}.`,
];

export const BACKGROUND_TEXT = [
  'Inspired by the Orbital Pursuit/Evasion problem: A pursuer satellite attempts to lock onto a target, while the target maneuvers to evade.',
  'Discrete orbits and lateral drift (Left 2/Left 1/Stay/Right 1/Right 2) simulate orbital mechanics.',
  'The 3x3 Lock Zone represents a sensor/weapon/capture window. Blue aims to survive under constrained conditions.',
  'This model is ideal for Game Theory, Reinforcement Learning, and Risk-Aware Control experiments.',
];
