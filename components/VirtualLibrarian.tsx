
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { chatWithLibrarian } from '../services/geminiService';
import { ChatMessage } from '../types';

const VirtualLibrarian: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Chào em! Cô là thủ thư ảo của THCS Lê Quý Đôn. Em cần tìm sách gì cho buổi học hôm nay nào?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const geminiHistory = messages.concat(userMsg).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithLibrarian(geminiHistory);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Hệ thống đang bận, em chờ cô chút nhé!' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Cô bị mất kết nối mạng rồi. Thử lại sau nhé em!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-[#00a651] text-white p-5 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-110 transition-all z-50 flex items-center justify-center group"
      >
        <MessageSquare className="w-7 h-7" />
        <span className="absolute -top-1 -left-1 bg-red-500 w-4 h-4 rounded-full border-4 border-white animate-pulse"></span>
        <div className="absolute right-full mr-4 bg-white text-slate-800 px-4 py-2 rounded-2xl shadow-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest border border-slate-100">
          Hỏi thủ thư ảo
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 h-[550px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-[#00a651] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tight">Thủ thư ảo</p>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1.5 font-bold uppercase tracking-widest mt-1">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,1)]"></span>
                  Trực tuyến
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-[#00a651] text-white rounded-tr-none shadow-emerald-500/10' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00a651]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex gap-3 bg-slate-100 p-1.5 rounded-2xl">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Em muốn tìm sách gì?" 
                className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none font-medium text-slate-700"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#00a651] text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualLibrarian;
