export type Player = 'A' | 'B'; // A=蓝方逃逸者, B=红方追击者
export type Screen = 'home' | 'instructions' | 'aiRoleSelect' | 'match';
export type MatchPhase = 'playing' | 'gameover';
export type Mode = 'hotseat' | 'ai';

export type Pos = { x: number; y: number };

export type InteractionMode = 'IDLE' | 'MOVING' | 'SCAN_LONG_AIM';
