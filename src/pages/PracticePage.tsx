import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, recordPractice } from '@/store';
import { useHanziWriter } from '@/hooks/useHanziWriter';
import { StarRating } from '@/components/StarRating';
import { ProgressBar } from '@/components/ProgressBar';
import { Confetti } from '@/components/Confetti';
import { ArrowLeft, Play, RotateCcw, ChevronRight, Star, Home } from 'lucide-react';

type PracticePhase = 'preview' | 'quiz' | 'result';

export default function PracticePage() {
  const navigate = useNavigate();
  const store = useStore();
  const chars = store.characters;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('preview');
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [strokeProgress, setStrokeProgress] = useState({ done: 0, total: 0 });

  const currentChar = chars[currentIndex] || '大';
  const writerContainerRef = useRef<HTMLDivElement>(null);

  const { isReady, animateStroke, startQuiz, reset } = useHanziWriter(writerContainerRef, {
    character: currentChar,
    width: 280,
    height: 280,
    strokeColor: '#3E2723',
    outlineColor: '#E0D5C8',
    showHintAfterMisses: 3,
    leniency: 1.2,
    highlightOnComplete: true,
  });

  // Reset phase when character changes
  useEffect(() => {
    setPhase('preview');
    setMistakes(0);
    setEarnedStars(0);
    setStrokeProgress({ done: 0, total: 0 });
  }, [currentIndex]);

  const handleAnimate = useCallback(() => {
    animateStroke();
  }, [animateStroke]);

  const handleStartQuiz = useCallback(() => {
    setPhase('quiz');
    setMistakes(0);
    setStrokeProgress({ done: 0, total: 0 });

    startQuiz({
      onCorrectStroke: (data) => {
        setStrokeProgress({
          done: data.strokeNum + 1,
          total: data.strokeNum + 1 + data.strokesRemaining,
        });
      },
      onMistake: (data) => {
        setMistakes(data.totalMistakes);
        setStrokeProgress({
          done: data.strokeNum,
          total: data.strokeNum + data.strokesRemaining + 1,
        });
      },
      onComplete: (data) => {
        const totalMistakes = data.totalMistakes;
        let stars = 3;
        if (totalMistakes >= 1 && totalMistakes <= 3) stars = 2;
        else if (totalMistakes > 3) stars = 1;

        setEarnedStars(stars);
        setPhase('result');
        recordPractice(currentChar, stars, totalMistakes);

        if (stars === 3) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      },
    });
  }, [startQuiz, currentChar]);

  const handleRetry = useCallback(() => {
    reset();
    setPhase('preview');
    setMistakes(0);
    setEarnedStars(0);
    setStrokeProgress({ done: 0, total: 0 });
  }, [reset]);

  const handleNext = useCallback(() => {
    if (currentIndex < chars.length - 1) {
      reset();
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/');
    }
  }, [currentIndex, chars.length, navigate, reset]);

  if (chars.length === 0) {
    return (
      <div className="h-full gradient-warm-bg flex flex-col items-center justify-center px-10 gap-6">
        <p className="text-xl text-text-secondary font-bold">还没有设置要练习的字</p>
        <button
          onClick={() => navigate('/settings')}
          className="btn-touch px-10 py-4 rounded-kid-xl gradient-sunshine text-card-bg text-lg font-bold shadow-button"
        >
          去设置
        </button>
      </div>
    );
  }

  return (
    <div className="h-full gradient-warm-bg flex flex-col overflow-hidden">
      <Confetti show={showConfetti} />

      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 pt-8 pb-3">
        <button
          onClick={() => navigate('/')}
          className="btn-icon bg-card-bg shadow-card"
        >
          <ArrowLeft size={22} className="text-text-secondary" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-sunshine/10">
          <Star size={18} className="fill-star text-star" />
          <span className="text-base font-bold text-text-primary">{store.totalStars}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="px-8 pb-4">
        <ProgressBar current={currentIndex + (phase === 'result' ? 1 : 0)} total={chars.length} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* Character info */}
        <div className="text-center animate-[fade-in_0.4s_ease-out]">
          <span className="text-5xl font-kai font-bold text-text-primary">
            {currentChar}
          </span>
        </div>

        {/* Writer Area - 田字格 */}
        <div className="relative">
          <div
            className="tian-zi-ge rounded-kid-lg overflow-hidden bg-card-bg"
            style={{ width: 280, height: 280 }}
          >
            <div ref={writerContainerRef} className="w-full h-full" />
          </div>

          {/* Phase indicator */}
          {phase === 'quiz' && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-pill bg-sky text-card-bg text-sm font-bold shadow-sm">
              跟着写吧！
            </div>
          )}
          {phase === 'quiz' && mistakes > 0 && (
            <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-pill bg-coral/90 text-card-bg text-sm font-bold">
              错误 {mistakes} 次
            </div>
          )}
        </div>

        {/* Stroke progress during quiz */}
        {phase === 'quiz' && strokeProgress.total > 0 && (
          <div className="flex items-center gap-1.5 py-2">
            {Array.from({ length: strokeProgress.total }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < strokeProgress.done
                    ? 'bg-growth scale-110'
                    : 'bg-card-border'
                }`}
              />
            ))}
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="flex flex-col items-center gap-4 animate-[bounce-in_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
            <StarRating stars={earnedStars} size={44} animated />
            <p className="text-xl font-bold text-text-primary">
              {earnedStars === 3 ? '太棒了！完美！' : earnedStars === 2 ? '很不错！继续加油！' : '加油，再来一次！'}
            </p>
            <p className="text-base text-text-muted">
              获得 {earnedStars} 颗星 · 错误 {mistakes} 次
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-8 pb-10 pt-4">
        {phase === 'preview' && (
          <div className="flex gap-4">
            <button
              onClick={handleAnimate}
              disabled={!isReady}
              className="btn-touch flex-1 py-4.5 rounded-kid-xl gradient-sky text-card-bg font-bold text-lg
                         shadow-sm flex items-center justify-center gap-2.5
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={22} />
              看笔顺
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={!isReady}
              className="btn-touch flex-1 py-4.5 rounded-kid-xl gradient-sunshine text-card-bg font-bold text-lg
                         shadow-button flex items-center justify-center gap-2.5
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始写
            </button>
          </div>
        )}

        {phase === 'quiz' && (
          <button
            onClick={handleRetry}
            className="btn-touch w-full py-4.5 rounded-kid-xl bg-card-bg border-2 border-card-border text-text-secondary font-bold text-lg
                       flex items-center justify-center gap-2.5"
          >
            <RotateCcw size={22} />
            重新开始
          </button>
        )}

        {phase === 'result' && (
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="btn-touch flex-1 py-4.5 rounded-kid-xl bg-card-bg border-2 border-card-border text-text-secondary font-bold text-lg
                         flex items-center justify-center gap-2.5"
            >
              <RotateCcw size={20} />
              再写一次
            </button>
            <button
              onClick={handleNext}
              className="btn-touch flex-1 py-4.5 rounded-kid-xl gradient-sunshine text-card-bg font-bold text-lg
                         shadow-button flex items-center justify-center gap-2.5"
            >
              {currentIndex < chars.length - 1 ? (
                <>
                  下一个
                  <ChevronRight size={22} />
                </>
              ) : (
                <>
                  <Home size={20} />
                  完成
                </>
              )}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
