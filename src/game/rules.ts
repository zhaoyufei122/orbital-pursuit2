import { moveDxFromOrb } from '../utils';
import type { Player, Pos, MatchPhase } from '../types';
import type { GameScenario } from '../config/scenarios';

/**
 * 计算从当前位置移动到目标轨道后的新位置
 */
export const calcNextPos = (from: Pos, selectedY: number, scenario: GameScenario): Pos => ({
  x: from.x + moveDxFromOrb(selectedY, scenario.gridH),
  y: selectedY,
});

/**
 * 验证玩家移动是否合法
 */
export const isValidMove = (player: Player, fromX: number, selectedY: number, scenario: GameScenario): boolean => {
  // 1. 轨道范围检查
  if (selectedY < 0 || selectedY >= scenario.gridH) return false;

  // 2. 计算目标 X 坐标
  const dx = moveDxFromOrb(selectedY, scenario.gridH);
  const nextX = fromX + dx;

  // 3. 玩家特定限制
  if (player === 'A') {
    // 蓝方只能在特定区域内移动
    return nextX >= scenario.aMinX && nextX <= scenario.aMaxX;
  } else {
    // 红方只要在地图内即可
    return nextX >= 0 && nextX < scenario.gridW;
  }
};

/**
 * 获取指定玩家在当前位置所有合法的移动目标轨道
 */
export const getValidOrbs = (player: Player, fromX: number, scenario: GameScenario): number[] => {
  return Array.from({ length: scenario.gridH }, (_, i) => i).filter((y) => 
    isValidMove(player, fromX, y, scenario)
  );
};

/**
 * 检查游戏是否结束及胜利者
 */
export const checkWinCondition = (
  newTimeInRange: number,
  turn: number,
  scenario: GameScenario
): { nextPhase: MatchPhase; nextWinner: Player | null } => {
  if (newTimeInRange >= scenario.winTime) {
    return { nextPhase: 'gameover', nextWinner: 'B' };
  } else if (turn >= scenario.maxTurns) {
    return { nextPhase: 'gameover', nextWinner: 'A' };
  }
  return { nextPhase: 'playing', nextWinner: null };
};
