
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeft, Download, Maximize2, ZoomIn, ZoomOut,
    BookOpen, Layers, Loader2, ChevronLeft, ChevronRight,
    Search, Sliders, Monitor
} from 'lucide-react';
import { EBook } from '@/types';
import { supabase } from '@/lib/supabase';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import './EBookReader.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/pdf.worker.min.js`;

interface EBookReaderViewProps {
    book: EBook;
    onBack: () => void;
}

const EBookReaderView: React.FC<EBookReaderViewProps> = ({ book, onBack }) => {
    // Mode State: 'embed' (Iframe) or 'flipbook' (High Quality)
    // Default to 'flipbook' if storage_path exists, else 'embed'
    const [mode, setMode] = useState<'embed' | 'flipbook'>(book.storage_path ? 'flipbook' : 'embed');

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1.0);
    const [pdf, setPdf] = useState<any>(null);
    const [renderedPages, setRenderedPages] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const flipBookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Loading for Flipbook Mode
    useEffect(() => {
        if (mode === 'flipbook') {
            loadPdf();
        }
    }, [mode]);

    const loadPdf = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '';
            // 1. Try Supabase Storage first
            if (book.storage_path) {
                const { data } = supabase.storage.from('ebooks').getPublicUrl(book.storage_path);
                url = data.publicUrl;
            } else {
                // 2. Fallback to UC Proxy (more reliable for public PDFs)
                url = `/drive-uc-proxy?export=download&id=${book.drive_file_id}`;
            }

            const loadingTask = pdfjsLib.getDocument(url);
            const loadedPdf = await loadingTask.promise;
            setPdf(loadedPdf);
            setNumPages(loadedPdf.numPages);

            // Pre-render first 5 pages
            for (let i = 1; i <= Math.min(5, loadedPdf.numPages); i++) {
                await renderPageToImage(loadedPdf, i);
            }
        } catch (err: any) {
            console.error("PDF Loading Error:", err);
            setError("Không thể tải tài liệu ở chế độ lật sách. Vui lòng quay lại chế độ xem chuẩn.");
            setMode('embed');
        } finally {
            setLoading(false);
        }
    };

    const renderPageToImage = async (pdfDoc: any, pageNum: number) => {
        if (renderedPages[pageNum]) return renderedPages[pageNum];

        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 }); // Render at 2x for clarity
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport }).promise;
            const imgData = canvas.toDataURL('image/webp', 0.8);

            setRenderedPages(prev => ({ ...prev, [pageNum]: imgData }));
            return imgData;
        } catch (err) {
            console.error(`Error rendering page ${pageNum}:`, err);
            return null;
        }
    };

    // Handle Page Turn
    const onPage = useCallback((e: any) => {
        setCurrentPage(e.data);
        // Lazy load next few pages
        if (pdf) {
            const nextPages = [e.data + 1, e.data + 2, e.data + 3];
            nextPages.forEach(p => {
                if (p > 0 && p <= numPages && !renderedPages[p]) {
                    renderPageToImage(pdf, p);
                }
            });
        }
    }, [pdf, numPages, renderedPages]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const goToPage = (index: number) => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flip(index);
        }
    };

    return (
        <div ref={containerRef} className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden select-none font-['Inter']">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 transition-all border border-slate-100 shadow-sm"
                        title="Quay lại"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-slate-800 font-black text-sm truncate max-w-[400px] leading-tight">{book.title}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#00a651] uppercase bg-emerald-50 px-2 py-0.5 rounded cursor-default border border-emerald-100">Sách điện tử</span>
                            <span className="text-[10px] font-medium text-slate-400">ID: {book.drive_file_id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mode Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-4">
                        <button
                            onClick={() => setMode('embed')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === 'embed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Monitor className="w-3.5 h-3.5" /> Chế độ chuẩn
                        </button>
                        <button
                            onClick={() => setMode('flipbook')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === 'flipbook' ? 'bg-[#00a651] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5" /> Chế độ lật sách
                        </button>
                    </div>

                    <a
                        href={`https://drive.google.com/uc?export=download&id=${book.drive_file_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 border border-slate-100 shadow-sm"
                        title="Tải xuống"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex-1 relative bg-[#f1f5f9] overflow-hidden flex flex-col items-center justify-center">
                {mode === 'embed' ? (
                    <iframe
                        src={`https://drive.google.com/file/d/${book.drive_file_id}/preview`}
                        className="w-full h-full border-none bg-white"
                        allow="autoplay text-rendering"
                        title={book.title}
                    ></iframe>
                ) : (
                    <div className="w-full h-full flex items-center justify-center overflow-auto custom-reader-scrollbar relative py-12 px-20">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-4 transition-all">
                                <Loader2 className="w-12 h-12 text-[#00a651] animate-spin" />
                                <div className="text-center">
                                    <p className="text-slate-800 font-black uppercase tracking-widest text-xs">Đang tối ưu tài liệu</p>
                                    <p className="text-slate-500 text-[10px] mt-1 italic font-medium">Bản đẹp nhất đang được tải về...</p>
                                </div>
                            </div>
                        )}

                        <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                            <HTMLFlipBook
                                width={550}
                                height={750}
                                size="stretch"
                                minWidth={315}
                                maxWidth={800}
                                minHeight={420}
                                maxHeight={1200}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={true}
                                onFlip={onPage}
                                className="flip-book"
                                style={{}}
                                startPage={0}
                                drawShadow={true}
                                flippingTime={1000}
                                usePortrait={false}
                                startZIndex={0}
                                autoSize={true}
                                clickEventForward={true}
                                useMouseEvents={true}
                                swipeDistance={30}
                                showPageCorners={true}
                                disableFlipByClick={false}
                                ref={flipBookRef}
                            >
                                {[...Array(numPages)].map((_, i) => (
                                    <div key={i} className="page border-r border-slate-100 bg-white">
                                        <div className="page-content">
                                            {renderedPages[i + 1] ? (
                                                <img
                                                    src={renderedPages[i + 1]}
                                                    alt={`Page ${i + 1}`}
                                                    className="page-canvas shadow-inner"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-3 opacity-40">
                                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Đang tải trang {i + 1}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </HTMLFlipBook>
                        </div>
                    </div>
                )}

                {mode === 'flipbook' && (
                    <div className="absolute top-8 right-8 flex flex-col gap-2 z-20">
                        <button onClick={handleZoomIn} className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl shadow-xl border border-slate-100 transition-all hover:scale-105 active:scale-95 group">
                            <ZoomIn className="w-5 h-5 group-hover:text-[#00a651]" />
                        </button>
                        <button onClick={handleZoomOut} className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl shadow-xl border border-slate-100 transition-all hover:scale-105 active:scale-95 group">
                            <ZoomOut className="w-5 h-5 group-hover:text-[#00a651]" />
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Footer - From User Image */}
            {mode === 'flipbook' && (
                <footer className="h-16 reader-footer flex items-center px-10 gap-12 sticky bottom-0 z-50">
                    <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Trang</span>
                        <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-black text-[#00a651] shadow-inner">
                            {currentPage + 1} / {numPages}
                        </div>
                    </div>

                    <div className="flex-1 flex items-center gap-6">
                        <input
                            type="range"
                            min="0"
                            max={numPages - 1}
                            value={currentPage}
                            onChange={(e) => goToPage(parseInt(e.target.value))}
                            className="page-slider"
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleZoomOut}
                            className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2" />
                        <button
                            onClick={toggleFullscreen}
                            className="p-2.5 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-[#00a651] transition-all"
                            title="Toàn màn hình"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default EBookReaderView;
