import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, ListMusic, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { AudioTrack } from '@/types';

interface AudioPlayerProps {
    currentTrack: AudioTrack | null;
    playlist: AudioTrack[];
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onTrackSelect: (track: AudioTrack) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    currentTrack,
    playlist,
    onClose,
    onNext,
    onPrevious,
    onTrackSelect
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.file_url || '';
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            }
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current) {
            const newTime = (val / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(val);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${isMinimized ? 'translate-y-[calc(100%-40px)] opacity-50 hover:translate-y-0 hover:opacity-100' : ''}`}>
            {/* Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={onNext}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Main Player UI */}
            <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-2xl p-8 w-[1800px] max-w-[98vw] text-white overflow-hidden ring-1 ring-white/10">
                <div className="flex items-center gap-10">
                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button onClick={onPrevious} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                            <SkipBack className="w-8 h-8 fill-current" />
                        </button>
                        <button onClick={togglePlay} className="w-20 h-20 bg-[#00a651] hover:bg-emerald-400 rounded-full flex items-center justify-center transition-all shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95">
                            {isPlaying ? <Pause className="w-10 h-10 fill-current text-white" /> : <Play className="w-10 h-10 fill-current text-white ml-1" />}
                        </button>
                        <button onClick={onNext} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                            <SkipForward className="w-8 h-8 fill-current" />
                        </button>
                    </div>

                    {/* Info & Progress */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-3">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xl font-black truncate text-white">{currentTrack.title}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[12px] text-white/40 uppercase font-bold tracking-[0.3em] truncate">Đang phát chương mục</p>
                                </div>
                            </div>
                            <div className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                                {formatTime(audioRef.current?.currentTime || 0)} <span className="text-white/20 mx-1">/</span> {formatTime(duration)}
                            </div>
                        </div>
                        <div className="relative group py-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleProgressChange}
                                className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00a651] hover:h-4 transition-all"
                            />
                        </div>
                    </div>

                    {/* Utils */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMuted(!isMuted)} className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-colors">
                            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={() => setShowPlaylist(!showPlaylist)}
                            className={`p-3 rounded-2xl transition-all ${showPlaylist ? 'text-[#00a651] bg-[#00a651]/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                            <ListMusic className="w-6 h-6" />
                        </button>
                        <div className="w-[1px] h-10 bg-white/10 mx-2" />
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-colors">
                            {isMinimized ? <Maximize2 className="w-6 h-6" /> : <Minimize2 className="w-6 h-6" />}
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-red-500/10 rounded-2xl text-white/40 hover:text-red-400 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Playlist Drawer */}
                {showPlaylist && (
                    <div className="mt-4 pt-4 border-t border-white/10 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-2">
                        <div className="space-y-1">
                            {playlist.map((track, i) => (
                                <button
                                    key={track.id}
                                    onClick={() => onTrackSelect(track)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${currentTrack.id === track.id ? 'bg-[#00a651]/20 text-[#00a651]' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
                                >
                                    <span className="text-[10px] font-bold w-4 opacity-40">{i + 1}</span>
                                    <span className="text-xs font-medium flex-1 truncate">{track.title}</span>
                                    <span className="text-[10px] font-mono opacity-40">{track.duration || '--:--'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioPlayer;
