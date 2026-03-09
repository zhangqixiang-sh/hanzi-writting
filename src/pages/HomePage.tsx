import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Settings, Star, Flame, BookOpen, Award } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const store = useStore();

  const masteredCount = Object.values(store.progress).filter((p) => p.bestStars >= 2).length;
  const pendingCount = store.characters.length;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#FFF8EB', padding: '32px' }}>
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        {/* Star Counter */}
        <div className="flex items-center rounded-full bg-white shadow-sm"
             style={{
               border: '1px solid #EBDCC8',
               paddingTop: '8px',
               paddingBottom: '8px',
               paddingLeft: '16px',
               paddingRight: '16px'
             }}>
          <div style={{ marginRight: '8px' }}>
            <Star size={20} className="fill-amber-400 text-amber-400" />
          </div>
          <span className="text-lg font-medium" style={{ color: '#523B2B' }}>{store.totalStars}</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => navigate('/settings')}
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm"
          style={{ border: '1px solid #EBDCC8' }}
        >
          <Settings size={24} style={{ color: '#998778' }} />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Fox Emoji */}
        <div className="text-[120px] leading-none animate-[float_3s_ease-in-out_infinite]">
          🦊
        </div>

        {/* Title */}
        <h1 className="text-6xl font-medium" style={{ color: '#FF8800', textShadow: '0px 4px 0px rgba(230, 110, 0, 0.4)' }}>
          字趣
        </h1>

        {/* Tagline */}
        <div className="rounded-full bg-white/80 shadow-sm"
             style={{ paddingTop: '7px', paddingBottom: '7px', paddingLeft: '22px', paddingRight: '22px' }}>
          <p className="text-xl" style={{ color: '#998778' }}>让写字变成一场冒险！✨</p>
        </div>

        {/* Spacer */}
        <div className="h-4" />

        {/* Primary Button - 开始练字 */}
        <button
          onClick={() => navigate('/practice')}
          className="w-80 rounded-3xl text-white text-2xl font-medium flex items-center justify-center gap-3 shadow-lg"
          style={{
            backgroundColor: '#FF8800',
            paddingTop: '24px',
            paddingBottom: '24px',
            boxShadow: '0px 8px 0px 0px rgba(230, 110, 0, 0.2), inset 0px -6px 0px 0px rgba(245, 73, 0, 1)'
          }}
        >
          <BookOpen size={28} />
          开始练字
        </button>

        {/* Secondary Button - 设置练习的字 */}
        <button
          onClick={() => navigate('/settings')}
          className="w-80 rounded-full text-xl font-medium flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#FF8800',
            border: '2px solid #EBDCC8',
            paddingTop: '17px',
            paddingBottom: '17px',
            boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)'
          }}
        >
          设置练习的字
        </button>
      </div>

      {/* Bottom Stats Cards */}
      <div className="pb-2">
        <div className="flex items-center justify-center gap-5">
          {/* 待练习字数 */}
          <div className="flex-1 max-w-[280px] p-4 rounded-3xl bg-white flex items-center gap-4"
               style={{ border: '1px solid #EBDCC8', boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: '#DBEAFE' }}>
              <BookOpen size={24} style={{ color: '#1E88E5' }} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide" style={{ color: '#998778' }}>待练习字数</p>
              <p className="text-2xl font-medium" style={{ color: '#523B2B' }}>{pendingCount}</p>
            </div>
          </div>

          {/* 已掌握字数 */}
          <div className="flex-1 max-w-[280px] p-4 rounded-3xl bg-white flex items-center gap-4"
               style={{ border: '1px solid #EBDCC8', boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: '#DCFCE7' }}>
              <Award size={24} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide" style={{ color: '#998778' }}>已掌握字数</p>
              <p className="text-2xl font-medium" style={{ color: '#523B2B' }}>{masteredCount}</p>
            </div>
          </div>

          {/* 连续燃烧 */}
          <div className="flex-1 max-w-[280px] p-4 rounded-3xl bg-white flex items-center gap-4"
               style={{ border: '1px solid #EBDCC8', boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: '#FFEDD4' }}>
              <Flame size={24} style={{ color: '#F97316' }} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide" style={{ color: '#998778' }}>连续燃烧</p>
              <p className="text-2xl font-medium" style={{ color: '#523B2B' }}>{store.streakDays}天!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
