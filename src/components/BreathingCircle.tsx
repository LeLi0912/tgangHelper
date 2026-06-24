'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExercisePhase } from '@/types';
import { getBreathingParams } from '@/data/courses';

interface BreathingCircleProps {
  phase: ExercisePhase;
  timeLeft: number;
  stepDuration: number;
  instruction?: string;
}

const phaseLabel: Record<ExercisePhase, string> = {
  ready: '准备', contract: '收缩', hold: '保持',
  relax: '放松', rest: '休息', complete: '完成',
};

export default function BreathingCircle({ phase, timeLeft, stepDuration, instruction }: BreathingCircleProps) {
  const { scale, color } = getBreathingParams(phase);
  const progress = stepDuration > 0 ? (timeLeft / stepDuration) : 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-60 h-60 sm:w-64 sm:h-64">
        {/* 轨道 */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#F1F5F9" strokeWidth="1.5" />
          {progress > 0 && (
            <circle
              cx="50" cy="50" r="46"
              fill="none" stroke={color} strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
              opacity="0.6"
            />
          )}
        </svg>

        {/* 呼吸圈 — 单层 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="rounded-full"
            animate={{ scale }}
            transition={{ scale: { duration: stepDuration, ease: 'easeInOut' } }}
            style={{
              width: '55%', height: '55%',
              backgroundColor: `${color}18`,
              border: `1.5px solid ${color}30`,
            }}
          />
          <motion.div
            className="absolute rounded-full flex items-center justify-center"
            animate={{ scale }}
            transition={{ scale: { duration: stepDuration, ease: 'easeInOut' } }}
            style={{ width: '38%', height: '38%', backgroundColor: color, opacity: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`${phase}-${Math.ceil(timeLeft)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white font-semibold text-xl tabular-nums"
              >
                {phase === 'complete' ? '✓' : Math.ceil(timeLeft)}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 阶段文字 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={instruction || phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-center"
        >
          <div className="text-xl font-medium tracking-wide" style={{ color }}>
            {instruction || phaseLabel[phase]}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
