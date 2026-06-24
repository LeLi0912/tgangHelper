'use client';

import { useState, useCallback } from 'react';
import { PostureIssue, PostureAdvice } from '@/types';

interface AIAdviceProps {
  issues: PostureIssue[];
  landmarkSnapshot: Record<string, unknown>[];
}

export default function AIAdvice({ issues, landmarkSnapshot }: AIAdviceProps) {
  const [advice, setAdvice] = useState<PostureAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/posture-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues, landmarks: landmarkSnapshot }),
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const data: PostureAdvice = await res.json();
      setAdvice(data);

      // 语音播报建议
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const text = data.suggestions.join('。') + '。' + data.encouragement;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      setError(err.message || '获取建议失败');
    } finally {
      setLoading(false);
    }
  }, [issues, landmarkSnapshot]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
          🤖 AI 姿势建议
        </h3>
        <button
          onClick={fetchAdvice}
          disabled={loading || issues.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 disabled:opacity-50 transition-all"
        >
          {loading ? '分析中...' : '获取建议'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg mb-2">{error}</p>
      )}

      {advice && (
        <div className="space-y-3">
          {advice.issues.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">检测到的问题：</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {advice.issues.map((s, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="text-amber-500">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">改进建议：</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {advice.suggestions.map((s, i) => (
                <li key={i} className="flex gap-1">
                  <span className="text-emerald-500">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2.5">
            <p className="text-xs text-emerald-700">{advice.encouragement}</p>
          </div>
        </div>
      )}

      {!advice && !loading && issues.length === 0 && (
        <p className="text-xs text-gray-400">
          当检测到持续的姿势问题时，可以获取 AI 个性化建议
        </p>
      )}
    </div>
  );
}
