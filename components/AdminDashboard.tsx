
import React from 'react';
import { ShieldCheck, Users, BookOpen, GraduationCap, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import LibraryStats from './LibraryStats';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Tổng bạn đọc', value: '1.859', change: '+12%', isUp: true, icon: <Users className="w-6 h-6 text-emerald-500" />, color: 'emerald' },
    { label: 'Kho tài liệu', value: '12.450', change: '+5%', isUp: true, icon: <BookOpen className="w-6 h-6 text-blue-500" />, color: 'blue' },
    { label: 'Lượt mượn trả', value: '458', change: '-2%', isUp: false, icon: <GraduationCap className="w-6 h-6 text-purple-500" />, color: 'purple' },
    { label: 'Truy cập hôm nay', value: '125', change: '+8%', isUp: true, icon: <Activity className="w-6 h-6 text-orange-500" />, color: 'orange' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-[#00a651]" /> 
            Bảng điều khiển
          </h1>
          <p className="text-slate-400 font-medium mt-1">Tổng quan hoạt động hệ thống thư viện Lê Quý Đôn</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Thời gian hệ thống</p>
             <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 cursor-default">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 bg-${stat.color}-50 rounded-2xl group-hover:rotate-12 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-tighter ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <LibraryStats />
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
               <h2 className="text-lg font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-emerald-500" /> Nhật ký hệ thống
               </h2>
               <div className="space-y-6">
                  {[
                    { user: 'Admin', action: 'Imported 125 students', time: '5 phút trước' },
                    { user: 'Thủ thư', action: 'Duyệt 12 bài viết mới', time: '12 phút trước' },
                    { user: 'Hệ thống', action: 'Đã sao lưu Database', time: '1 giờ trước' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                       <div>
                          <p className="text-sm font-bold text-slate-700">{log.action}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                             <span>{log.user}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span>{log.time}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
