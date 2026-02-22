import type { Pos } from '../types';
import type { GameScenario } from '../config/scenarios';

/**
 * Calculate the physical Euclidean distance between two positions in kilometers.
 * Handles non-uniform grid scales (kmPerCellX vs kmPerCellY).
 */
export const getPhysicalDistance = (p1: Pos, p2: Pos, scenario: GameScenario): number => {
  const dx = Math.abs(p1.x - p2.x) * (scenario.kmPerCellX || 35);
  const dy = Math.abs(p1.y - p2.y) * (scenario.kmPerCellY || 15);
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if the physical distance between two points is within a specified range.
 * Optional epsilon for floating point tolerance (default 0).
 */
export const isPointInRange = (
  p1: Pos, 
  p2: Pos, 
  rangeKm: number, 
  scenario: GameScenario,
  epsilon: number = 0
): boolean => {
  const dist = getPhysicalDistance(p1, p2, scenario);
  return dist <= rangeKm + epsilon;
};
