'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Course, ExerciseStep, ExercisePhase, TrainingRecord } from '@/types';

interface TrainingState {
  course: Course | null;
  currentSetIndex: number;
  currentStepIndex: number;
  currentRepeat: number;
  timeLeftInStep: number;
  phase: ExercisePhase;
  isRunning: boolean;
  isPaused: boolean;
  totalElapsed: number;
  progress: number; // 0-100
}

export function useTraining() {
  const [state, setState] = useState<TrainingState>({
    course: null,
    currentSetIndex: 0,
    currentStepIndex: 0,
    currentRepeat: 0,
    timeLeftInStep: 0,
    phase: 'ready',
    isRunning: false,
    isPaused: false,
    totalElapsed: 0,
    progress: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepStartRef = useRef<number>(0);

  const currentStep = useCallback((): ExerciseStep | null => {
    if (!state.course) return null;
    const set = state.course.sets[state.currentSetIndex];
    if (!set) return null;
    return set.steps[state.currentStepIndex] || null;
  }, [state.course, state.currentSetIndex, state.currentStepIndex]);

  const advanceStep = useCallback(() => {
    setState((prev) => {
      if (!prev.course) return prev;
      const set = prev.course.sets[prev.currentSetIndex];
      if (!set) return prev;

      const nextStepIdx = prev.currentStepIndex + 1;

      // 同一 set 内还有步骤
      if (nextStepIdx < set.steps.length) {
        stepStartRef.current = Date.now();
        return {
          ...prev,
          currentStepIndex: nextStepIdx,
          timeLeftInStep: set.steps[nextStepIdx].duration,
          phase: set.steps[nextStepIdx].phase,
        };
      }

      // 同一 set 还需要重复
      const nextRepeat = prev.currentRepeat + 1;
      if (nextRepeat < set.repeat) {
        stepStartRef.current = Date.now();
        return {
          ...prev,
          currentStepIndex: 0,
          currentRepeat: nextRepeat,
          timeLeftInStep: set.steps[0].duration,
          phase: set.steps[0].phase,
        };
      }

      // 下一个 set
      const nextSetIdx = prev.currentSetIndex + 1;
      if (nextSetIdx < prev.course.sets.length) {
        stepStartRef.current = Date.now();
        return {
          ...prev,
          currentSetIndex: nextSetIdx,
          currentStepIndex: 0,
          currentRepeat: 0,
          timeLeftInStep: prev.course.sets[nextSetIdx].steps[0].duration,
          phase: prev.course.sets[nextSetIdx].steps[0].phase,
        };
      }

      // 全部完成
      return { ...prev, isRunning: false, phase: 'complete' as ExercisePhase, progress: 100 };
    });
  }, []);

  // 计时器
  useEffect(() => {
    if (!state.isRunning || state.isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.course) return prev;
        const newTimeLeft = prev.timeLeftInStep - 0.1;
        const newElapsed = prev.totalElapsed + 0.1;
        const newProgress = Math.min(
          (newElapsed / prev.course.totalDuration) * 100,
          100
        );

        if (newTimeLeft <= 0) {
          return {
            ...prev,
            timeLeftInStep: 0,
            totalElapsed: newElapsed,
            progress: newProgress,
          };
        }

        return {
          ...prev,
          timeLeftInStep: newTimeLeft,
          totalElapsed: newElapsed,
          progress: newProgress,
        };
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, state.isPaused]);

  // 步骤切换
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.timeLeftInStep <= 0) {
      advanceStep();
    }
  }, [state.timeLeftInStep, state.isRunning, state.isPaused, advanceStep]);

  const startCourse = useCallback((course: Course) => {
    const firstSet = course.sets[0];
    const firstStep = firstSet.steps[0];
    stepStartRef.current = Date.now();
    setState({
      course,
      currentSetIndex: 0,
      currentStepIndex: 0,
      currentRepeat: 0,
      timeLeftInStep: firstStep.duration,
      phase: firstStep.phase,
      isRunning: true,
      isPaused: false,
      totalElapsed: 0,
      progress: 0,
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      phase: 'complete' as ExercisePhase,
    }));
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState({
      course: null,
      currentSetIndex: 0,
      currentStepIndex: 0,
      currentRepeat: 0,
      timeLeftInStep: 0,
      phase: 'ready',
      isRunning: false,
      isPaused: false,
      totalElapsed: 0,
      progress: 0,
    });
  }, []);

  // 生成训练记录
  const buildRecord = useCallback((): TrainingRecord | null => {
    if (!state.course) return null;
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      courseId: state.course.id,
      date: new Date().toISOString(),
      duration: Math.round(state.totalElapsed),
      completed: state.phase === 'complete',
    };
  }, [state.course, state.totalElapsed, state.phase]);

  return {
    ...state,
    currentStep,
    startCourse,
    pause,
    resume,
    stop,
    reset,
    buildRecord,
  };
}
