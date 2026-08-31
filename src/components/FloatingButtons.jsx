import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, X } from 'lucide-react';
import { getWaNumber } from '../utils/waUtils';

const FloatingButtons = ({ settings }) => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleClosed, setBubbleClosed] = useState(localStorage.getItem('waBubbleClosed') === 'true');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show bubble once after 3 seconds, then stay visible (no repeating animation)
  useEffect(() => {
    if (bubbleClosed) return;

    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [bubbleClosed]);

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const waNumber = getWaNumber(settings);
  const waMessage = encodeURIComponent('Halo CS noxarianet, saya butuh bantuan.');

  const closeBubble = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBubble(false);
    setBubbleClosed(true);
    localStorage.setItem('waBubbleClosed', 'true');
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[100] flex flex-col items-end gap-3">
      {/* Back to Top — ink, 40px touch target */}
      {showTopBtn && (
        <button
          onClick={goToTop}
          aria-label="Kembali ke atas"
          className="w-10 h-10 bg-ink hover:bg-black text-white rounded-full grid place-items-center shadow-lift transition-all duration-200 hover:-translate-y-0.5 border border-white/10"
          title="Kembali ke atas"
        >
          <ArrowUp size={15} strokeWidth={2.5} />
        </button>
      )}

      {/* WhatsApp CS */}
      {isLandingPage && (
        <div className="flex items-center gap-2.5 group relative">
          {/* Chat bubble — appears once, subtle */}
          <div
            className={`transition-all duration-300 origin-bottom-right ${showBubble && !bubbleClosed
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
              } bg-white text-ink text-xs font-semibold px-3.5 py-2.5 rounded-2xl rounded-br-md shadow-lift border border-slate-200 whitespace-nowrap flex items-center gap-2`}
          >
            <span>Ada yang bisa dibantu?</span>
            <button
              onClick={closeBubble}
              aria-label="Tutup"
              className="ml-1 w-5 h-5 grid place-items-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <X size={11} />
            </button>
          </div>

          {/* CS Avatar — 48px, brand border */}
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full overflow-hidden shadow-lift transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 border-2 border-white ring-2 ring-emerald-500 flex-shrink-0 bg-white"
            title="Chat dengan Customer Service"
          >
            <img src="/logocs.png" alt="CS Support" className="w-full h-full object-cover" />
          </a>
        </div>
      )}
    </div>
  );
};

export default FloatingButtons;
