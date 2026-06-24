'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/components/CourseCard';
import { allCourses, coursesByGender } from '@/data/courses';
import { Gender, Difficulty, Course } from '@/types';

const genderOptions: { key: Gender; label: string; icon: string; desc: string }[] = [
  { key: 'male', label: '男性', icon: '♂️', desc: '前列腺健康 · 控尿能力 · 性功能提升' },
  { key: 'female', label: '女性', icon: '♀️', desc: '产后恢复 · 预防脱垂 · 核心力量' },
];

const difficultyFilters: { key: Difficulty | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'beginner', label: '入门' },
  { key: 'intermediate', label: '进阶' },
  { key: 'advanced', label: '强化' },
];

const features = [
  { icon: '🎯', title: '科学分级', desc: '男女区分 · 三档难度' },
  { icon: '🎬', title: '动画引导', desc: '一看就懂 · 零基础友好' },
  { icon: '🔊', title: '语音辅助', desc: '闭眼跟练 · 解放双眼' },
  { icon: '📷', title: 'AI 矫正', desc: '实时检测 · 纯本地运行' },
  { icon: '📊', title: '打卡记录', desc: '追踪进步 · 坚持不难' },
];

export default function HomePage() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');

  const filteredCourses = useMemo(() => {
    let courses = gender ? coursesByGender(gender) : allCourses;
    if (difficultyFilter !== 'all') {
      courses = courses.filter((c) => c.difficulty === difficultyFilter);
    }
    return courses;
  }, [gender, difficultyFilter]);

  const handleSelectCourse = (course: Course) => {
    router.push(`/train?courseId=${course.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-100/60 to-teal-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-100/50 to-emerald-100/30 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="text-center py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-700 text-sm font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            盆底肌科学训练
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-800 tracking-tight leading-tight">
            提肛
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              助手
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-md mx-auto leading-relaxed">
            科学分级 · 动画引导 · AI 矫正<br />
            让每一次训练都练到对的位置
          </p>

          <p className="text-sm text-gray-400 bg-white/60 inline-block px-4 py-1.5 rounded-full backdrop-blur">
            🧠 傻子也能练对 &nbsp;·&nbsp; 👂 闭着眼睛也能跟练
          </p>
        </motion.div>

        {/* 特性 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-2.5 bg-white/80 backdrop-blur rounded-xl px-4 py-3 shadow-sm border border-white/60 hover:shadow-md hover:border-emerald-100 transition-all"
            >
              <span className="text-xl">{f.icon}</span>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-700">{f.title}</div>
                <div className="text-xs text-gray-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 性别选择 */}
      <section className="mb-10">
        <div className="text-center mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">选择性别</h2>
        </div>
        <div className="flex gap-4 justify-center">
          {genderOptions.map((opt) => (
            <motion.button
              key={opt.key}
              onClick={() => setGender(opt.key)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 max-w-56 p-4 rounded-2xl border-2 transition-all duration-300 ${
                gender === opt.key
                  ? 'border-emerald-300 bg-white shadow-lg shadow-emerald-100/50'
                  : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-1.5">{opt.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{opt.label}</div>
              <div className="text-xs text-gray-400 mt-1 leading-relaxed">{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 课程区域 */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">训练课程</h2>
          <div className="flex gap-1 bg-white/80 backdrop-blur rounded-xl p-1 shadow-sm border border-gray-100">
            {difficultyFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setDifficultyFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  difficultyFilter === f.key
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${gender}-${difficultyFilter}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={handleSelectCourse}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white/60 rounded-2xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-base font-medium mb-1">暂无匹配课程</p>
            <p className="text-sm">尝试调整筛选条件或切换性别</p>
          </div>
        )}
      </section>

      {/* 知识卡片 */}
      <section className="mb-16">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-white/60">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">训练要点</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { emoji: '⏰', title: '最佳频率', desc: '每天 3 次，每次 5-10 分钟，坚持 6-12 周开始见效' },
              { emoji: '🧘', title: '正确姿势', desc: '坐直或站直，腹部臀部放松，保持正常呼吸节奏' },
              { emoji: '⚠️', title: '注意事项', desc: '训练前排空膀胱，不要憋气，勿用腹肌代偿发力' },
            ].map((t) => (
              <div key={t.title} className="text-center sm:text-left">
                <span className="text-2xl mb-2 block">{t.emoji}</span>
                <p className="font-semibold text-gray-800 mb-1 text-sm">{t.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
