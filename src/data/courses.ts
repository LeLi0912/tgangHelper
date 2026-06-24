import { Course, ExerciseStep, ExerciseSet } from '@/types';

// 基础动作模板
const quickContract: ExerciseStep = {
  phase: 'contract', duration: 1, label: '快速收缩',
  voiceInstruction: '收',
};

const quickRelax: ExerciseStep = {
  phase: 'relax', duration: 1, label: '快速放松',
  voiceInstruction: '放',
};

const sustainedContract: ExerciseStep = {
  phase: 'contract', duration: 5, label: '持续收缩',
  voiceInstruction: '缓慢收缩盆底肌，感受向上提升',
};

const sustainedHold: ExerciseStep = {
  phase: 'hold', duration: 5, label: '保持收紧',
  voiceInstruction: '保持收紧，正常呼吸，不要憋气',
};

const sustainedRelax: ExerciseStep = {
  phase: 'relax', duration: 5, label: '缓慢放松',
  voiceInstruction: '缓慢放松，感受肌肉完全松开',
};

const ladderUpSteps: ExerciseStep[] = [
  { phase: 'contract', duration: 2, label: '收缩 20%', voiceInstruction: '收缩到20%的力度' },
  { phase: 'hold', duration: 1, label: '保持', voiceInstruction: '保持住' },
  { phase: 'contract', duration: 2, label: '收缩 50%', voiceInstruction: '继续收缩到50%力度' },
  { phase: 'hold', duration: 1, label: '保持', voiceInstruction: '保持住' },
  { phase: 'contract', duration: 2, label: '收缩 80%', voiceInstruction: '加大力度到80%' },
  { phase: 'hold', duration: 1, label: '保持', voiceInstruction: '保持住' },
  { phase: 'contract', duration: 2, label: '收缩 100%', voiceInstruction: '尽全力收紧到100%' },
  { phase: 'hold', duration: 3, label: '顶峰保持', voiceInstruction: '顶峰保持，坚持住' },
];

const ladderDownSteps: ExerciseStep[] = [
  { phase: 'relax', duration: 2, label: '放松至 60%', voiceInstruction: '缓慢放松至60%' },
  { phase: 'hold', duration: 1, label: '保持', voiceInstruction: '保持住' },
  { phase: 'relax', duration: 2, label: '放松至 30%', voiceInstruction: '继续放松至30%' },
  { phase: 'hold', duration: 1, label: '保持', voiceInstruction: '保持住' },
  { phase: 'relax', duration: 2, label: '完全放松', voiceInstruction: '完全放松盆底肌' },
];

const restStep: ExerciseStep = {
  phase: 'rest', duration: 10, label: '休息',
  voiceInstruction: '休息一下，正常呼吸',
};

// 初学者课程
const beginnerMale: Course = {
  id: 'male-beginner',
  title: '男性入门 · 唤醒盆底肌',
  description: '从感知和控制盆底肌开始，轻柔入门，建立基础力量。零基础友好。',
  gender: 'male',
  difficulty: 'beginner',
  totalDuration: 480, // 8分钟
  sets: [
    {
      steps: [quickContract, quickRelax],
      repeat: 10,
      restBetweenSets: 15,
    },
    {
      steps: [sustainedContract, sustainedHold, sustainedRelax],
      repeat: 5,
      restBetweenSets: 20,
    },
  ],
  tips: [
    '训练前排空膀胱',
    '找到正确的肌肉：想象你在中断排尿',
    '保持腹部、臀部、大腿放松',
    '正常呼吸，不要憋气',
    '如果感到腰背疼痛，说明用错了肌肉',
  ],
};

const beginnerFemale: Course = {
  id: 'female-beginner',
  title: '女性入门 · 找到你的盆底肌',
  description: '温和激活盆底肌，学习正确发力方式。适合产后恢复和初次练习。',
  gender: 'female',
  difficulty: 'beginner',
  totalDuration: 540, // 9分钟
  sets: [
    {
      steps: [quickContract, quickRelax],
      repeat: 10,
      restBetweenSets: 15,
    },
    {
      steps: [
        { ...sustainedContract, duration: 3 },
        { ...sustainedHold, duration: 3 },
        { ...sustainedRelax, duration: 3 },
      ],
      repeat: 5,
      restBetweenSets: 20,
    },
  ],
  tips: [
    '训练前排空膀胱',
    '找到正确的肌肉：想象你在中断排尿或收紧阴道',
    '保持腹部、臀部、大腿放松',
    '正常呼吸，不要憋气',
    '产后妈妈请在医生许可下进行',
  ],
};

