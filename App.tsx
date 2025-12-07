
import React, { useState, useEffect, useCallback } from 'react';
import { PuzzleData, GameState } from './types';
import { fetchPuzzle, getHintFromAI } from './services/geminiService';
import { SEGMENT_MAP } from './constants';
import { Digit } from './components/Digit';
import { Operator } from './components/Operator';
import { getCharFromSegments, evaluateEquation } from './utils/matchstickLogic';
import { RefreshCw, Lightbulb, CheckCircle, AlertTriangle, Share2, Download } from 'lucide-react';

// Define the structure of a character on the board
interface BoardChar {
  id: string;
  type: 'digit' | 'operator';
  value: string; // The char '0'-'9', '+', '-', '='
  activeSegments: boolean[]; // Array of booleans representing sticks
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [board, setBoard] = useState<BoardChar[]>([]);
  const [initialStickCount, setInitialStickCount] = useState(0);
  const [currentStickCount, setCurrentStickCount] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [showHintModal, setShowHintModal] = useState(false);
  const [aiHint, setAiHint] = useState<string>('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Capture the PWA install event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Initialize Board from Equation String
  const initBoard = useCallback((equation: string) => {
    const chars = equation.split('').filter(c => c.trim() !== '');
    const newBoard: BoardChar[] = chars.map((char, index) => {
      let activeSegments: boolean[] = [];
      let type: 'digit' | 'operator' = 'digit';

      if (['+', '-', '='].includes(char)) {
        type = 'operator';
        if (char === '+') activeSegments = [true, true]; // [vertical, horizontal]
        if (char === '-') activeSegments = [true];       // [horizontal]
        if (char === '=') activeSegments = [true, true]; // [top, bottom]
      } else {
        // Digits 0-9
        const indices = SEGMENT_MAP[char] || [];
        activeSegments = Array(7).fill(false);
        indices.forEach(i => activeSegments[i] = true);
      }

      return {
        id: `char-${index}`,
        type,
        value: char,
        activeSegments
      };
    });

    setBoard(newBoard);
    
    // Count total sticks
    const count = newBoard.reduce((acc, item) => acc + item.activeSegments.filter(b => b).length, 0);
    setInitialStickCount(count);
    setCurrentStickCount(count);
  }, []);

  const loadNewPuzzle = async () => {
    setGameState(GameState.LOADING);
    setMessage('AI가 퍼즐을 생성 중입니다...');
    setAiHint('');
    setApiError(null);
    
    const data = await fetchPuzzle();
    setPuzzle(data);
    initBoard(data.originalEquation);
    
    if (data.error) {
      setApiError(data.error);
      setMessage(`체험 모드: 성냥개비 ${data.targetMoves}개를 옮겨 식을 완성하세요.`);
    } else {
      setMessage(`성냥개비 ${data.targetMoves}개를 옮겨 식을 완성하세요.`);
    }
    
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    loadNewPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Stick Toggle
  const handleToggle = (charIndex: number, segmentIndex: number) => {
    if (gameState !== GameState.PLAYING) return;

    setBoard(prev => {
      const newBoard = [...prev];
      const char = { ...newBoard[charIndex] };
      const newSegments = [...char.activeSegments];
      
      newSegments[segmentIndex] = !newSegments[segmentIndex];
      char.activeSegments = newSegments;
      newBoard[charIndex] = char;

      // Update stick count immediately
      const newCount = newBoard.reduce((acc, item) => acc + item.activeSegments.filter(b => b).length, 0);
      setCurrentStickCount(newCount);

      return newBoard;
    });
  };

  const checkSolution = () => {
    if (!puzzle) return;

    // 1. Check Conservation of Matchsticks
    if (currentStickCount !== initialStickCount) {
      setMessage(`성냥개비 개수가 맞지 않습니다. (현재: ${currentStickCount}, 초기: ${initialStickCount})`);
      return;
    }

    // 2. Parse Board back to String
    let equationStr = '';
    let invalidChar = false;

    for (const char of board) {
      if (char.type === 'digit') {
        const digit = getCharFromSegments(char.activeSegments);
        if (digit === null) {
          invalidChar = true;
          break;
        }
        equationStr += digit;
      } else {
        // Operators
        const s = char.activeSegments;
        if (char.value === '+') {
            if (s[0] && s[1]) equationStr += '+';
            else if (!s[0] && s[1]) equationStr += '-'; 
            else invalidChar = true; 
        } else if (char.value === '-') {
            if (s[0]) equationStr += '-';
            else invalidChar = true;
        } else if (char.value === '=') {
            if (s[0] && s[1]) equationStr += '=';
            else if (s[0] || s[1]) equationStr += '-';
            else invalidChar = true;
        }
      }
    }

    if (invalidChar) {
      setMessage("올바르지 않은 숫자나 기호가 있습니다.");
      return;
    }

    // 3. Evaluate Math
    const isValidMath = evaluateEquation(equationStr);

    if (isValidMath) {
      setGameState(GameState.WON);
      setMessage(`정답입니다! ${equationStr}`);
    } else {
      setMessage(`틀렸습니다. (${equationStr}) 다시 시도해보세요.`);
    }
  };

  const requestHint = async () => {
    if (!puzzle) return;
    setLoadingHint(true);
    setShowHintModal(true);
    
    // Construct current state string for AI context
    let currentStr = '';
    board.forEach(c => {
         if (c.type === 'digit') {
             const d = getCharFromSegments(c.activeSegments);
             currentStr += d || '?';
         } else {
             currentStr += c.value; // Approximate for ops
         }
    });

    if (apiError) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
      setAiHint(puzzle.hint); // Use fallback hint
    } else {
      const hint = await getHintFromAI(`Original: ${puzzle.originalEquation}, Current User Board: ${currentStr}, Goal: Make it valid math.`);
      setAiHint(hint);
    }
    setLoadingHint(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '성냥개비 퍼즐 마스터',
          text: 'Gemini AI와 함께하는 두뇌 트레이닝! 퍼즐을 풀어보세요.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setMessage('클립보드에 링크가 복사되었습니다!');
      setTimeout(() => {
        if (puzzle) setMessage(`성냥개비 ${puzzle.targetMoves}개를 옮겨 식을 완성하세요.`);
      }, 2000);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-6 pt-4 gap-4">
        <div className="text-center md:text-left">
           <h1 className="text-3xl font-bold text-amber-500 tracking-wider drop-shadow-md">MATCHSTICK MASTER</h1>
           <p className="text-gray-400 text-sm">성냥개비 퍼즐 생성기 with Gemini</p>
        </div>
        <div className="flex gap-2">
           {deferredPrompt && (
             <button 
               onClick={handleInstall}
               className="flex items-center gap-2 bg-green-700/80 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors border border-green-600 shadow-lg text-sm"
             >
               <Download size={16} /> 앱 설치
             </button>
           )}
           <button 
             onClick={handleShare}
             className="flex items-center gap-2 bg-blue-700/80 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors border border-blue-600 shadow-lg text-sm"
           >
             <Share2 size={16} /> 공유
           </button>
           <button 
             onClick={loadNewPuzzle}
             className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700 shadow-lg"
           >
             <RefreshCw size={18} /> 새 퍼즐
           </button>
        </div>
      </header>

      {/* API Warning Banner */}
      {apiError && (
        <div className="w-full max-w-2xl mb-6 bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
          <div className="text-sm">
            <span className="font-bold">API 연결 확인 필요:</span> {apiError}. 현재는 체험용 기본 퍼즐만 제공됩니다.
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl">
        
        {/* Instruction Banner */}
        <div className="mb-10 text-center min-h-[3rem]">
           {gameState === GameState.LOADING ? (
             <div className="text-xl text-amber-300 animate-pulse">퍼즐을 생성하고 있습니다...</div>
           ) : (
             <div className={`text-xl font-medium px-8 py-3 rounded-full inline-block shadow-lg transition-all
               ${gameState === GameState.WON 
                 ? 'bg-green-900/80 text-green-300 border border-green-600 scale-110' 
                 : 'bg-gray-800/80 text-gray-200 border border-gray-600'}
             `}>
               {message}
             </div>
           )}
        </div>

        {/* The Board */}
        <div className="w-full overflow-x-auto pb-8 flex justify-center">
            <div className="flex items-center gap-2 md:gap-4 p-10 bg-[#2a2a2a] rounded-3xl border-4 border-[#3a3a3a] shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-w-max relative">
              {/* Board Texture Overlay */}
              <div className="absolute inset-0 rounded-[1.3rem] opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
              
              {board.map((char, cIndex) => {
                if (char.type === 'digit') {
                  return (
                    <Digit 
                      key={char.id} 
                      segments={char.activeSegments} 
                      onToggle={(sIndex) => handleToggle(cIndex, sIndex)} 
                    />
                  );
                } else {
                  return (
                    <Operator 
                      key={char.id} 
                      type={char.value as any} 
                      activeSticks={char.activeSegments} 
                      onToggle={(sIndex) => handleToggle(cIndex, sIndex)} 
                    />
                  );
                }
              })}
            </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
            <button 
              onClick={requestHint}
              disabled={gameState !== GameState.PLAYING}
              className="flex items-center gap-2 bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 border border-indigo-700 px-8 py-3 rounded-xl text-lg transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <Lightbulb size={24} /> 힌트 보기
            </button>

            <button 
              onClick={checkSolution}
              disabled={gameState !== GameState.PLAYING}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-10 py-3 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
            >
              <CheckCircle size={24} /> 정답 확인
            </button>
        </div>

        {/* Stats */}
        <div className="mt-8 text-gray-500 text-sm font-mono bg-black/20 px-4 py-2 rounded-lg">
           남은 성냥개비: <span className={`text-lg ml-2 ${currentStickCount !== initialStickCount ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}`}>{currentStickCount}</span> / {initialStickCount}
        </div>

      </main>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-600 p-8 rounded-2xl max-w-md w-full relative shadow-2xl">
            <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-3 pb-4 border-b border-gray-800">
              <Lightbulb className="fill-amber-400 text-amber-400" size={24} /> 
              {apiError ? "기본 힌트" : "AI 힌트"}
            </h3>
            <p className="text-gray-300 leading-relaxed min-h-[4rem] text-lg">
              {loadingHint ? "퍼즐을 분석하는 중..." : aiHint}
            </p>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowHintModal(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="w-full text-center py-4 text-gray-600 text-xs mt-auto">
         Powered by Google Gemini 2.5 Flash
      </footer>
    </div>
  );
};

export default App;
