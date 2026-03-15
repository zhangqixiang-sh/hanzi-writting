import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, setCharacters } from '@/store';
import { useSoundManager } from '@/hooks/useSoundManager';
import { ArrowLeft, Plus, X, Star, Save, Volume2, VolumeX } from 'lucide-react';

const PRESET_GROUPS = [
  { label: '一年级上册', chars: '一二三四五六七八九十天地人你我他大小多少', icon: '📚' },
  { label: '一年级下册', chars: '春风花飞入姓什么双国王方青清气晴情请生字左右红时动万', icon: '📖' },
  { label: '基础常用字', chars: '的了是不在有这个上中下大小人我他出来到要说对可里面开好很', icon: '✏️' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const store = useStore();
  const { soundEnabled, toggleSound, soundManager } = useSoundManager();
  const [inputValue, setInputValue] = useState('');
  const [chars, setChars] = useState<string[]>([...store.characters]);

  const masteredCount = Object.values(store.progress).filter((p) => p.bestStars >= 2).length;

  const handleAddChars = () => {
    soundManager.click();
    if (!inputValue.trim()) return;
    const newChars = inputValue.match(/[\u4e00-\u9fff]/g) || [];
    if (newChars.length === 0) return;
    const merged = [...new Set([...chars, ...newChars])];
    setChars(merged);
    setInputValue('');
  };

  const handleRemoveChar = (char: string) => {
    soundManager.click();
    setChars(chars.filter((c) => c !== char));
  };

  const handleAddPreset = (presetChars: string) => {
    soundManager.click();
    const newChars = presetChars.split('');
    const merged = [...new Set([...chars, ...newChars])];
    setChars(merged);
  };

  const handleClearAll = () => {
    soundManager.click();
    setChars([]);
  };

  const handleSave = () => {
    soundManager.click();
    setCharacters(chars);
    navigate(-1);
  };

  const handleToggleSound = () => {
    toggleSound();
    // Play a test sound when enabling
    if (!soundEnabled) {
      setTimeout(() => soundManager.click(), 50);
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#FFF8EB' }}
    >
      {/* Header - 贴顶，只有左下右下圆角 */}
      <header
        className="flex items-center justify-between bg-white"
        style={{
          padding: '16px 24px',
          boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)',
          border: '1px solid #EBDCC8',
          borderTop: 'none',
          borderRadius: '0 0 24px 24px',
        }}
      >
        <button
          onClick={() => { soundManager.click(); navigate(-1); }}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FFF8EB', boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)' }}
        >
          <ArrowLeft size={24} style={{ color: '#523B2B' }} />
        </button>

        <div className="flex items-center" style={{ gap: '16px' }}>
          {/* 音效开关 */}
          <button
            onClick={handleToggleSound}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: soundEnabled ? '#FFF8EB' : '#F5EDDE',
              boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)',
            }}
            title={soundEnabled ? '关闭音效' : '开启音效'}
          >
            {soundEnabled ? (
              <Volume2 size={20} style={{ color: '#FF8800' }} />
            ) : (
              <VolumeX size={20} style={{ color: '#998778' }} />
            )}
          </button>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            className="flex items-center rounded-full text-sm font-medium"
            style={{
              backgroundColor: '#FF8800',
              color: 'white',
              padding: '8px 16px',
              gap: '6px',
            }}
          >
            <Save size={16} />
            保存
          </button>

          <div className="flex items-center" style={{ gap: '8px' }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFF8EB' }}
            >
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="text-base font-medium" style={{ color: '#FF8800' }}>
              {store.totalStars}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '24px 32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Input */}
          <div
            className="rounded-3xl bg-white"
            style={{
              padding: '32px',
              border: '1px solid #EBDCC8',
              boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)',
            }}
          >
            {/* Section Header */}
            <div className="flex items-center" style={{ gap: '12px', marginBottom: '12px' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: 'rgba(255, 136, 0, 0.2)', color: '#FF8800' }}
              >
                1
              </div>
              <h2 className="text-xl font-medium" style={{ color: '#523B2B' }}>
                输入要练习的汉字
              </h2>
            </div>

            {/* Hint */}
            <div className="flex items-center" style={{ gap: '8px', marginBottom: '24px' }}>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#EBDCC8' }}
              >
                <span className="text-xs" style={{ color: '#998778' }}>i</span>
              </div>
              <p className="text-sm" style={{ color: '#998778' }}>
                支持一次输入多个汉字，例如"春天花开"，系统会自动拆分。
              </p>
            </div>

            {/* Input Area */}
            <div className="flex" style={{ gap: '16px', marginBottom: '24px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChars()}
                placeholder="在这里输入汉字..."
                className="flex-1 rounded-full text-lg"
                style={{
                  backgroundColor: '#F5EDDE',
                  border: '1px solid #EBDCC8',
                  color: '#523B2B',
                  padding: '12px 24px',
                  opacity: inputValue ? 1 : 0.5,
                }}
              />
              <button
                onClick={handleAddChars}
                className="rounded-full text-base font-medium text-white flex items-center flex-shrink-0"
                style={{
                  backgroundColor: '#FF8800',
                  padding: '12px 24px',
                  gap: '8px',
                  opacity: inputValue ? 1 : 0.5,
                }}
              >
                <Plus size={20} />
                添加
              </button>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #EBDCC8', marginBottom: '24px' }} />

            {/* Quick Add */}
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#998778', marginBottom: '16px' }}>
                快速添加常见字库
              </p>
              <div className="flex flex-wrap" style={{ gap: '12px' }}>
                {PRESET_GROUPS.map((group) => (
                  <button
                    key={group.label}
                    onClick={() => handleAddPreset(group.chars)}
                    className="rounded-full text-base font-medium flex items-center"
                    style={{
                      backgroundColor: 'rgba(255, 204, 0, 0.1)',
                      border: '1px solid rgba(255, 204, 0, 0.3)',
                      color: '#995E00',
                      padding: '10px 20px',
                      gap: '8px',
                    }}
                  >
                    <Plus size={16} />
                    {group.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Current List */}
          <div
            className="rounded-3xl bg-white"
            style={{
              padding: '32px',
              border: '1px solid #EBDCC8',
              boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)',
            }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <div>
                <div className="flex items-center" style={{ gap: '12px', marginBottom: '8px' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'rgba(255, 136, 0, 0.2)', color: '#FF8800' }}
                  >
                    2
                  </div>
                  <h2 className="text-xl font-medium" style={{ color: '#523B2B' }}>
                    当前练习列表
                  </h2>
                </div>
                <p className="text-sm" style={{ color: '#998778', marginLeft: '44px' }}>
                  共{chars.length}个汉字 ({masteredCount}个已掌握)
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="rounded-full text-sm font-medium"
                style={{ color: '#FF5A5A', padding: '8px 16px' }}
              >
                清空全部
              </button>
            </div>

            {/* Character Cards */}
            {chars.length === 0 ? (
              <p className="text-center" style={{ color: '#998778', padding: '40px 0' }}>
                还没有添加任何字，快来添加吧！
              </p>
            ) : (
              <div className="flex flex-wrap" style={{ gap: '16px' }}>
                {chars.map((char) => {
                  const progress = store.progress[char];
                  const isMastered = progress && progress.bestStars >= 2;
                  return (
                    <div key={char} className="relative group">
                      <div
                        className="flex items-center justify-center text-3xl font-medium"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '24px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #EBDCC8',
                          boxShadow: '0px 4px 0px 0px rgba(230, 110, 0, 0.2)',
                          color: '#523B2B',
                          fontFamily: 'KaiTi, STKaiti, Kai, 楷体, serif',
                        }}
                      >
                        {char}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            opacity: 0.1,
                            backgroundImage: `
                              linear-gradient(to right, transparent 49.5%, #000 49.5%, #000 50.5%, transparent 50.5%),
                              linear-gradient(to bottom, transparent 49.5%, #000 49.5%, #000 50.5%, transparent 50.5%)
                            `,
                            borderRadius: '24px',
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveChar(char)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#FF5A5A', color: 'white' }}
                      >
                        <X size={12} />
                      </button>

                      {isMastered && (
                        <div
                          className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#FFCC00', boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}
                        >
                          <Star size={12} className="fill-white text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
