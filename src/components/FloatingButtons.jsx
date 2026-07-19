import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, X } from 'lucide-react';

const FloatingButtons = () => {
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

  const waNumber = '6285199605580';
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Back to Top */}
      {showTopBtn && (
        <button
          onClick={goToTop}
          className="w-9 h-9 bg-slate-800/80 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 border border-slate-700/50"
          title="Kembali ke atas"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* WhatsApp CS */}
      {isLandingPage && (
        <div className="flex items-center gap-2.5 group relative">
          {/* Chat bubble — appears once, stays static */}
          <div
            className={`transition-all duration-500 origin-bottom-right ${showBubble && !bubbleClosed
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
              } bg-white text-slate-700 text-xs font-medium px-3.5 py-2 rounded-xl rounded-br-sm shadow-lg border border-slate-100 whitespace-nowrap flex items-center gap-2`}
          >
            <span>Ada yang bisa dibantu? 👋</span>
            <button
              onClick={closeBubble}
              className="ml-1 p-0.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* CS Avatar */}
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full overflow-hidden shadow-lg transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 border-2 border-green-500 flex-shrink-0 bg-white"
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
