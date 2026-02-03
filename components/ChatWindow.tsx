
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, disabled }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-400 tracking-tighter uppercase">Investigation Log</h2>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-red-900/40 text-slate-100 border border-red-800' 
                : msg.role === 'system'
                  ? 'bg-slate-800/80 text-amber-400 italic border border-slate-700'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled || isLoading}
          placeholder={disabled ? "Case is closed." : "Ask the investigator or request a clue..."}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-slate-200 focus:outline-none focus:border-red-500 text-sm transition-all disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={disabled || isLoading || !input.trim()}
          className="px-6 py-2 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 text-white rounded font-bold text-sm transition-all"
        >
          SEND
        </button>
      </form>
    </div>
  );
};
