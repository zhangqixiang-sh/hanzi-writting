import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, recordPractice } from '@/store';
import { useHanziWriter } from '@/hooks/useHanziWriter';
import { StarRating } from '@/components/StarRating';
import { ProgressBar } from '@/components/ProgressBar';
import { Confetti } from '@/components/Confetti';
import { ArrowLeft, RotateCcw, ChevronRight, Star, Home, Play } from 'lucide-react';

type PracticePhase = 'writing' | 'result';

// 田字格背景组件
function TianziGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-3xl overflow-hidden bg-white ${className}`}
         style={{
           border: '1px solid #EBDCC8',
           boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
         }}>
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
      <div className="w-full h-full relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function PracticePage() {
  const navigate = useNavigate();
  const store = useStore();
  const chars = store.characters;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('writing');
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [strokeProgress, setStrokeProgress] = useState({ done: 0, total: 0 });
  const [showReplayBtn, setShowReplayBtn] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const currentChar = chars[currentIndex] || '大';
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const writingContainerRef = useRef<HTMLDivElement>(null);

  // 左边：动画展示
  const { isReady: isAnimReady, animateStroke } = useHanziWriter(animationContainerRef, {
    character: currentChar,
    width: 180,
    height: 180,
    strokeColor: '#3E2723',
    outlineColor: '#E0D5C8',
    showOutline: true,
  });

  // 右边：书写练习
  const { isReady: isWriteReady, startQuiz, reset } = useHanziWriter(writingContainerRef, {
    character: currentChar,
    width: 180,
    height: 180,
    strokeColor: '#3E2723',
    outlineColor: '#E0D5C8',
    showHintAfterMisses: 3,
    leniency: 1.2,
    highlightOnComplete: true,
  });

  // 自动播放笔顺动画（只播放一次）
  useEffect(() => {
    if (!isAnimReady) return;
    
    setShowReplayBtn(false);
    animateStroke();
    
    // 动画完成后显示再看一次按钮
    const timer = setTimeout(() => {
      setShowReplayBtn(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isAnimReady, animateStroke, currentIndex]);

  // 再看一次动画
  const handleReplayAnimation = useCallback(() => {
    setShowReplayBtn(false);
    animateStroke();
    
    // 动画完成后再次显示按钮
    setTimeout(() => {
      setShowReplayBtn(true);
    }, 2000);
  }, [animateStroke]);

  // 自动开始书写练习
  useEffect(() => {
    if (!isWriteReady || phase !== 'writing') return;
    
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
  }, [isWriteReady, phase, startQuiz, currentChar, retryKey]);

  // Reset when character changes
  useEffect(() => {
    setPhase('writing');
    setMistakes(0);
    setEarnedStars(0);
    setStrokeProgress({ done: 0, total: 0 });
    setShowReplayBtn(false);
  }, [currentIndex]);

  const handleRetry = useCallback(() => {
    reset();
    setPhase('writing');
    setMistakes(0);
    setEarnedStars(0);
    setStrokeProgress({ done: 0, total: 0 });
    setRetryKey(k => k + 1);
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
      <div style={{ padding: '0 32px', marginTop: '8px' }}>
        <ProgressBar current={currentIndex + (phase === 'result' ? 1 : 0)} total={chars.length} />
      </div>

      {/* Action Buttons - 放在进度条下方，固定高度避免抖动 */}
      <div style={{ padding: '12px 32px 0', height: 56 }}>
        {phase === 'writing' ? (
          <div className="flex justify-center h-full">
            <button
              onClick={handleRetry}
              className="w-1/2 h-full rounded-full font-medium text-base flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#523B2B',
                border: '2px solid #EBDCC8',
                boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
              }}
            >
              <RotateCcw size={18} />
              重新开始
            </button>
          </div>
        ) : (
          <div className="flex gap-3 h-full">
            <button
              onClick={handleRetry}
              className="flex-1 h-full rounded-full font-medium text-base flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#523B2B',
                border: '2px solid #EBDCC8'
              }}
            >
              <RotateCcw size={16} />
              再写一次
            </button>
            <button
              onClick={handleNext}
              className="flex-1 h-full rounded-full font-medium text-base text-white flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FF8800',
                boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
              }}
            >
              {currentIndex < chars.length - 1 ? (
                <>
                  下一个
                  <ChevronRight size={18} />
                </>
              ) : (
                <>
                  <Home size={16} />
                  完成
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content - 两个田字格并排 */}
      <div className="flex-1 flex flex-col items-center overflow-hidden" style={{ padding: '0 32px' }}>
        {/* Top zone - 提示文字 */}
        <div className="flex-shrink-0 flex items-end justify-center" style={{ height: 48, marginTop: 16 }}>
          <p className="text-2xl font-medium" style={{ color: '#998778' }}>
            {phase === 'result' ? '练习完成！' : '一起来认识新字✨！'}
          </p>
        </div>

        {/* Middle zone - 两个田字格并排 */}
        <div className="flex-shrink-0 flex items-start justify-center gap-4" style={{ marginTop: 12 }}>
          {/* 左边：动画田字格 */}
          <div className="flex flex-col items-center gap-3">
            <TianziGrid className="w-[180px] h-[180px]">
              <div ref={animationContainerRef} className="w-full h-full" />
            </TianziGrid>
            <span className="text-sm font-medium" style={{ color: '#998778' }}>看笔顺</span>
            {/* 再看一次按钮 */}
            <button
              onClick={handleReplayAnimation}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                showReplayBtn ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#FF8800',
                padding: '4px 10px',
                border: '1px solid #EBDCC8',
                boxShadow: '0px 2px 0px 0px rgba(230, 110, 0, 0.2)'
              }}
            >
              <Play size={14} />
              再看一次
            </button>
          </div>

          {/* 右边：书写田字格 */}
          <div className="flex flex-col items-center gap-2">
            <TianziGrid className="w-[180px] h-[180px]">
              <div ref={writingContainerRef} className="w-full h-full" />
            </TianziGrid>
            <span className="text-sm font-medium" style={{ color: '#998778' }}>开始写</span>
            {/* 占位符，保持两边对齐 */}
            <div className="h-[34px]" />
          </div>
        </div>

        {/* Bottom zone - 笔画进度/结果展示 */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ marginTop: 16 }}>
          {/* Stroke progress during writing */}
          {phase === 'writing' && strokeProgress.total > 0 && (
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
    </div>
  );
}
