import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';

/**
 * TestimonialCarousel — Auto-rotating testimonial slider.
 * @param {object} props
 * @param {Array} props.testimonials - Array of testimonial objects
 */
const TestimonialCarousel = ({ testimonials }) => {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        if (!testimonials || testimonials.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [testimonials?.length]);

    if (!testimonials || testimonials.length === 0) return null;

    const current = testimonials[currentIdx];

    /** Mask customer name/number for privacy */
    const maskName = (name) => {
        if (!name) return 'Customer';
        if (name.length > 7) {
            return `${name.substring(0, 4)}****${name.substring(name.length - 4)}`;
        }
        return name;
    };

    return (
        <section className="mb-12">
            <h2 className="text-sm font-bold text-slate-900 text-center mb-4">Apa Kata Mereka?</h2>
            <div className="relative max-w-sm mx-auto overflow-hidden bg-white border border-purple-100 rounded-2xl px-4 py-4 shadow-[0_2px_12px_-4px_rgba(124,58,237,0.04)] group">
                {/* Navigation Arrows */}
                <button
                    onClick={() => setCurrentIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition-all z-10 border border-slate-200/80 shadow-sm"
                >
                    <ChevronRight className="rotate-180" size={12} />
                </button>
                <button
                    onClick={() => setCurrentIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition-all z-10 border border-slate-200/80 shadow-sm"
                >
                    <ChevronRight size={12} />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center text-center px-5"
                    >
                        <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    className={i < (current?.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                                />
                            ))}
                        </div>
                        {(current?.text || current?.message) && (
                            <p className="text-xs text-slate-600 italic mb-2 leading-relaxed">
                                "{current?.text || current?.message}"
                            </p>
                        )}
                        <p className="text-[11px] font-bold text-purple-600">
                            {maskName(current?.name || current?.wa_number)}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            className={`transition-all rounded-full ${currentIdx === idx ? 'w-4 h-1 bg-purple-600' : 'w-1 h-1 bg-slate-200 hover:bg-slate-300'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
