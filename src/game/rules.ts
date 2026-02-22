import { moveDxFromOrb } from '../utils';
import type { Player, Pos, MatchPhase, TimeOfDay, Weather } from '../types';
import type { GameScenario } from '../config/scenarios';
import { isPointInRange } from './physics';

/**
 * 计算从当前位置移动到目标轨道后的新位置
 */
export const calcNextPos = (from: Pos, selectedY: number, scenario: GameScenario): Pos => ({
  x: from.x + moveDxFromOrb(selectedY, scenario.gridH),
  y: selectedY,
});

// 获取当前回合的时间段
// Turn 1 (0-6h): Midnight (3:00) -> NIGHT
// Turn 2 (6-12h): Morning (9:00) -> DAWN (晨) / DAY
// Turn 3 (12-18h): Noon (15:00) -> DAY
// Turn 4 (18-24h): Evening (21:00) -> DUSK (昏) / NIGHT
// 映射：1=NIGHT, 2=DAWN, 3=DAY, 4=DUSK
export const getTimeOfDay = (turn: number): TimeOfDay => {
  const cycle = (turn - 1) % 4; // 0, 1, 2, 3
  switch (cycle) {
    case 0: return 'NIGHT';
    case 1: return 'DAWN';
    case 2: return 'DAY';
    case 3: return 'DUSK';
    default: return 'NIGHT';
  }
};

// 检查地基观测是否允许
// 规则：
// - DAY: 无法观测
// - DAWN/DUSK: 仅短观测 (假设光照条件只适合巡天)
// - NIGHT: 全功能 (长/短观测均可)
// - 天气: CLOUDY 时无法进行任何地基观测 (或者大幅降低成功率，这里简化为无法观测)
export const isGroundObservationAllowed = (
  turn: number, 
  weather: Weather, 
  scanType: 'SHORT' | 'LONG',
  scenario: GameScenario
): { allowed: boolean; reason?: string } => {
  if (!scenario.weatherEnabled) return { allowed: true };

  // 1. 天气检查
  if (weather === 'CLOUDY') {
    return { allowed: false, reason: 'Cloudy weather, ground observation obstructed' };
  }

  // 2. 时间检查
  const time = getTimeOfDay(turn);
  
  if (time === 'DAY') {
    return { allowed: false, reason: 'Daylight glare, imaging impossible' };
  }

  if ((time === 'DAWN' || time === 'DUSK') && scanType === 'LONG') {
    return { allowed: false, reason: 'Short scan only during Dawn/Dusk' };
  }

  return { allowed: true };
};

// 检查是否满足胜利条件（距离判定）
// 移除盲区判定：GEO卫星绝大多数时间在阳光下，且观测时长足够
export const isWithinCaptureRange = (p1: Pos, p2: Pos, scenario: GameScenario): boolean => {
  return isPointInRange(p1, p2, scenario.ranges.identification, scenario);
};

// 检查是否满足目视条件
// 移除盲区判定
export const isWithinVisualRange = (p1: Pos, p2: Pos, scenario: GameScenario): boolean => {
  return isPointInRange(p1, p2, scenario.ranges.visual, scenario);
};

// 检查长观测是否覆盖目标
export const isLongScanCovered = (scanCenter: Pos, target: Pos, scenario: GameScenario): boolean => {
  // 增加 1km 的容差，避免浮点数精度问题导致“明明在圈边却没扫到”
  return isPointInRange(scanCenter, target, scenario.ranges.longScan || 175, scenario, 1);
};

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
