import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialCarousel = ({ testimonials }) => {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        if (!testimonials?.length) return undefined;
        const timer = setInterval(() => setCurrentIdx(prev => (prev + 1) % testimonials.length), 5000);
        return () => clearInterval(timer);
    }, [testimonials?.length]);

    if (!testimonials?.length) return null;
    const current = testimonials[currentIdx];
    const maskName = (name) => {
        if (!name) return 'Customer';
        return name.length > 7 ? `${name.substring(0, 4)}****${name.substring(name.length - 4)}` : name;
    };

    return (
        <section className="mb-12 border-t border-[var(--line)] pt-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold text-[var(--ink)]">Catatan pelanggan</h2>
                <span className="font-mono text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Pengalaman nyata</span>
            </div>
            <div className="relative max-w-xl mx-auto px-10 py-3 group">
                <button aria-label="Testimoni sebelumnya" onClick={() => setCurrentIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-[var(--muted)] hover:text-[var(--coral-dark)] transition-colors"><ChevronLeft size={16} /></button>
                <button aria-label="Testimoni berikutnya" onClick={() => setCurrentIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--muted)] hover:text-[var(--coral-dark)] transition-colors"><ChevronRight size={16} /></button>
                <AnimatePresence mode="wait">
                    <motion.div key={currentIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }} className="text-center">
                        <div className="flex justify-center gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < (current?.rating || 5) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-[var(--line)]'} />)}</div>
                        <p className="text-sm text-[var(--muted)] italic leading-relaxed">“{current?.text || current?.message}”</p>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-[.08em] text-[var(--coral-dark)]">{maskName(current?.name || current?.wa_number)}</p>
                    </motion.div>
                </AnimatePresence>
                <div className="flex justify-center gap-1.5 mt-4">{testimonials.map((_, idx) => <button key={idx} aria-label={`Testimoni ${idx + 1}`} onClick={() => setCurrentIdx(idx)} className={`h-1 transition-all rounded-full ${currentIdx === idx ? 'w-6 bg-[var(--coral)]' : 'w-1 bg-[var(--line-strong)]'}`} />)}</div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
