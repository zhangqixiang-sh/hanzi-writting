import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { BookOpen, Settings, Star, Flame } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const store = useStore();

  const masteredCount = Object.values(store.progress).filter((p) => p.bestStars >= 2).length;

  return (
    <div className="h-full gradient-warm-bg flex flex-col overflow-hidden">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-sunshine/10">
            <Star size={20} className="fill-star text-star" />
            <span className="text-base font-bold text-sunshine-dark">{store.totalStars}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-coral/10">
            <Flame size={20} className="text-coral" />
            <span className="text-base font-bold text-coral">{store.streakDays}天</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="btn-icon bg-card-bg shadow-card"
        >
          <Settings size={22} className="text-text-secondary" />
        </button>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Mascot */}
        <div className="animate-[float_3s_ease-in-out_infinite]">
          <img
            src="/images/hero-fox.png"
            alt="字趣小狐狸"
            className="w-48 h-48 object-contain drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-text-primary tracking-wide">
            字<span className="text-sunshine">趣</span>
          </h1>
          <p className="text-text-muted mt-2 text-lg">让写字变成一场冒险</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-2">
          <div className="text-center">
            <p className="text-3xl font-black text-sky">{store.characters.length}</p>
            <p className="text-sm text-text-muted mt-1">待练习</p>
          </div>
          <div className="w-px h-10 bg-card-border" />
          <div className="text-center">
            <p className="text-3xl font-black text-growth">{masteredCount}</p>
            <p className="text-sm text-text-muted mt-1">已掌握</p>
          </div>
          <div className="w-px h-10 bg-card-border" />
          <div className="text-center">
            <p className="text-3xl font-black text-sunshine">{store.totalStars}</p>
            <p className="text-sm text-text-muted mt-1">总星星</p>
          </div>
        </div>

        {/* Main CTA */}
        <button
          onClick={() => navigate('/practice')}
          className="btn-touch mt-4 w-72 py-5 rounded-kid-xl gradient-sunshine text-card-bg text-xl font-bold shadow-button
                     hover:shadow-glow flex items-center justify-center gap-3"
        >
          <BookOpen size={26} />
          开始练字
        </button>

        {/* Secondary actions */}
        <button
          onClick={() => navigate('/settings')}
          className="btn-touch px-6 py-3 text-base text-text-muted underline underline-offset-4 decoration-dashed"
        >
          设置练习的字
        </button>
      </div>

      {/* Bottom safe area */}
      <div className="pb-8" />
      </div>
    </div>
  );
}
