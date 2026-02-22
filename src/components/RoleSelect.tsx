import React from 'react';
import { ArrowLeft, Rocket, Satellite } from 'lucide-react';
import { motion } from 'motion/react';
import { WIN_TIME, MAX_TURNS } from '../constants';
import type { Player } from '../types';

interface RoleSelectProps {
  onStartAIMatch: (role: Player) => void;
  onBack: () => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ onStartAIMatch, onBack }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black text-slate-200 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl rounded-3xl border border-slate-700/70 bg-slate-900/75 backdrop-blur-xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800/80 transition"
          >
            <ArrowLeft size={18} />
            返回首页
          </button>

          <div className="text-right">
            <h2 className="text-2xl font-bold text-white">AI 对战</h2>
            <p className="text-slate-400 text-sm">请选择你要扮演的阵营</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 红方追击者 */}
          <button
            onClick={() => onStartAIMatch('B')}
            className="group text-left rounded-2xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/35 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <Rocket className="text-red-400" size={28} />
              </div>
              <div>
                <div className="text-white font-bold text-xl">追击者（红方）</div>
                <div className="text-red-200/80 text-sm">Pursuer</div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-6">
              你的目标是利用 3x3 锁定区追踪并压制蓝方，
              让其连续 <span className="font-mono text-white">{WIN_TIME}</span> 回合处于锁定范围内。
            </p>

            <div className="mt-4 text-xs text-red-200/80 font-mono">
              适合喜欢主动压迫、预测走位的玩家
            </div>
          </button>

          {/* 蓝方逃逸者 */}
          <button
            onClick={() => onStartAIMatch('A')}
            className="group text-left rounded-2xl border border-blue-900/40 bg-blue-950/20 hover:bg-blue-950/35 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Satellite className="text-blue-400" size={28} />
              </div>
              <div>
                <div className="text-white font-bold text-xl">逃逸者（蓝方）</div>
                <div className="text-blue-200/80 text-sm">Evader</div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-6">
              你的目标是在中间受限区域内持续规避红方锁定，
              成功坚持至 <span className="font-mono text-white">第 {MAX_TURNS} 回合</span> 即可获胜。
            </p>

            <div className="mt-4 text-xs text-blue-200/80 font-mono">
              适合喜欢规避、骗招与空间管理的玩家
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
