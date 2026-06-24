// 训练动作类型
export type ExerciseType = 'quick' | 'sustained' | 'ladder' | 'endurance' | 'relax';

// 动作阶段
export type ExercisePhase = 'contract' | 'hold' | 'relax' | 'rest' | 'ready' | 'complete';

// 用户性别
export type Gender = 'male' | 'female';

// 难度等级
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 单步训练指令
export interface ExerciseStep {
  phase: ExercisePhase;
  duration: number; // 秒
  label: string;
  voiceInstruction: string;
}

// 一组训练
export interface ExerciseSet {
  steps: ExerciseStep[];
  repeat: number;
  restBetweenSets: number; // 秒
}

// 完整课程
export interface Course {
  id: string;
  title: string;
  description: string;
  gender: Gender;
  difficulty: Difficulty;
  totalDuration: number; // 秒
  sets: ExerciseSet[];
  tips: string[];
}

// 训练记录
export interface TrainingRecord {
  id: string;
  courseId: string;
  date: string; // ISO date string
  duration: number; // 实际训练秒数
  completed: boolean;
  score?: number; // 0-100 姿态评分
}

// 每日统计
export interface DailyStats {
  date: string;
  totalDuration: number;
  sessions: number;
  avgScore: number;
}

// 姿势问题
export interface PostureIssue {
  type: 'slouch' | 'shoulder_uneven' | 'body_tilt' | 'head_forward';
  severity: number; // 0-1
  message: string;
}

// MediaPipe 姿态关键点
export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// AI 建议响应
export interface PostureAdvice {
  issues: string[];
  suggestions: string[];
  encouragement: string;
}
