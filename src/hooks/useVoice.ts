'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const currentTextRef = useRef<string>('');
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // 确保 voices 加载完成 — Edge 等浏览器异步加载语音列表
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.8, pitch = 1.0) => {
      if (muted || typeof window === 'undefined' || !window.speechSynthesis) return;

      // 相同内容不重复播
      if (currentTextRef.current === text && window.speechSynthesis.speaking) return;

      // 取消当前语音，立即播新指令 — 保证显示和语音同步
      window.speechSynthesis.cancel();

      currentTextRef.current = text;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 0.7;

      const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
      const zhVoice = voices.find((v) => v.lang.startsWith('zh-CN') || v.lang.startsWith('zh-TW'));
      if (zhVoice) utterance.voice = zhVoice;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        currentTextRef.current = '';
      };
      utterance.onerror = () => {
        setSpeaking(false);
        currentTextRef.current = '';
      };

      window.speechSynthesis.speak(utterance);
    },
    [muted]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      currentTextRef.current = '';
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      if (!prev) stop();
      return !prev;
    });
  }, [stop]);

  return { speak, stop, speaking, muted, toggleMute };
}
