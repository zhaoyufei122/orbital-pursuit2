import React, { useState } from 'react';
import type { Screen } from './types';
import { useGameEngine } from './hooks/useGameEngine';
import { Home } from './components/Home';
import { Instructions } from './components/Instructions';
import { RoleSelect } from './components/RoleSelect';
import { GameMatch } from './components/GameMatch';
import { type GameScenario, SCENARIO_CLASSIC } from './config/scenarios';

export default function App() {
  // 页面流程状态
  const [screen, setScreen] = useState<Screen>('home');
  const [pendingScenario, setPendingScenario] = useState<GameScenario | null>(null);
  
  // 游戏核心逻辑 Hook
  const engine = useGameEngine();

  // ---------------------------
  // 页面路由渲染
  // ---------------------------
  if (screen === 'home') {
    return (
      <Home
        onStartHotseat={(scenario) => {
          engine.startHotseat(scenario);
          setScreen('match');
        }}
        onStartAIConfig={(scenario) => {
          setPendingScenario(scenario);
          setScreen('aiRoleSelect');
        }}
        onNavigate={setScreen}
      />
    );
  }

  if (screen === 'instructions') {
    return <Instructions onBack={() => setScreen('home')} />;
  }

  if (screen === 'aiRoleSelect') {
    return (
      <RoleSelect
        onStartAIMatch={(role) => {
          engine.startAIMatch(role, pendingScenario || SCENARIO_CLASSIC);
          setScreen('match');
        }}
        onBack={() => setScreen('home')}
      />
    );
  }

  // screen === 'match'
  return (
    <GameMatch
      engine={engine}
      onBackToMenu={() => setScreen('home')}
    />
  );
}
