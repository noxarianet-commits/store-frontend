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
            <h2 className="text-xl font-bold text-white text-center mb-6">Apa Kata Mereka?</h2>
            <div className="relative max-w-lg mx-auto overflow-hidden bg-[#0E0E0E] border border-purple-500/25 rounded-3xl p-6 shadow-lg group">
                {/* Navigation Arrows */}
                <button
                    onClick={() => setCurrentIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/5"
                >
                    <ChevronRight className="rotate-180" size={16} />
                </button>
                <button
                    onClick={() => setCurrentIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/5"
                >
                    <ChevronRight size={16} />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center text-center px-8"
                    >
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={i < (current?.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-white/10'}
                                />
                            ))}
                        </div>
                        {(current?.text || current?.message) && (
                            <p className="text-sm text-gray-300 italic mb-4">
                                "{current?.text || current?.message}"
                            </p>
                        )}
                        <p className="text-xs font-bold text-purple-400">
                            {maskName(current?.name || current?.wa_number)}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-6">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            className={`transition-all rounded-full ${currentIdx === idx ? 'w-6 h-1.5 bg-purple-500' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