// 中级课程
const intermediateMale: Course = {
  id: 'male-intermediate',
  title: '男性进阶 · 力量持久训练',
  description: '增强盆底肌力量和耐力，加入阶梯训练，提升控制力。',
  gender: 'male',
  difficulty: 'intermediate',
  totalDuration: 720, // 12分钟
  sets: [
    {
      steps: [quickContract, quickRelax],
      repeat: 15,
      restBetweenSets: 10,
    },
    {
      steps: [sustainedContract, sustainedHold, sustainedRelax],
      repeat: 8,
      restBetweenSets: 15,
    },
    {
      steps: [...ladderUpSteps, ...ladderDownSteps],
      repeat: 3,
      restBetweenSets: 20,
    },
  ],
  tips: [
    '尝试在不同姿势下训练（坐、站、躺）',
    '逐步延长保持时间',
    '关注肌肉耐力的提升',
    '收缩时想象从肛门向上提拉',
  ],
};

const intermediateFemale: Course = {
  id: 'female-intermediate',
  title: '女性进阶 · 耐力与控制',
  description: '增强盆底肌耐力和控制精度，加入阶梯式训练提升肌肉弹性。',
  gender: 'female',
  difficulty: 'intermediate',
  totalDuration: 780, // 13分钟
  sets: [
    {
      steps: [quickContract, quickRelax],
      repeat: 15,
      restBetweenSets: 10,
    },
    {
      steps: [
        { ...sustainedContract, duration: 6 },
        { ...sustainedHold, duration: 6 },
        { ...sustainedRelax, duration: 6 },
      ],
      repeat: 6,
      restBetweenSets: 15,
    },
    {
      steps: [...ladderUpSteps, ...ladderDownSteps],
      repeat: 3,
      restBetweenSets: 20,
    },
  ],
  tips: [
    '收缩时想象从阴道向上提拉一颗葡萄',
    '尝试站立姿势增加难度',
    '注意区分盆底肌和腹肌',
    '产后检查无问题后再进行中级训练',
  ],
};

// 高级课程
const advancedMale: Course = {
  id: 'male-advanced',
  title: '男性强化 · 终极控制',
  description: '高强度综合训练，快速收缩+耐力保持+阶梯组合，全面提升。',
  gender: 'male',
  difficulty: 'advanced',
  totalDuration: 960, // 16分钟
  sets: [
    {
      steps: [quickContract, quickRelax],
      repeat: 20,
      restBetweenSets: 10,
    },
    {
      steps: [
        { ...sustainedContract, duration: 8 },
        { ...sustainedHold, duration: 10 },
        { ...sustainedRelax, duration: 8 },
      ],
      repeat: 8,
      restBetweenSets: 15,
    },
    {
      steps: [...ladderUpSteps, ...ladderDownSteps],
      repeat: 5,
      restBetweenSets: 15,
    },
  ],
  tips: [
    '可在站立或行走时训练',
    '尝试在咳嗽或打喷嚏前预先收缩（功能训练）',
    '保持训练日记，追踪进步',
    '如有不适应暂停并咨询医生',
  ],
};

const advancedFemale: Course = {
  id: 'female-advanced',
  title: '女性强化 · 全能盆底',
  description: '高难度综合训练，结合快慢收缩和阶梯训练，打造强大的盆底核心。',
  gender: 'female',
  difficulty: 'advanced',
  totalDuration: 1020, // 17分钟
  sets: [
    {
      steps: [quickContract, quickRelax],
      repeat: 20,
      restBetweenSets: 10,
    },
    {
      steps: [
        { ...sustainedContract, duration: 8 },
        { ...sustainedHold, duration: 10 },
        { ...sustainedRelax, duration: 8 },
      ],
      repeat: 8,
      restBetweenSets: 15,
    },
    {
      steps: [...ladderUpSteps, ...ladderDownSteps],
      repeat: 5,
      restBetweenSets: 15,
    },
  ],
  tips: [
    '可在深蹲或桥式姿势下训练',
    '将盆底肌收缩融入日常活动中',
    '关注快肌和慢肌纤维的均衡发展',
    '定期评估训练成果',
  ],
};

// 课程索引
export const allCourses: Course[] = [
  beginnerMale,
  beginnerFemale,
  intermediateMale,
  intermediateFemale,
  advancedMale,
  advancedFemale,
];

export const coursesByGender = (gender: 'male' | 'female'): Course[] =>
  allCourses.filter((c) => c.gender === gender);

export const getCourseById = (id: string): Course | undefined =>
  allCourses.find((c) => c.id === id);

// 获取当前步骤的呼吸圈动画参数
export function getBreathingParams(phase: ExerciseStep['phase']): {
  scale: number;
  color: string;
  duration: number;
} {
  switch (phase) {
    case 'contract':
      return { scale: 0.4, color: '#4ADE80', duration: 1 };
    case 'hold':
      return { scale: 0.4, color: '#F59E0B', duration: 1 };
    case 'relax':
      return { scale: 1.0, color: '#60A5FA', duration: 1.5 };
    case 'rest':
      return { scale: 1.0, color: '#94A3B8', duration: 1 };
    case 'ready':
      return { scale: 1.0, color: '#A78BFA', duration: 1 };
    case 'complete':
      return { scale: 1.0, color: '#34D399', duration: 2 };
  }
}
