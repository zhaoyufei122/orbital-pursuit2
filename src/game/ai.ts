import { chebyshevDist } from '../utils';
import { getValidOrbs, calcNextPos } from './rules';
import type { GameState } from '../state/types';
import type { Player } from '../types';

/**
 * 评估当前游戏状态并返回最佳移动指令 (轨道索引)
 * 这是一个纯函数，不依赖于组件状态
 */
export const assessGameState = (state: GameState, player: Player): number => {
  const { aPos, bPos, bTimeInRange, pendingAMove, scenario } = state;

  if (!scenario) return 0; // 应该不会发生

  const validMoves = getValidOrbs(player, player === 'A' ? aPos.x : bPos.x, scenario);

  const centerOrb = (scenario.gridH - 1) / 2;
  // 如果没有合法移动（理论上不应发生），尝试移动到中心
  if (validMoves.length === 0) return Math.floor(centerOrb);

  // 1. 蓝方 (逃逸者) 策略
  if (player === 'A') {
    let bestScore = -Infinity;
    let best: number[] = [];
    const mapCenter = (scenario.gridW - 1) / 2;

    for (const y of validMoves) {
      const nextA = calcNextPos(aPos, y, scenario);
      const dist = chebyshevDist(nextA, bPos);
      
      // 评分标准：
      // 1. 距离越远越好 (权重 10)
      // 2. 越靠近地图中心越好 (权重 1) - 避免被逼入死角
      const centerBias = -Math.abs(nextA.x - mapCenter);
      const score = dist * 10 + centerBias;

      if (score > bestScore) {
        bestScore = score;
        best = [y];
      } else if (score === bestScore) {
        best.push(y);
      }
    }

    return best[Math.floor(Math.random() * best.length)];
  }

  // 2. 红方 (追击者) 策略
  // 红方需要预测蓝方的位置。如果是热座模式或AI先手，可能没有 pendingAMove，
  // 但在 AI 回合逻辑中，如果轮到红方行动，通常意味着蓝方已经行动（除非是同步行动变体，但目前是回合制）
  // 在当前规则下，红方行动时，pendingAMove 是蓝方的这一回合的目标位置（如果是隐藏移动模式）。
  // 简单 AI 假设它知道蓝方的位置 (作弊/全知视角) 或者追踪 pendingAMove。
  const targetA = pendingAMove || aPos;
  
  let bestScore = -Infinity;
  let best: number[] = [];

  for (const y of validMoves) {
    const nextB = calcNextPos(bPos, y, scenario);
    const dist = chebyshevDist(targetA, nextB);

    let score = -dist * 10;

    // 奖励：进入锁定范围
    if (dist <= 1) {
      score += 120;
      // 奖励：即将获胜
      if (bTimeInRange + 1 >= scenario.winTime) score += 100;
    }

    // 奖励：水平方向靠近目标
    score += -Math.abs(nextB.x - targetA.x);

    if (score > bestScore) {
      bestScore = score;
      best = [y];
    } else if (score === bestScore) {
      best.push(y);
    }
  }

  return best[Math.floor(Math.random() * best.length)];
};
