import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, setCharacters } from '@/store';
import { ArrowLeft, Plus, X, Trash2, RotateCcw } from 'lucide-react';

const DEFAULT_CHARACTERS = ['大', '小', '上', '下', '人', '口', '手', '日', '月', '水'];

const PRESET_GROUPS = [
  { label: '一年级上', chars: '一二三四五六七八九十天地人你我他大小多少' },
  { label: '一年级下', chars: '春风花飞入姓什么双国王方青清气晴情请生字左右红时动万' },
  { label: '常用字', chars: '的了是不在有这个上中下大小人我他出来到要说对可里面开好很' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const store = useStore();
  const [inputValue, setInputValue] = useState('');
  const [chars, setChars] = useState<string[]>([...store.characters]);

  const handleAddChars = () => {
    if (!inputValue.trim()) return;
    // Extract only Chinese characters
    const newChars = inputValue.match(/[\u4e00-\u9fff]/g) || [];
    if (newChars.length === 0) return;
    // Deduplicate
    const merged = [...new Set([...chars, ...newChars])];
    setChars(merged);
    setInputValue('');
  };

  const handleRemoveChar = (char: string) => {
    setChars(chars.filter((c) => c !== char));
  };

  const handleAddPreset = (presetChars: string) => {
    const newChars = presetChars.split('');
    const merged = [...new Set([...chars, ...newChars])];
    setChars(merged);
  };

  const handleClearAll = () => {
    setChars([]);
  };

  const handleReset = () => {
    setChars([...DEFAULT_CHARACTERS]);
  };

  const handleSave = () => {
    setCharacters(chars);
    navigate(-1);
  };

  const hasChanges = JSON.stringify(chars) !== JSON.stringify(store.characters);

  return (
    <div className="h-full gradient-warm-bg flex flex-col overflow-hidden">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-icon bg-card-bg shadow-card"
        >
          <ArrowLeft size={22} className="text-text-secondary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary">设置练习的字</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`btn-touch px-6 py-3 rounded-pill text-base font-bold transition-all
            ${hasChanges
              ? 'gradient-sunshine text-card-bg shadow-button'
              : 'bg-card-border text-text-muted cursor-not-allowed'}`}
        >
          保存
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">
        {/* Input Area */}
        <div className="card-section">
          <label className="text-base font-bold text-text-primary block mb-2">
            输入要练习的汉字
          </label>
          <p className="text-sm text-text-muted mb-4">
            可以一次输入多个汉字，如 "春天花开"，系统会自动拆分
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChars()}
              placeholder="在这里输入汉字..."
              className="flex-1 px-5 py-3.5 rounded-kid bg-bg-warm border-2 border-card-border
                         text-text-primary text-lg placeholder:text-text-muted
                         focus:outline-none focus:border-sunshine transition-colors font-kai"
            />
            <button
              onClick={handleAddChars}
              className="btn-touch w-14 h-14 rounded-kid gradient-sunshine text-card-bg shadow-button"
            >
              <Plus size={26} />
            </button>
          </div>
        </div>

        {/* Preset Groups */}
        <div className="card-section">
          <label className="text-base font-bold text-text-primary block mb-5">
            快速添加常用字
          </label>
          <div className="flex flex-wrap gap-3">
            {PRESET_GROUPS.map((group) => (
              <button
                key={group.label}
                onClick={() => handleAddPreset(group.chars)}
                className="btn-touch !px-6 !py-2 rounded-pill bg-sky/10 text-sky-dark text-base font-bold
                           border border-sky/20 !min-h-0"
              >
                + {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Characters */}
        <div className="card-section">
          <div className="flex items-center justify-between mb-4">
            <label className="text-base font-bold text-text-primary">
              当前练习列表 ({chars.length}个字)
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="btn-icon w-11 h-11 text-text-muted hover:bg-sky/10"
                title="恢复默认"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={handleClearAll}
                className="btn-icon w-11 h-11 text-text-muted hover:bg-error/10"
                title="清空全部"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          
          {chars.length === 0 ? (
            <p className="text-center text-text-muted text-base py-10">
              还没有添加任何字，快来添加吧！
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {chars.map((char) => {
                const progress = store.progress[char];
                return (
                  <div
                    key={char}
                    className="group relative w-14 h-14 rounded-kid bg-bg-warm border-2 border-card-border
                               flex items-center justify-center font-kai text-2xl text-text-primary
                               transition-all hover:border-coral hover:shadow-sm"
                  >
                    {char}
                    {progress && progress.bestStars > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-star
                                      flex items-center justify-center text-[10px] font-bold text-card-bg">
                        {progress.bestStars}
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveChar(char)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-card-bg
                                 flex items-center justify-center opacity-0 group-hover:opacity-100
                                 transition-opacity active:scale-90"
                    >
                      <X size={14} />
                    </button>
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
