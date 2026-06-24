'use client';

import dynamic from 'next/dynamic';
import { usePoseDetector } from '@/hooks/usePoseDetector';
import { PostureIssue, PoseLandmark } from '@/types';
import { useState, useCallback, useEffect } from 'react';

interface PoseDetectorProps {
  onPersistentIssues?: (issues: PostureIssue[], summary: { issues: PostureIssue[]; landmarkSnapshot: Partial<PoseLandmark>[] } | null) => void;
}

function PoseDetectorInner({ onPersistentIssues }: PoseDetectorProps) {
  const {
    enabled,
    loading,
    error,
    issues,
    startCamera,
    stopCamera,
    getPersistentIssues,
    getPostureSummary,
  } = usePoseDetector();

  const [persistentAlert, setPersistentAlert] = useState(false);

  // 检测持续性姿势问题
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const persistent = getPersistentIssues();
      if (persistent.length > 0) {
        setPersistentAlert(true);
        onPersistentIssues?.(persistent, getPostureSummary());
        // 10秒后才允许再次触发
        setTimeout(() => setPersistentAlert(false), 10000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enabled, getPersistentIssues, getPostureSummary, onPersistentIssues]);

  const handleToggle = useCallback(() => {
    if (enabled) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [enabled, startCamera, stopCamera]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📷</span>
          <h3 className="font-semibold text-gray-800 text-sm">姿态检测</h3>
          {enabled && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              检测中
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            enabled
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          } disabled:opacity-50`}
        >
          {loading ? '加载中...' : enabled ? '关闭' : '开启'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {enabled && issues.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg ${
                persistentAlert ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <span>{persistentAlert ? '⚠️' : '💡'}</span>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {enabled && issues.length === 0 && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1.5 rounded-lg mb-3">
          ✅ 姿势良好，继续保持!
        </div>
      )}

      {!enabled && !loading && (
        <p className="text-xs text-gray-400">
          开启摄像头进行实时姿态检测，所有数据纯本地处理
        </p>
      )}
    </div>
  );
}

// 动态导入，禁用 SSR（MediaPipe 需要浏览器 API）
const PoseDetector = dynamic(() => Promise.resolve(PoseDetectorInner), {
  ssr: false,
});

export default PoseDetector;
