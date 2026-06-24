'use client';

import { Course } from '@/types';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

const difficultyConfig = {
  beginner: {
    label: '入门',
    gradient: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-50 text-emerald-700',
    bar: 'bg-gradient-to-r from-emerald-400 to-green-400',
  },
  intermediate: {
    label: '进阶',
    gradient: 'from-teal-400 to-cyan-500',
    bg: 'bg-teal-50 text-teal-700',
    bar: 'bg-gradient-to-r from-teal-400 to-cyan-400',
  },
  advanced: {
    label: '强化',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 text-violet-700',
    bar: 'bg-gradient-to-r from-violet-400 to-purple-400',
  },
};

const genderIcon = { male: '♂️', female: '♀️' };

export default function CourseCard({ course, onSelect }: CourseCardProps) {
  const diff = difficultyConfig[course.difficulty];
  const minutes = Math.round(course.totalDuration / 60);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(course)}
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* 顶部渐变条 */}
      <div className={`h-1 ${diff.bar}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${diff.bg}`}>
              {diff.label}
            </span>
            <span className="text-sm" role="img" aria-label={course.gender}>
              {genderIcon[course.gender]}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            {minutes} 分钟
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* 训练提示 */}
        <div className="border-t border-gray-100 pt-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {course.tips.slice(0, 3).map((tip, i) => (
              <span
                key={i}
                className="text-xs text-gray-400 bg-gray-50/80 px-2 py-1 rounded-md border border-gray-100"
              >
                {tip.length > 18 ? tip.slice(0, 18) + '...' : tip}
              </span>
            ))}
          </div>
        </div>

        {/* CTA 按钮 */}
        <button
          className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${diff.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97] tracking-wide`}
        >
          开始训练
        </button>
      </div>
    </motion.div>
  );
}
