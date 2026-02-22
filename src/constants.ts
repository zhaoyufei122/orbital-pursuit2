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
  '双盲行动：蓝方先秘密规划，红方再规划，随后双方同时结算。',
  '蓝方（Evader）只能在中间 10 列区域（第6~15列）活动。',
  '红方（Pursuer）可在全图活动，并拥有 3x3 锁定区。',
  `红方若连续 ${WIN_TIME} 回合将蓝方纳入锁定区，则红方获胜。`,
  `蓝方若成功存活至第 ${MAX_TURNS} 回合，则蓝方获胜。`,
];

export const BACKGROUND_TEXT = [
  '本游戏抽象自“卫星追逃（Orbital Pursuit/Evasion）”问题：追击卫星尝试锁定目标卫星，而目标卫星通过机动规避追踪。',
  '这里用离散轨道（Orb 1~11）和横向漂移（左2/左1/不动/右1/右2）来模拟轨道机动决策。',
  '红方的 3x3 锁定区代表传感器/武器/捕获窗口；蓝方目标是利用机动与区域限制，在不利条件下坚持生存。',
  '该模型很适合扩展为博弈论、强化学习、风险感知控制或策略搜索实验平台。',
];
