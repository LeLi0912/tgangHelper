'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { PoseLandmark, PostureIssue } from '@/types';

interface PoseDetectorState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  landmarks: PoseLandmark[] | null;
  issues: PostureIssue[];
}

// 简化版姿势分析 — 无需加载完整的 MediaPipe，先做基本检测
// MediaPipe Pose 通过动态导入加载
export function usePoseDetector() {
  const [state, setState] = useState<PoseDetectorState>({
    enabled: false,
    loading: false,
    error: null,
    landmarks: null,
    issues: [],
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const issuesHistoryRef = useRef<PostureIssue[][]>([]);

  // 分析姿态，检测问题
  const analyzePose = useCallback((landmarks: PoseLandmark[]): PostureIssue[] => {
    if (!landmarks || landmarks.length < 25) return [];

    const issues: PostureIssue[] = [];

    // 关键点索引 (MediaPipe Pose 33点模型)
    // 0: nose, 11: left shoulder, 12: right shoulder
    // 23: left hip, 24: right hip
    // 7: left ear, 8: right ear
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const nose = landmarks[0];
    const leftEar = landmarks[7];

    if (!leftShoulder || !rightShoulder || leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
      return issues;
    }

    // 1. 检测耸肩 (shoulder elevation asymmetry vs hip)
    if (leftHip && rightHip && leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
      const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const hipHeightDiff = Math.abs(leftHip.y - rightHip.y);

      if (shoulderHeightDiff > 0.05 && hipHeightDiff < 0.03) {
        issues.push({
          type: 'shoulder_uneven',
          severity: Math.min(shoulderHeightDiff * 10, 1),
          message: '双肩不平衡，请放松肩膀保持水平',
        });
      }
    }

    // 2. 检测身体歪斜 (mid-shoulder vs mid-hip)
    if (leftHip && rightHip && leftHip.visibility > 0.5) {
      const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
      const hipMidX = (leftHip.x + rightHip.x) / 2;
      const bodyOffset = Math.abs(shoulderMidX - hipMidX);

      if (bodyOffset > 0.08) {
        issues.push({
          type: 'body_tilt',
          severity: Math.min(bodyOffset * 5, 1),
          message: '身体歪斜，请调整坐姿/站姿，保持脊柱直立',
        });
      }
    }

    // 3. 检测驼背/头前伸
    if (nose && leftEar && leftShoulder && nose.visibility > 0.5 && leftEar.visibility > 0.5) {
      // 头前伸：耳朵相对于肩膀太靠前
      const headForward = leftShoulder.x - leftEar.x;
      if (headForward > 0.1) {
        issues.push({
          type: 'head_forward',
          severity: Math.min(headForward * 5, 1),
          message: '头部前伸，请收下巴，头部向后靠',
        });
      }

      // 驼背：肩膀相对于髋部前倾
      if (leftHip && leftHip.visibility > 0.5) {
        const shoulderSlouch = leftShoulder.x - leftHip.x;
        if (shoulderSlouch > 0.08) {
          issues.push({
            type: 'slouch',
            severity: Math.min(shoulderSlouch * 6, 1),
            message: '检测到驼背，请挺胸收腹，打开肩膀',
          });
        }
      }
    }

    return issues;
  }, []);

  const startCamera = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      videoRef.current = document.createElement('video');
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', '');
      await videoRef.current.play();

      // 动态加载 MediaPipe
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );

      const detector = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      detectorRef.current = detector;

      setState((prev) => ({ ...prev, enabled: true, loading: false }));
    } catch (err: any) {
      console.error('Camera/MediaPipe init error:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || '摄像头或姿态检测初始化失败',
      }));
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectorRef.current = null;
    videoRef.current = null;
    setState((prev) => ({ ...prev, enabled: false, landmarks: null, issues: [] }));
  }, []);

  // 检测循环
  useEffect(() => {
    if (!state.enabled) return;

    let running = true;

    const detect = async () => {
      if (!running) return;

      const video = videoRef.current;
      const detector = detectorRef.current;

      if (video && detector && video.readyState >= 2) {
        try {
          const results = detector.detectForVideo(video, performance.now());
          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks: PoseLandmark[] = results.landmarks[0];
            setState((prev) => {
              // 简化：避免 state 函数内用 landmarks 闭包问题
              const currentIssues = analyzePose(landmarks);
              // 累积姿势问题用于判断持续性
              issuesHistoryRef.current.push(currentIssues);
              if (issuesHistoryRef.current.length > 30) {
                issuesHistoryRef.current.shift();
              }
              return { ...prev, landmarks, issues: currentIssues };
            });
          }
        } catch (e) {
          // 忽略单帧检测错误
        }
      }

      if (running) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    };

    detect();

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state.enabled, analyzePose]);

  // 判断是否有持续性姿势问题 (过去30帧中某类问题出现超过60%)
  const getPersistentIssues = useCallback((): PostureIssue[] => {
    const history = issuesHistoryRef.current;
    if (history.length < 10) return [];

    const issueCounts: Record<string, number> = {};
    history.forEach((frame) => {
      const types = new Set(frame.map((i) => i.type));
      types.forEach((t) => {
        issueCounts[t] = (issueCounts[t] || 0) + 1;
      });
    });

    const threshold = history.length * 0.6;
    const persistentTypes = Object.entries(issueCounts)
      .filter(([, count]) => count >= threshold)
      .map(([type]) => type);

    // 返回最近一帧中的持续性问题
    const latestFrame = history[history.length - 1];
    return latestFrame.filter((i) => persistentTypes.includes(i.type));
  }, []);

  // 获取用于发送给 AI 的姿势摘要数据
  const getPostureSummary = useCallback((): { issues: PostureIssue[]; landmarkSnapshot: Partial<PoseLandmark>[] } | null => {
    if (!state.landmarks) return null;

    const relevantIndices = [0, 7, 8, 11, 12, 23, 24];
    const landmarkSnapshot = relevantIndices.map((i) => {
      const lm = state.landmarks![i];
      return lm
        ? { x: parseFloat(lm.x.toFixed(3)), y: parseFloat(lm.y.toFixed(3)), z: parseFloat(lm.z.toFixed(3)), visibility: parseFloat(lm.visibility.toFixed(3)) }
        : { x: 0, y: 0, z: 0, visibility: 0 };
    });

    return {
      issues: getPersistentIssues(),
      landmarkSnapshot,
    };
  }, [state.landmarks, getPersistentIssues]);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    getPersistentIssues,
    getPostureSummary,
  };
}
