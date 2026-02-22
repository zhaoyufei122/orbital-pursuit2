import type { GameState } from './types';
import type { GameAction } from './actions';
import { SCENARIO_CLASSIC } from '../config/scenarios';
import { chebyshevDist } from '../utils';
import { isValidMove, calcNextPos, checkWinCondition, isWithinCaptureRange, isLongScanCovered, isWithinVisualRange, isGroundObservationAllowed } from '../game/rules'; // Added isWithinVisualRange
import { INITIAL_RESOURCES } from './types';
import type { Player, Pos, Weather } from '../types';

export const initialState: GameState = {
  mode: null,
  humanRole: null,
  matchPhase: 'playing',
  turn: 1,
  winner: null,
  scenario: SCENARIO_CLASSIC,
  aPos: SCENARIO_CLASSIC.initialAPos,
  bPos: SCENARIO_CLASSIC.initialBPos,
  currentPlayer: 'A',
  pendingAMove: null,
  bTimeInRange: 0,
  resources: {
    A: { ...INITIAL_RESOURCES },
    B: { ...INITIAL_RESOURCES },
  },
  lastScan: { A: null, B: null },
  hasPerformedScan: false,
  weather: 'CLEAR', // 默认为晴朗
};

// 简单的天气生成器
// 20% 概率生成多云，仅在 weatherEnabled 时生效
// 使用简单的马尔可夫链模拟天气持续性：
// - 如果当前是 CLEAR，15% 转为 CLOUDY (降低坏天气发生率)
// - 如果当前是 CLOUDY，60% 转为 CLEAR (多云倾向于持续，但不如晴朗稳定)
const generateWeather = (scenario: GameScenario, currentWeather: Weather): Weather => {
  if (!scenario.weatherEnabled) return 'CLEAR';
  
  const rand = Math.random();
  if (currentWeather === 'CLEAR') {
    return rand < 0.15 ? 'CLOUDY' : 'CLEAR';
  } else {
    // CLOUDY
    return rand < 0.6 ? 'CLEAR' : 'CLOUDY';
  }
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_HOTSEAT': {
      const scenario = action.payload?.scenario || state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario,
        aPos: scenario.initialAPos,
        bPos: scenario.initialBPos,
        mode: 'hotseat',
        matchPhase: 'playing',
        resources: {
          A: { ...INITIAL_RESOURCES },
          B: { ...INITIAL_RESOURCES },
        },
        lastScan: { A: null, B: null },
        hasPerformedScan: false,
      };
    }

    case 'START_AI_MATCH': {
      const scenario = action.payload?.scenario || state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario,
        aPos: scenario.initialAPos,
        bPos: scenario.initialBPos,
        mode: 'ai',
        humanRole: action.payload.role,
        matchPhase: 'playing',
        resources: {
          A: { ...INITIAL_RESOURCES },
          B: { ...INITIAL_RESOURCES },
        },
        lastScan: { A: null, B: null },
        hasPerformedScan: false,
      };
    }

    case 'RESET_GAME': {
      const currentScenario = state.scenario || SCENARIO_CLASSIC;
      return {
        ...initialState,
        scenario: currentScenario,
        aPos: currentScenario.initialAPos,
        bPos: currentScenario.initialBPos,
        mode: state.mode,
        humanRole: state.humanRole,
        resources: {
          A: { ...INITIAL_RESOURCES },
          B: { ...INITIAL_RESOURCES },
        },
        lastScan: { A: null, B: null },
        hasPerformedScan: false,
      };
    }

    case 'SCAN_SHORT': {
      const { currentPlayer, scenario, aPos, bPos, hasPerformedScan, turn, weather } = state;
      if (!scenario) return state;
      if (hasPerformedScan) return state; // 本回合已观测过

      // 检查是否允许观测
      const allowedCheck = isGroundObservationAllowed(turn, weather, 'SHORT', scenario);
      if (!allowedCheck.allowed) {
        // 这里理想情况下应该通过 UI 提示用户，但 Reducer 只能返回 state
        // 我们可以添加一个 error 字段，或者让 UI 预先禁用按钮
        // 这里直接返回 state，相当于操作无效
        console.warn(`Short scan prevented: ${allowedCheck.reason}`);
        return state;
      }

      // 确定对手
      const opponent = currentPlayer === 'A' ? 'B' : 'A';
      const opponentPos = opponent === 'A' ? aPos : bPos;

      const result = {
        turn: state.turn,
        scanType: 'SHORT' as const,
        detectedColumn: opponentPos.x,
        detectedPos: null,
      };

      return {
        ...state,
        hasPerformedScan: true,
        lastScan: {
          ...state.lastScan,
          [currentPlayer]: result,
        },
      };
    }

    case 'SCAN_LONG': {
      const { currentPlayer, scenario, aPos, bPos, hasPerformedScan, turn, weather } = state;
      if (!scenario) return state;
      if (hasPerformedScan) return state; // 本回合已观测过

      // 检查是否允许观测
      const allowedCheck = isGroundObservationAllowed(turn, weather, 'LONG', scenario);
      if (!allowedCheck.allowed) {
        console.warn(`Long scan prevented: ${allowedCheck.reason}`);
        return state;
      }

      const { center } = action.payload; // 改为 center

      const opponent = currentPlayer === 'A' ? 'B' : 'A';
      const opponentPos = opponent === 'A' ? aPos : bPos;

            // 检查是否在目视范围内 (仅作逻辑判断，暂不作为命中依据)
            const inVisual = isWithinVisualRange(opponentPos, center, scenario);

            // 使用物理距离判定命中
            const isHit = isLongScanCovered(center, opponentPos, scenario);

            // 如果命中，detectedPos 为对方位置；否则为 null
            const detectedPos = isHit ? opponentPos : null;

            const result = {
                turn: state.turn,
                scanType: 'LONG' as const,
                detectedColumn: null,
                detectedPos: detectedPos,
                scannedArea: { center, radius: scenario.ranges.longScan || 175 },
            };

            return {
                ...state,
                hasPerformedScan: true,
                lastScan: {
                  ...state.lastScan,
                  [currentPlayer]: result,
                },
            };
    }

    case 'PLAYER_MOVE': {
      const { selectedY } = action.payload;
      const { currentPlayer, aPos, bPos, pendingAMove, turn, bTimeInRange, scenario } = state;

      if (!scenario) return state;

      // 1. 蓝方移动逻辑
      if (currentPlayer === 'A') {
        if (!isValidMove('A', aPos.x, selectedY, scenario)) return state;
        const nextA = calcNextPos(aPos, selectedY, scenario);
        
        // 计算燃料消耗: 每移动1格轨道(15km) 消耗 0.6 fuel
        const dy = Math.abs(aPos.y - selectedY);
        // 如果高度没有变化（dy=0），则不消耗燃料（漂移不耗能）
        const fuelCost = dy * 0.6;
        // 燃料累加模式：记录已消耗的 Delta V
        const nextFuel = state.resources.A.fuel + fuelCost;
        
        // 蓝方移动后不更新回合数，也不更新天气（只有在回合数变更时才更新天气）
        // 等待红方移动
        return {
          ...state,
          pendingAMove: nextA,
          currentPlayer: 'B',
          hasPerformedScan: false, // 重置回合内观测标记
          resources: {
            ...state.resources,
            A: { ...state.resources.A, fuel: nextFuel }
          }
        };
      }

      // 2. 红方移动逻辑
      if (currentPlayer === 'B') {
        if (!isValidMove('B', bPos.x, selectedY, scenario)) return state;
        
        const nextB = calcNextPos(bPos, selectedY, scenario);
        const finalA = pendingAMove || aPos;
        
        // 计算燃料消耗
        const dy = Math.abs(bPos.y - selectedY);
        const fuelCost = dy * 0.6;
        // 燃料累加模式：记录已消耗的 Delta V
        const nextFuel = state.resources.B.fuel + fuelCost;

        // 使用物理距离判定胜利条件
        // 移除 turn 传参，因为盲区约束已移除
        const inRange = isWithinCaptureRange(finalA, nextB, scenario);
        const newTimeInRange = inRange ? bTimeInRange + 1 : 0;
        
        const { nextPhase, nextWinner } = checkWinCondition(newTimeInRange, turn + 1, scenario);

        // 回合结束，更新天气
        const nextWeather = generateWeather(scenario, state.weather);

        return {
          ...state,
          aPos: finalA,
          bPos: nextB,
          turn: state.turn + 1,
          bTimeInRange: newTimeInRange,
          matchPhase: nextPhase,
          winner: nextWinner,
          currentPlayer: 'A',
          pendingAMove: null,
          hasPerformedScan: false, // 重置回合内观测标记
          weather: nextWeather,    // 更新天气
          resources: {
            ...state.resources,
            B: { ...state.resources.B, fuel: nextFuel }
          }
        };
      }

      return state;
    }

    default:
      return state;
  }
}
