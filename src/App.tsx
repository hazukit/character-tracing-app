import { useState, useEffect, useRef } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { getRandomCharacter, setDataSource, getAvailableDataSources, type Character } from './services/characterApi';
import './App.css';

function App() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [customText, setCustomText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDataSource, setCurrentDataSource] = useState(() => {
    // localStorageから保存された設定を読み込み
    return localStorage.getItem('character-tracing-data-source') || 'animals';
  });
  const [availableDataSources, setAvailableDataSources] = useState<any[]>([]);
  const canvasRef = useRef<{ clearCanvas: () => void } | null>(null);

  const loadRandomCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const characterData = await getRandomCharacter();
      setCharacter(characterData);
      setDisplayText(characterData.name);
    } catch (err) {
      setError('キャラクターの読み込みに失敗しました');
      console.error('Failed to load character:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      setDisplayText(customText.trim());
      setCharacter(null);
    }
  };

  const handleNextCharacter = () => {
    canvasRef.current?.clearCanvas();
    loadRandomCharacter();
  };

  const handleDataSourceChange = (sourceName: string) => {
    setDataSource(sourceName);
    setCurrentDataSource(sourceName);
    // 設定をlocalStorageに保存
    localStorage.setItem('character-tracing-data-source', sourceName);
    canvasRef.current?.clearCanvas();
    loadRandomCharacter();
  };

  useEffect(() => {
    // 利用可能なデータソースを取得
    const sources = getAvailableDataSources();
    setAvailableDataSources(sources);
    
    // 保存された設定があれば適用
    const savedDataSource = localStorage.getItem('character-tracing-data-source');
    if (savedDataSource) {
      setDataSource(savedDataSource);
    }
    
    // 初期ロード
    loadRandomCharacter();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>文字なぞり練習</h1>
      </header>
      
      <main className="app-main">
        <div className="content-section">
          {loading && <p>読み込み中...</p>}
          {error && <p className="error">{error}</p>}
          
          {character && (
            <div className="character-display">
              <div 
                className="character-image"
                aria-label={`キャラクター: ${character.name}`}
                data-testid="character-image"
              >
                {character.image.startsWith('http') ? (
                  <img 
                    src={character.image} 
                    alt={character.name}
                    className="character-img"
                  />
                ) : (
                  character.image
                )}
              </div>
            </div>
          )}
          
          <div className="tracing-section">
            <div className="text-overlay-container">
              <h2 className="background-text" data-testid="display-text">
                {displayText}
              </h2>
              <DrawingCanvas 
                ref={canvasRef}
                width={600} 
                height={150}
              />
            </div>
          </div>
          
          <div className="controls">
            <div className="data-source-selector">
              <label htmlFor="data-source-select">キャラクター:</label>
              <select
                id="data-source-select"
                value={currentDataSource}
                onChange={(e) => handleDataSourceChange(e.target.value)}
                className="data-source-select"
                data-testid="data-source-select"
              >
                {availableDataSources.map((source) => (
                  <option key={source.name} value={source.name}>
                    {source.description}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleNextCharacter}
              disabled={loading}
              className="next-button"
              aria-label="次のキャラクターを表示"
              data-testid="next-button"
            >
              つぎへ
            </button>
          </div>
          
          <div className="custom-text-section">
            <h3>好きな文字を入力してなぞろう！</h3>
            <div className="text-input-controls">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="なぞりたい文字を入力してね"
                className="text-input"
                aria-label="なぞりたい文字を入力"
                data-testid="custom-text-input"
              />
              <button 
                onClick={handleCustomTextSubmit}
                disabled={!customText.trim()}
                className="submit-button"
                aria-label="入力した文字を表示"
                data-testid="submit-text-button"
              >
                文字を表示
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;