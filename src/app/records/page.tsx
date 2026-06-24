'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TrainingRecord } from '@/types';
import TrainingCalendar from '@/components/TrainingCalendar';
import StatsChart from '@/components/StatsChart';

export default function RecordsPage() {
  const router = useRouter();
  const [records] = useLocalStorage<TrainingRecord[]>('training-records', []);

  const completedRecords = useMemo(() => records.filter((r) => r.completed), [records]);

  const recentRecords = useMemo(
    () =>
      [...records]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20),
    [records]
  );

  const courseNameMap: Record<string, string> = {
    'male-beginner': '男性入门',
    'male-intermediate': '男性进阶',
    'male-advanced': '男性强化',
    'female-beginner': '女性入门',
    'female-intermediate': '女性进阶',
    'female-advanced': '女性强化',
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between py-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 训练记录</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all"
        >
          开始新训练
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 mb-2 text-lg">还没有训练记录</p>
          <p className="text-gray-400 text-sm mb-6">完成一次训练后，记录将显示在这里</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all"
          >
            去训练
          </button>
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          {/* 日历热力图 */}
          <TrainingCalendar records={completedRecords} />

          {/* 统计图表 */}
          <StatsChart records={completedRecords} />

          {/* 最近记录 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">🕐 最近训练</h3>
            {recentRecords.length === 0 ? (
              <p className="text-xs text-gray-400">暂无完成记录</p>
            ) : (
              <div className="space-y-2">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {courseNameMap[record.courseId] || record.courseId}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(record.date).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {Math.round(record.duration / 60)} 分钟
                      </p>
                      <p className="text-xs text-emerald-500">
                        {record.completed ? '✅ 完成' : '⏸ 未完成'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 导出按钮 */}
          <div className="text-center">
            <button
              onClick={() => {
                const json = JSON.stringify(records, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `training-records-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              导出训练数据
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
