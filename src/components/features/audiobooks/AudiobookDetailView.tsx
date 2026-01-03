import React, { useState, useEffect } from 'react';
import { Headphones, Clock, ArrowLeft, Play, Share2, Heart, Eye, ListMusic } from 'lucide-react';
import { Audiobook, AudioTrack } from '@/types';
import { supabase } from '@/lib/supabase';

interface AudiobookDetailViewProps {
    audiobook: Audiobook;
    onBack: () => void;
    onPlayTrack: (track: AudioTrack, playlist: AudioTrack[]) => void;
    currentTrackId?: string;
}

const AudiobookDetailView: React.FC<AudiobookDetailViewProps> = ({
    audiobook,
    onBack,
    onPlayTrack,
    currentTrackId
}) => {
    const [tracks, setTracks] = useState<AudioTrack[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('audio_tracks')
                    .select('*')
                    .eq('audiobook_id', audiobook.id)
                    .order('display_order', { ascending: true });

                if (error) throw error;
                if (data) setTracks(data);
            } catch (err) {
                console.error('Error fetching tracks:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
        // Increment views
        supabase.rpc('increment_audiobook_views', { book_id: audiobook.id }).then(({ error }) => {
            if (error) {
                // Fallback if RPC not exists
                supabase.from('audiobooks')
                    .update({ views: audiobook.views + 1 })
                    .eq('id', audiobook.id);
            }
        });
    }, [audiobook]);

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-10">
            {/* Nav */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-[#00a651] transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[12px] font-bold uppercase tracking-widest">Quay lại danh sách</span>
            </button>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* LEFT: Cover & Info */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 space-y-8">
                        <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 relative group">
                            <img
                                src={audiobook.cover_url || '/images/default-audio-cover.png'}
                                className="w-full h-full object-cover"
                                alt={audiobook.title}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                {tracks.length > 0 && (
                                    <button
                                        onClick={() => onPlayTrack(tracks[0], tracks)}
                                        className="w-16 h-16 bg-[#00a651] text-white rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300"
                                    >
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-4 bg-[#00a651] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95">
                                <Headphones className="w-5 h-5" /> Nghe truyện
                            </button>
                            <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                                <Heart className="w-6 h-6" />
                            </button>
                            <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin chi tiết</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tác giả</span>
                                    <span className="font-bold text-slate-800">{audiobook.author || 'Chưa rõ'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Nhà xuất bản</span>
                                    <span className="font-bold text-slate-800">{audiobook.publisher || 'Chưa rõ'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Năm phát hành</span>
                                    <span className="font-bold text-slate-800">{audiobook.publication_year || 'Đang cập nhật'}</span>
                                </div>
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60 transition-all">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                        <Eye className="w-4 h-4 text-emerald-500" /> {audiobook.views}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                        <Heart className="w-4 h-4 text-red-400" /> {audiobook.favorites}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Tracks & Content */}
                <div className="lg:col-span-8 space-y-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{audiobook.title}</h1>
                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-600 leading-relaxed italic border-l-4 border-emerald-100 pl-4">
                                {audiobook.description || 'Chưa có mô tả cho cuốn sách này.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                    <ListMusic className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800">Danh sách các tập</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tracks.length} tập tin âm thanh</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="px-8 py-6 animate-pulse flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-100 rounded w-1/3" />
                                            <div className="h-3 bg-slate-50 rounded w-1/4" />
                                        </div>
                                    </div>
                                ))
                            ) : tracks.length === 0 ? (
                                <div className="px-8 py-16 text-center text-slate-400 italic">
                                    Nội dung đang được cập nhật...
                                </div>
                            ) : (
                                tracks.map((track, index) => {
                                    const isPlaying = currentTrackId === track.id;
                                    return (
                                        <div
                                            key={track.id}
                                            className={`group px-8 py-6 flex items-center gap-6 hover:bg-slate-50 transition-all cursor-pointer ${isPlaying ? 'bg-emerald-50/50' : ''}`}
                                            onClick={() => onPlayTrack(track, tracks)}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isPlaying ? 'bg-[#00a651] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#00a651] group-hover:text-white'}`}>
                                                {isPlaying ? <Play className="w-4 h-4 fill-current ml-0.5" /> : (index + 1).toString().padStart(2, '0')}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold transition-colors ${isPlaying ? 'text-[#00a651]' : 'text-slate-800 group-hover:text-[#00a651]'}`}>
                                                    {track.title}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                                        <Clock className="w-3.5 h-3.5" /> {track.duration || '--:--'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-emerald-100 text-[#00a651]' : 'bg-slate-50 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudiobookDetailView;
