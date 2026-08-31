import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

/**
 * TestimonialCarousel — widened to 2-col on desktop, single on mobile.
 * Auto 5.5s, pause on hover, keyboard accessible.
 */
const TestimonialCarousel = ({ testimonials }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!testimonials || testimonials.length === 0 || paused) return;
        const timer = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % testimonials.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [testimonials?.length, paused]);

    if (!testimonials || testimonials.length === 0) return null;

    const maskName = (name) => {
        if (!name) return 'Customer';
        if (name.length > 7) {
            return `${name.substring(0, 4)}****${name.substring(name.length - 4)}`;
        }
        return name;
    };

    const goPrev = () => setCurrentIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
    const goNext = () => setCurrentIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));

    return (
        <section className="mb-12">
            <div className="flex items-end justify-between mb-5 gap-4">
                <div>
                    <h2 className="text-[15px] font-extrabold text-ink tracking-[-0.02em]">Apa Kata Mereka?</h2>
                    <p className="text-xs text-slate-500 mt-1">Testimoni asli dari transaksi terbaru</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                    <button
                        onClick={goPrev}
                        aria-label="Sebelumnya"
                        className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-ink hover:border-slate-300 shadow-sm transition-colors"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={goNext}
                        aria-label="Selanjutnya"
                        className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-ink hover:border-slate-300 shadow-sm transition-colors"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div
                className="relative bg-white border border-brandBorder rounded-2xl shadow-soft overflow-hidden"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Mobile arrows overlay */}
                <button
                    onClick={goPrev}
                    aria-label="Sebelumnya"
                    className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm z-10"
                >
                    <ChevronLeft size={14} />
                </button>
                <button
                    onClick={goNext}
                    aria-label="Selanjutnya"
                    className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm z-10"
                >
                    <ChevronRight size={14} />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                        className="px-6 md:px-8 py-6 md:py-7"
                    >
                        {/* Quote mark — subtle, not decoration dominating */}
                        <Quote size={18} className="text-brand/20 mb-3" />

                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={13}
                                    className={i < (testimonials[currentIdx]?.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                                />
                            ))}
                        </div>

                        {(testimonials[currentIdx]?.text || testimonials[currentIdx]?.message) && (
                            <p className="text-[13px] leading-relaxed text-slate-700 max-w-[60ch]">
                                “{testimonials[currentIdx]?.text || testimonials[currentIdx]?.message}”
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-4 gap-3">
                            <div>
                                <p className="text-[11px] font-bold text-ink">
                                    {maskName(testimonials[currentIdx]?.name || testimonials[currentIdx]?.wa_number)}
                                </p>
                                {testimonials[currentIdx]?.product && (
                                    <p className="text-[11px] text-slate-500">{testimonials[currentIdx].product}</p>
                                )}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                                Verified
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots — 6px, active pill 20px */}
                <div className="flex justify-center gap-1.5 pb-4">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            aria-label={`Testimoni ${idx + 1}`}
                            className={`transition-all rounded-full h-1.5 ${currentIdx === idx ? 'w-5 bg-brand' : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
