import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, X } from 'lucide-react';

const FloatingButtons = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
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

  useEffect(() => {
    if (bubbleClosed) return;

    let isMounted = true;
    const fullText = "Halo, ada yang bisa dibantu?";

    const runCycle = async () => {
      while (isMounted) {
        setShowBubble(false);
        setBubbleText('');
        await new Promise(r => setTimeout(r, 10000));
        if (!isMounted) break;

        setShowBubble(true);
        for (let i = 1; i <= fullText.length; i++) {
          if (!isMounted) break;
          setBubbleText(fullText.substring(0, i));
          await new Promise(r => setTimeout(r, 50));
        }

        if (!isMounted) break;
        await new Promise(r => setTimeout(r, 4000));
        if (!isMounted) break;

        for (let i = fullText.length; i >= 0; i--) {
          if (!isMounted) break;
          setBubbleText(fullText.substring(0, i));
          await new Promise(r => setTimeout(r, 30));
        }
      }
    };

    runCycle();
    return () => { isMounted = false; };
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-5">
      {showTopBtn && (
        <button
          onClick={goToTop}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border border-white/20"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {isLandingPage && (
        <div className="flex items-center gap-3 group relative">
          <div className={`transition-all duration-300 origin-bottom-right ${showBubble && !bubbleClosed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} bg-white text-gray-800 text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 cursor-default whitespace-nowrap flex items-center gap-2 pr-10`}>
            <span>{bubbleText}</span>
            <span className="animate-pulse font-normal">|</span>
            <button
              onClick={closeBubble}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <X size={14} />
            </button>
          </div>
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 rounded-full overflow-hidden shadow-lg transition-all hover:scale-110 hover:-translate-y-1 border-2 border-green-500 flex-shrink-0 bg-white"
          >
            <img src="/logocs.png" alt="CS Support" className="w-full h-full object-cover" />
          </a>
        </div>
      )}
    </div>
  );
};

export default FloatingButtons;
