'use client';

import { useMemo } from 'react';
import { TrainingRecord } from '@/types';

interface StatsChartProps {
  records: TrainingRecord[];
}

export default function StatsChart({ records }: StatsChartProps) {
  const weeklyData = useMemo(() => {
    const weeks: { label: string; duration: number; sessions: number }[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);

      const weekRecords = records.filter((r) => {
        const d = new Date(r.date);
        return d >= start && d < end;
      });

      const label = `${start.getMonth() + 1}/${start.getDate()}`;
      weeks.push({
        label,
        duration: weekRecords.reduce((s, r) => s + r.duration, 0),
        sessions: weekRecords.filter((r) => r.completed).length,
      });
    }

    return weeks;
  }, [records]);

  const maxDuration = Math.max(...weeklyData.map((w) => w.duration), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">📊 每周统计</h3>

      {/* 柱状图 */}
      <div className="flex items-end gap-2 h-40 mb-2">
        {weeklyData.map((week) => (
          <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all"
                style={{
                  height: `${(week.duration / maxDuration) * 140}px`,
                  minHeight: week.duration > 0 ? '4px' : '0',
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{week.label}</span>
          </div>
        ))}
      </div>

      {/* 每周详情 */}
      <div className="space-y-1.5 mt-3">
        {weeklyData.map((week, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-gray-500">
            <span>{week.label} 周</span>
            <span>
              {week.sessions} 次 · {Math.round(week.duration / 60)} 分钟
            </span>
          </div>
        ))}
      </div>

      {/* 训练分布 */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">训练类型分布</h4>
        <TrainingDistribution records={records} />
      </div>
    </div>
  );
}

function TrainingDistribution({ records }: { records: TrainingRecord[] }) {
  const distribution = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      map[r.courseId] = (map[r.courseId] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [records]);

  if (distribution.length === 0) {
    return <p className="text-xs text-gray-400">暂无训练数据</p>;
  }

  const max = distribution[0][1];
  const labels: Record<string, string> = {
    'male-beginner': '男性入门',
    'male-intermediate': '男性进阶',
    'male-advanced': '男性强化',
    'female-beginner': '女性入门',
    'female-intermediate': '女性进阶',
    'female-advanced': '女性强化',
  };

  return (
    <div className="space-y-2">
      {distribution.map(([id, count]) => (
        <div key={id} className="flex items-center gap-2">
          <span className="text-xs text-gray-600 w-20 truncate">{labels[id] || id}</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}
