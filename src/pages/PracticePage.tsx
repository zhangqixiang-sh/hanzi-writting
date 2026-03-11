import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, recordPractice } from '@/store';
import { useHanziWriter } from '@/hooks/useHanziWriter';
import { StarRating } from '@/components/StarRating';
import { ProgressBar } from '@/components/ProgressBar';
import { Confetti } from '@/components/Confetti';
import { ArrowLeft, RotateCcw, ChevronRight, Star, Home, Pencil, Eye } from 'lucide-react';

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
    width: 320,
    height: 320,
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
      <div className="h-full flex flex-col items-center justify-center px-10 gap-6" style={{ backgroundColor: '#FFF8EB' }}>
        <p className="text-xl font-medium" style={{ color: '#523B2B' }}>还没有设置要练习的字</p>
        <button
          onClick={() => navigate('/settings')}
          className="px-10 rounded-full text-lg font-medium text-white"
          style={{ 
            backgroundColor: '#FF8800', 
            paddingTop: '20px',
            paddingBottom: '20px',
            boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)' 
          }}
        >
          去设置
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#FFF8EB' }}>
      <Confetti show={showConfetti} />

      {/* Header - 贴顶，只有左下右下圆角 */}
      <header className="flex items-center bg-white"
              style={{
                padding: '16px 24px',
                gap: '16px',
                boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)',
                border: '1px solid #EBDCC8',
                borderTop: 'none',
                borderRadius: '0 0 24px 24px',
              }}>
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FFF8EB', boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)' }}
        >
          <ArrowLeft size={24} style={{ color: '#523B2B' }} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ backgroundColor: '#FFF8EB' }}>
            <Star size={18} className="fill-amber-400 text-amber-400" />
          </div>
          <span className="text-base font-medium" style={{ color: '#FF8800' }}>{store.totalStars}</span>
        </div>
      </header>

      {/* Progress */}
      <div style={{ padding: '0 32px', marginTop: '16px' }}>
        <ProgressBar current={currentIndex + (phase === 'result' ? 1 : 0)} total={chars.length} />
      </div>

      {/* Content - 三段式布局，卡片位置固定 */}
      <div className="flex-1 flex flex-col items-center overflow-hidden" style={{ padding: '0 32px' }}>
        {/* Top zone - 固定高度，用于提示文字 */}
        <div className="flex-shrink-0 flex items-end justify-center" style={{ height: 56 }}>
          {phase === 'preview' && (
            <p className="text-2xl font-medium" style={{ color: '#998778' }}>
              一起来认识新字✨！
            </p>
          )}
        </div>

        {/* Middle zone - 田字格卡片，始终居中 */}
        <div className="relative flex-shrink-0" style={{ marginTop: 16 }}>
          <div
            className="rounded-3xl overflow-hidden bg-white"
            style={{
              width: 320,
              height: 320,
              border: '1px solid #EBDCC8',
              boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
            }}
          >
            {/* Tianzi grid background */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                   backgroundImage: `
                     linear-gradient(to right, transparent 49.5%, #E8D5B7 49.5%, #E8D5B7 50.5%, transparent 50.5%),
                     linear-gradient(to bottom, transparent 49.5%, #E8D5B7 49.5%, #E8D5B7 50.5%, transparent 50.5%),
                     linear-gradient(to bottom right, transparent calc(50% - 0.5px), #E8D5B7 calc(50% - 0.5px), #E8D5B7 calc(50% + 0.5px), transparent calc(50% + 0.5px)),
                     linear-gradient(to bottom left, transparent calc(50% - 0.5px), #E8D5B7 calc(50% - 0.5px), #E8D5B7 calc(50% + 0.5px), transparent calc(50% + 0.5px))
                   `
                 }}
            />
            <div ref={writerContainerRef} className="w-full h-full relative z-10" />
          </div>
        </div>

        {/* Bottom zone - 弹性空间，笔画进度/结果展示 */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ marginTop: 24 }}>
          {/* Stroke progress during quiz */}
          {phase === 'quiz' && strokeProgress.total > 0 && (
            <div className="flex items-center gap-2 py-2">
              {Array.from({ length: strokeProgress.total }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < strokeProgress.done
                      ? 'scale-110'
                      : ''
                  }`}
                  style={{
                    backgroundColor: i < strokeProgress.done ? '#FF8800' : '#FFE5B4'
                  }}
                />
              ))}
            </div>
          )}

          {/* Result */}
          {phase === 'result' && (
            <div className="flex flex-col items-center gap-4 animate-[bounce-in_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
              <StarRating stars={earnedStars} size={44} animated />
              <p className="text-xl font-medium" style={{ color: '#523B2B' }}>
                {earnedStars === 3 ? '太棒了！完美！' : earnedStars === 2 ? '很不错！继续加油！' : '加油，再来一次！'}
              </p>
              <p className="text-base" style={{ color: '#998778' }}>
                获得 {earnedStars} 颗星 · 错误 {mistakes} 次
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '16px 32px 32px' }}>
        {phase === 'preview' && (
          <div className="flex gap-4">
            <button
              onClick={handleAnimate}
              disabled={!isReady}
              className="flex-1 rounded-full font-medium text-lg flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#FF8800',
                border: '1px solid #EBDCC8',
                paddingTop: '20px',
                paddingBottom: '20px',
                boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
              }}
            >
              <Eye size={22} />
              看笔顺
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={!isReady}
              className="flex-1 rounded-full font-medium text-lg text-white flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#FF8800',
                paddingTop: '20px',
                paddingBottom: '20px',
                boxShadow: '0px 8px 0px 0px rgba(230, 110, 0, 0.2), inset 0px -4px 0px 0px rgba(245, 73, 0, 1)'
              }}
            >
              <Pencil size={22} />
              开始写
            </button>
          </div>
        )}

        {phase === 'quiz' && (
          <div className="flex justify-center">
            <button
              onClick={handleRetry}
              className="w-1/2 rounded-full font-medium text-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#523B2B',
                border: '1px solid #EBDCC8',
                paddingTop: '20px',
                paddingBottom: '20px',
                boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
              }}
            >
              <RotateCcw size={22} />
              重新开始
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="flex-1 rounded-full font-medium text-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#523B2B',
                border: '2px solid #EBDCC8',
                paddingTop: '20px',
                paddingBottom: '20px'
              }}
            >
              <RotateCcw size={20} />
              再写一次
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-full font-medium text-lg text-white flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FF8800',
                paddingTop: '20px',
                paddingBottom: '20px',
                boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
              }}
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
  );
}
