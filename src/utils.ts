import type { Pos } from './types';

// --- 纯数学魔法：计算水平矩形网格的坐标 ---
// 修改为矩形映射：线性映射 col -> x, row -> y
export const getCurvedPos = (x: number, y: number) => {
  // 定义单元格大小和边距
  const CELL_SIZE = 42; // 格子大小
  const OFFSET_X = 50;  // 左边距
  const OFFSET_Y = 50;  // 上边距

  return {
    x: x * CELL_SIZE + OFFSET_X,
    y: y * CELL_SIZE + OFFSET_Y,
    rotate: 0, // 矩形网格不旋转
  };
};

export const chebyshevDist = (p1: Pos, p2: Pos) =>
  Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));

// 计算中心轨道索引
export const moveDxFromOrb = (selectedY: number, gridH: number) => {
  const centerOrb = (gridH - 1) / 2;
  return selectedY - centerOrb;
};

// 预计算网格坐标（已移除，改为实时计算以支持多模式）
export const posOf = (x: number, y: number) => getCurvedPos(x, y);
