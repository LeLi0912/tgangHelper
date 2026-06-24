'use client';

import { useMemo } from 'react';
import { TrainingRecord } from '@/types';

interface TrainingCalendarProps {
  records: TrainingRecord[];
}

export default function TrainingCalendar({ records }: TrainingCalendarProps) {
  const { months, heatmapData, streak } = useMemo(() => {
    // 按日期分组
    const byDate: Record<string, TrainingRecord[]> = {};
    records.forEach((r) => {
      const date = r.date.split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(r);
    });

    // 最近90天的数据
    const days: { date: string; count: number; duration: number }[] = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayRecords = byDate[key] || [];
      days.push({
        date: key,
        count: dayRecords.length,
        duration: dayRecords.reduce((s, r) => s + r.duration, 0),
      });
    }

    // 连续训练天数
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else break;
    }

    // 按月份分组
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const months = days.reduce((acc, day) => {
      const d = new Date(day.date);
      const key = monthNames[d.getMonth()];
      if (!acc[key]) acc[key] = [];
      acc[key].push(day);
      return acc;
    }, {} as Record<string, typeof days>);

    return { months, heatmapData: days, streak };
  }, [records]);

  const getIntensity = (duration: number) => {
    if (duration === 0) return 'bg-gray-100';
    if (duration < 180) return 'bg-green-200';
    if (duration < 420) return 'bg-green-400';
    if (duration < 720) return 'bg-emerald-500';
    return 'bg-emerald-700';
  };

  const totalSessions = records.filter((r) => r.completed).length;
  const totalMinutes = Math.round(records.reduce((s, r) => s + r.duration, 0) / 60);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">📅 训练日历</h3>

      {/* 统计摘要 */}
      <div className="flex gap-4 mb-5">
        <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-700">{totalSessions}</div>
          <div className="text-xs text-emerald-600">完成次数</div>
        </div>
        <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{totalMinutes}</div>
          <div className="text-xs text-blue-600">累计分钟</div>
        </div>
        <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-700">{streak}</div>
          <div className="text-xs text-amber-600">连续天数</div>
        </div>
      </div>

      {/* 热力图 */}
      <div className="space-y-3">
        {Object.entries(months).map(([month, days]) => (
          <div key={month}>
            <div className="text-xs text-gray-400 mb-1">{month}</div>
            <div className="flex gap-1">
              {days.map((day) => (
                <div
                  key={day.date}
                  className={`flex-1 aspect-square rounded-sm ${getIntensity(day.duration)}`}
                  title={`${day.date}: ${Math.round(day.duration / 60)}分钟`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100" />
        <div className="w-3 h-3 rounded-sm bg-green-200" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <div className="w-3 h-3 rounded-sm bg-emerald-700" />
        <span>多</span>
      </div>
    </div>
  );
}
