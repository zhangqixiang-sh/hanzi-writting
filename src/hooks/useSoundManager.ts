import { useCallback, useMemo, useState } from 'react';

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export interface SoundManager {
  correct: () => void;
  wrong: () => void;
  complete: () => void;
  click: () => void;
}

export function useSoundManager(): { soundEnabled: boolean; toggleSound: () => void; soundManager: SoundManager } {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('hanzi-sound-enabled');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const savePreference = useCallback((enabled: boolean) => {
    try {
      localStorage.setItem('hanzi-sound-enabled', JSON.stringify(enabled));
    } catch { /* ignore */ }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev: boolean) => {
      const newValue = !prev;
      savePreference(newValue);
      return newValue;
    });
  }, [savePreference]);

  const soundManager: SoundManager = useMemo(() => ({
    // 正确笔画音效 - 清脆的"叮"
    correct: () => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880; // A5
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) { }
    },

    // 错误笔画音效 - 低沉的"咚"
    wrong: () => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 300;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) { }
    },

    // 完成练习音效 - 欢快的和弦
    complete: () => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        // C大调和弦: C-E-G-C
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'triangle';
          const start = ctx.currentTime + i * 0.08;
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
          osc.start(start);
          osc.stop(start + 0.4);
        });
      } catch (e) { }
    },

    // 按钮点击音效
    click: () => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
      } catch (e) { }
    },
  }), [soundEnabled]);

  return { soundEnabled, toggleSound, soundManager };
}
