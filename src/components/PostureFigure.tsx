'use client';

import { motion } from 'framer-motion';
import { ExercisePhase } from '@/types';

interface PostureFigureProps {
  phase: ExercisePhase;
}

export default function PostureFigure({ phase }: PostureFigureProps) {
  const isContracting = phase === 'contract' || phase === 'hold';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 320" className="w-28 h-48 sm:w-32 sm:h-56">
        {/* 头部 */}
        <circle cx="100" cy="42" r="18" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
        <circle cx="94" cy="40" r="2" fill="#94A3B8" />
        <circle cx="106" cy="40" r="2" fill="#94A3B8" />
        <path d="M95 49 Q100 53 105 49" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />

        {/* 颈 */}
        <line x1="100" y1="60" x2="100" y2="74" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

        {/* 躯干 */}
        <motion.rect
          x="76" y="74" width="48" height="70" rx="10"
          fill="none" stroke="#CBD5E1" strokeWidth="1.5"
          animate={isContracting ? { scaleY: 0.9, originY: '74px' } : { scaleY: 1, originY: '74px' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* 盆底指示点 */}
        <motion.circle
          cx="100" cy="140" r="5"
          fill={isContracting ? '#4ADE80' : '#E2E8F0'}
          animate={isContracting ? { r: 3.5 } : { r: 5 }}
          transition={{ duration: 0.8 }}
        />

        {/* 左臂 */}
        <line x1="76" y1="84" x2="52" y2="120" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
        <line x1="52" y1="120" x2="42" y2="160" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />

        {/* 右臂 */}
        <line x1="124" y1="84" x2="148" y2="120" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
        <line x1="148" y1="120" x2="158" y2="160" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />

        {/* 左腿 */}
        <line x1="84" y1="142" x2="70" y2="220" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
        <line x1="70" y1="220" x2="60" y2="282" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="56" cy="288" rx="10" ry="5" fill="none" stroke="#CBD5E1" strokeWidth="1" />

        {/* 右腿 */}
        <line x1="116" y1="142" x2="130" y2="220" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
        <line x1="130" y1="220" x2="140" y2="282" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="144" cy="288" rx="10" ry="5" fill="none" stroke="#CBD5E1" strokeWidth="1" />
      </svg>

      <p className="text-xs text-gray-300 mt-1">
        {isContracting ? '收紧 · 正常呼吸' : '放松 · 自然站立'}
      </p>
    </div>
  );
}
