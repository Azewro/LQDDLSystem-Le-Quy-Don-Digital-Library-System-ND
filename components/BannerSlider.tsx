
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const slides = [
  {
    id: 1,
    type: 'main',
    content: (
      <div className="relative w-full h-full bg-[#f0fff4] flex items-center px-12 overflow-hidden">
        <div className="z-10 max-w-xl">
          <div className="bg-[#00a651] text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4">THƯ VIỆN SỐ</div>
          <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">
            THƯ VIỆN SỐ <br/>
            <span className="text-[#00a651]">THCS LÊ QUÝ ĐÔN</span>
          </h2>
          <div className="flex gap-4 mb-8">
             <button className="bg-[#00a651] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                <Search className="w-4 h-4" /> Khám Phá Ngay
             </button>
          </div>
          <p className="text-emerald-900 font-bold italic text-lg">"Khởi đầu mới, tri thức mới!"</p>
        </div>
        <div className="absolute right-0 bottom-0 w-1/2 h-full">
           <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover opacity-80" alt="Bookshelf" />
        </div>
      </div>
    )
  },
  {
    id: 2,
    type: 'tech',
    content: (
      <div className="relative w-full h-full bg-[#00a651] flex items-center justify-center text-white text-center p-12">
        <div className="z-10">
          <h2 className="text-5xl font-black mb-6 tracking-tighter">CÔNG NGHỆ 4.0</h2>
          <div className="text-4xl font-light opacity-90 mb-8">Web App - Cloud - AI</div>
          <div className="w-32 h-1.5 bg-white mx-auto rounded-full"></div>
        </div>
        <div className="absolute inset-0 opacity-10">
           <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
        </div>
      </div>
    )
  },
  {
    id: 3,
    type: 'quote',
    content: (
      <div className="w-full h-full bg-white flex items-center justify-center p-8">
        <div className="w-full h-full max-w-5xl bg-[#f0fff4] rounded-3xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-center px-16 relative overflow-hidden">
          <p className="text-2xl italic text-slate-700 font-medium leading-relaxed mb-6">
            "Tất cả những gì con người làm, nghĩ hoặc trở thành: được bảo tồn một cách kỳ diệu trên những trang sách."
          </p>
          <span className="text-[#00a651] font-bold text-lg">- Thomas Carlyle -</span>
        </div>
      </div>
    )
  }
];

const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[450px] w-full group">
      <div className="w-full h-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all ${
              index === current ? 'bg-[#00a651] border-[#00a651] w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      <button 
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/30 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/30 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};

export default BannerSlider;
