'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourseById } from '@/data/courses';
import { useTraining } from '@/hooks/useTraining';
import { useVoice } from '@/hooks/useVoice';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TrainingRecord, PostureIssue, PoseLandmark } from '@/types';
import BreathingCircle from '@/components/BreathingCircle';
import PostureFigure from '@/components/PostureFigure';
import PoseDetector from '@/components/PoseDetector';
import AIAdvice from '@/components/AIAdvice';

function TrainPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');

  const course = courseId ? getCourseById(courseId) : undefined;
  const training = useTraining();
  const { speak, stop, muted, toggleMute } = useVoice();
  const [records, setRecords] = useLocalStorage<TrainingRecord[]>('training-records', []);

  const [showPose, setShowPose] = useState(false);
  const [persistentIssues, setPersistentIssues] = useState<PostureIssue[]>([]);
  const [landmarkSnapshot, setLandmarkSnapshot] = useState<Record<string, unknown>[]>([]);

  const lastSpokenStepRef = useRef('');

  // 自动开始训练
  useEffect(() => {
    if (course && !training.isRunning && training.phase === 'ready') {
      training.startCourse(course);
    }
  }, [course]);

  // 语音播报 — 排队模式，不打断当前语音
  useEffect(() => {
    if (!training.isRunning || training.isPaused) return;
    const step = training.currentStep();
    if (!step) return;

    const stepKey = `${training.currentSetIndex}-${training.currentStepIndex}-${training.currentRepeat}`;
    if (stepKey !== lastSpokenStepRef.current) {
      lastSpokenStepRef.current = stepKey;
      const rate = step.duration <= 2 ? 0.75 : 0.8;
      speak(step.voiceInstruction, rate);
    }
  }, [training.currentSetIndex, training.currentStepIndex, training.currentRepeat, training.isRunning, training.isPaused]);

  // 训练完成时保存记录
  useEffect(() => {
    if (training.phase === 'complete' && training.totalElapsed > 0) {
      const record = training.buildRecord();
      if (record) {
        setRecords((prev) => [...prev, record]);
      }
      speak('训练完成！你真棒！', 0.8, 1.1);
    }
  }, [training.phase]);

  const handlePersistentIssues = useCallback(
    (issues: PostureIssue[], summary: { issues: PostureIssue[]; landmarkSnapshot: Partial<PoseLandmark>[] } | null) => {
      setPersistentIssues(issues);
      if (summary) setLandmarkSnapshot(summary.landmarkSnapshot as Record<string, unknown>[]);
    },
    []
  );

  if (!course) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 text-center text-gray-400">
        <p className="mb-4">未找到课程</p>
        <button onClick={() => router.push('/')} className="text-emerald-600 hover:underline">返回首页</button>
      </div>
    );
  }

  const currentStep = training.currentStep();
  const stepDuration = currentStep?.duration || 1;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-5 pb-12">

        {/* 顶部栏 — 极简 */}
        <div className="flex items-center justify-between py-4 text-sm text-gray-400">
          <button
            onClick={() => { stop(); training.reset(); router.push('/'); }}
            className="hover:text-gray-600 transition-colors"
          >
            ← 返回
          </button>
          <span className="text-xs text-gray-300">
            {course.title.split('·')[0]}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className={`hover:text-gray-600 transition-colors ${muted ? 'text-red-400' : ''}`}>
              {muted ? '静音' : '语音'}
            </button>
            <button
              onClick={() => setShowPose(!showPose)}
              className={`hover:text-gray-600 transition-colors ${showPose ? 'text-emerald-500' : ''}`}
            >
              姿态
            </button>
          </div>
        </div>

        {/* 进度条 — 细线 */}
        <div className="w-full h-0.5 bg-gray-100 mb-10">
          <motion.div
            className="h-full bg-emerald-400"
            animate={{ width: `${training.progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 主训练区 */}
        <div className="flex flex-col items-center gap-8 mb-12">
          <BreathingCircle
            phase={training.phase}
            timeLeft={training.timeLeftInStep}
            stepDuration={stepDuration}
            instruction={currentStep?.voiceInstruction}
          />
          <PostureFigure phase={training.phase} />
        </div>

        {/* 控制按钮 — 简洁 */}
        <div className="flex justify-center gap-4 mb-10">
          {training.isRunning && training.phase !== 'complete' && (
            <>
              {training.isPaused ? (
                <button
                  onClick={training.resume}
                  className="w-32 py-2.5 rounded-full border border-emerald-200 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  继续
                </button>
              ) : (
                <button
                  onClick={training.pause}
                  className="w-32 py-2.5 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  暂停
                </button>
              )}
              <button
                onClick={() => { stop(); training.stop(); }}
                className="w-32 py-2.5 rounded-full border border-red-100 text-red-400 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                结束
              </button>
            </>
          )}

          {training.phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-4xl">🎉</div>
              <p className="text-gray-800 font-medium">训练完成</p>
              <p className="text-sm text-gray-400">用时 {Math.round(training.totalElapsed / 60)} 分钟</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { training.reset(); training.startCourse(course); }}
                  className="px-6 py-2 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-colors"
                >
                  再来一次
                </button>
                <button
                  onClick={() => router.push('/records')}
                  className="px-6 py-2 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
                >
                  查看记录
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* 姿势检测 */}
        <AnimatePresence>
          {showPose && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-8 overflow-hidden"
            >
              <PoseDetector onPersistentIssues={handlePersistentIssues} />
              {persistentIssues.length > 0 && (
                <AIAdvice issues={persistentIssues} landmarkSnapshot={landmarkSnapshot} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 训练提示 — 轻量卡片 */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-300 mb-3 tracking-wider">训练提示</p>
          <ul className="space-y-2">
            {course.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-400 flex gap-2">
                <span className="text-gray-200">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* 组数指示器 */}
        <div className="flex justify-center gap-2 mt-8">
          {course.sets.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i <= training.currentSetIndex ? 'bg-emerald-300' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default function TrainPage() {
  return (
    <Suspense fallback={<div className="text-center pt-20 text-gray-400">加载中...</div>}>
      <TrainPageInner />
    </Suspense>
  );
}
