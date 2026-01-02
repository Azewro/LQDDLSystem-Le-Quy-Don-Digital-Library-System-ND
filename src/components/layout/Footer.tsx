
import React from 'react';
import { Mail, Phone, Globe, MapPin, ChevronUp } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateIntro: () => void;
  onNavigateNews: () => void;
  onEBookClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateHome, onNavigateIntro, onNavigateNews, onEBookClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1e293b] text-white pt-16 pb-8 mt-auto relative">
      <div className="max-w-[1440px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1: Info & QR */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
              <div className="w-12 h-12 bg-white rounded-lg p-1">
                <img src="/images/logo.png" className="w-full h-full object-contain" alt="Logo" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Thư viện điện tử</span>
                <h2 className="text-white font-extrabold text-[14px] leading-tight uppercase">THCS LÊ QUÝ ĐÔN</h2>
              </div>
            </div>

            <div className="space-y-3 text-[13px] text-slate-300">
              <p className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Điện thoại: 024 3836 0674</span>
              </p>
              <p className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Website: thcslequydon.caugiay.edu.vn</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Địa chỉ: 58 Đ. Nguyễn Văn Huyên, Nghĩa Đô, Cầu Giấy, Hà Nội</span>
              </p>
            </div>

            <div className="bg-white p-2 w-32 h-32 rounded-lg shadow-lg">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://thcslequydon.caugiay.edu.vn"
                alt="QR Code"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Column 2: Tài liệu */}
          <div>
            <h3 className="text-white font-bold text-base mb-8 uppercase tracking-wider relative inline-block">
              Tài liệu
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-emerald-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-[13px] text-slate-400 font-medium">
              <li onClick={onEBookClick} className="hover:text-emerald-400 cursor-pointer transition-colors">Sách điện tử</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Sách nói</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Bài giảng điện tử</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Album</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Video</li>
            </ul>
          </div>

          {/* Column 3: Tin tức */}
          <div>
            <h3 className="text-white font-bold text-base mb-8 uppercase tracking-wider relative inline-block">
              Tin tức
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-emerald-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-[13px] text-slate-400 font-medium">
              <li onClick={onNavigateIntro} className="hover:text-emerald-400 cursor-pointer transition-colors">Giới thiệu sách</li>
              <li onClick={onNavigateNews} className="hover:text-emerald-400 cursor-pointer transition-colors">Tin nhà trường</li>
            </ul>
          </div>

          {/* Column 4: Stats */}
          <div className="lg:text-right">
            <div className="flex flex-col lg:items-end gap-2 text-[13px] font-bold text-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">12</span> lượt online
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">185.420</span> tổng lượt truy cập
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-500 uppercase tracking-widest">
          <p>Copyright © 2024 THCS Lê Quý Đôn. All rights reserved.</p>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 w-10 h-10 bg-white text-slate-800 rounded flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all group"
      >
        <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;
