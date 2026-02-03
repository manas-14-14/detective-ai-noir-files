
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, CaseData, Message, Clue } from './types';
import { InvestigationService } from './services/geminiService';
import { SuspectCard } from './components/SuspectCard';
import { ChatWindow } from './components/ChatWindow';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    caseTitle: '',
    sceneDescription: '',
    suspects: [],
    clues: [],
    isGameOver: false,
    actualCriminal: null,
    messages: [],
    status: 'loading'
  });

  const [isLoading, setIsLoading] = useState(false);
  const serviceRef = useRef<InvestigationService | null>(null);

  const extractClues = (text: string) => {
    const clueMatch = text.match(/CLUE:\s*(.*)/i);
    if (clueMatch && clueMatch[1]) {
      const newClueText = clueMatch[1].trim();
      setGameState(prev => {
        // Avoid duplicates
        if (prev.clues.some(c => c.text === newClueText)) return prev;
        
        const newClue: Clue = {
          id: Date.now().toString(),
          text: newClueText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...prev,
          clues: [newClue, ...prev.clues]
        };
      });
    }
  };

  const initGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = new InvestigationService();
      serviceRef.current = service;
      
      const caseData: CaseData = await service.startNewCase();
      
      setGameState(prev => ({
        ...prev,
        caseTitle: caseData.title,
        sceneDescription: caseData.scene,
        suspects: caseData.suspects,
        clues: [{ 
          id: 'initial', 
          text: caseData.initialClue, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }],
        status: 'investigating',
        messages: [
          { role: 'assistant', content: `The city smells like rain and cheap cigars. I've been called to the scene: "${caseData.title}".\n\n${caseData.scene}\n\nWe have four suspects on the hook. I've found one initial piece of evidence: ${caseData.initialClue}. What's our next move, rookie?` }
        ]
      }));
    } catch (err) {
      console.error(err);
      setGameState(prev => ({ ...prev, status: 'loading' }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleSendMessage = async (content: string) => {
    if (!serviceRef.current || gameState.isGameOver) return;

    setIsLoading(true);
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content }]
    }));

    try {
      const response = await serviceRef.current.askQuestion(content);
      if (response) {
        extractClues(response);
        setGameState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'assistant', content: response }]
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestClue = async () => {
    if (!serviceRef.current || gameState.isGameOver || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await serviceRef.current.requestClue();
      if (response) {
        extractClues(response);
        setGameState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'assistant', content: response }]
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccuse = async (name: string) => {
    if (!serviceRef.current || gameState.isGameOver) return;

    const confirmGuess = window.confirm(`Are you sure you want to accuse ${name}? Once accused, the truth will be revealed.`);
    if (!confirmGuess) return;

    setIsLoading(true);
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: `I accuse ${name}!` }],
      status: 'revealing'
    }));

    try {
      const truth = await serviceRef.current.makeGuess(name);
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        messages: [...prev.messages, { role: 'assistant', content: truth || "The investigation ended abruptly." }]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (gameState.status === 'loading') {
    return (
      <div className="min-h-screen bg-noir flex flex-col items-center justify-center p-4">
        <i className="fas fa-fingerprint text-6xl text-red-700 animate-pulse mb-6"></i>
        <h1 className="typewriter text-3xl font-bold text-slate-100 mb-2">Analyzing Crime Scene...</h1>
        <p className="text-slate-500 text-sm italic tracking-widest uppercase">Opening Cold Case Files</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/30 rounded border border-red-700/50">
              <i className="fas fa-search-plus text-red-500"></i>
            </div>
            <div>
              <h1 className="typewriter text-xl font-bold text-slate-100 uppercase tracking-tighter">Detective AI</h1>
              <p className="text-[10px] text-red-500 uppercase font-black tracking-[0.2em] leading-none">The Noir Files</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${gameState.isGameOver ? 'border-red-900 text-red-500 bg-red-950/30' : 'border-green-900 text-green-500 bg-green-950/30'}`}>
                {gameState.isGameOver ? 'CASE CLOSED' : 'ACTIVE INVESTIGATION'}
              </span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest"
            >
              <i className="fas fa-redo-alt"></i> New Case
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Suspects & Clues */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Case Info */}
          <section className="bg-slate-900 border border-slate-800 p-6 rounded relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <i className="fas fa-folder-open text-8xl text-slate-100"></i>
             </div>
            <h2 className="typewriter text-2xl font-bold text-slate-100 mb-3 text-shadow shadow-black">
              {gameState.caseTitle}
            </h2>
            <div className="w-20 h-1 bg-red-700 mb-4"></div>
            <p className="text-slate-300 leading-relaxed italic text-sm md:text-base border-l-2 border-slate-700 pl-4">
              {gameState.sceneDescription}
            </p>
          </section>

          {/* Suspects Grid */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fas fa-id-badge text-red-700"></i> Personnel of Interest
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.suspects.map(s => (
                <SuspectCard 
                  key={s.id} 
                  suspect={s} 
                  onGuess={handleAccuse}
                  disabled={gameState.isGameOver || isLoading}
                />
              ))}
            </div>
          </section>

          {/* Evidence Board */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fas fa-clipboard-list text-red-700"></i> Evidence Board
              </h3>
              {!gameState.isGameOver && (
                <button 
                  onClick={handleRequestClue}
                  disabled={isLoading}
                  className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest border border-red-900 px-3 py-1 rounded hover:bg-red-950 transition-all disabled:opacity-30"
                >
                  <i className="fas fa-search mr-2"></i> Search for Clues
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameState.clues.map((c, idx) => (
                <div 
                  key={c.id} 
                  className={`flex flex-col gap-1 p-3 bg-slate-950 border border-slate-800 rounded relative group transition-all duration-500 ${idx === 0 ? 'animate-pulse-slow border-red-900/50' : ''}`}
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1">
                    <span className="text-[9px] font-mono text-slate-600 uppercase">Item #{gameState.clues.length - idx}</span>
                    <span className="text-[9px] font-mono text-slate-700">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{c.text}</p>
                </div>
              ))}
              {gameState.clues.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-xs text-slate-600 italic">No physical evidence cataloged.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Interaction */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-[500px] lg:h-[calc(100vh-120px)]">
          <ChatWindow 
            messages={gameState.messages} 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={gameState.isGameOver}
          />
        </div>
      </main>

      <footer className="py-4 border-t border-slate-900 bg-slate-950/50 text-center">
        <p className="text-[9px] text-slate-700 uppercase tracking-[0.5em] font-mono">
          Proprietary Software &bull; Crime Investigation Division
        </p>
      </footer>
    </div>
  );
};

export default App;
