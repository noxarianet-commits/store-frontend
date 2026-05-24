import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Ghost, ChevronLeft, Sparkles, Cpu } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0A031A] flex flex-col items-center justify-center px-6 overflow-hidden relative selection:bg-purple-500 selection:text-white">
      {/* Static Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        {/* TV Glitch 404 Text */}
        <div className="relative mb-12 mt-8 md:mt-16 inline-block">
          {/* Main Text */}
          <motion.h1 
            className="relative text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[16rem] font-black tracking-tighter text-white leading-none z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            animate={{
               x: [0, -3, 3, -1, 0, 2, -3, 0],
               y: [0, 1, -2, 0, -1, 1, 0, 0],
               skewX: [0, -2, 2, 0, 0, 0, 0, 0]
            }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
          >
            404
          </motion.h1>

          {/* Red Glitch Offset */}
          <motion.h1 
            className="absolute top-0 left-0 text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[16rem] font-black tracking-tighter text-red-500 leading-none z-0 mix-blend-screen"
            animate={{
               x: [0, 6, -6, 4, 0, -5, 3, 0],
               opacity: [0, 0.8, 0, 0.5, 0, 1, 0, 0]
            }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2.5 }}
          >
            404
          </motion.h1>

          {/* Cyan Glitch Offset */}
          <motion.h1 
            className="absolute top-0 left-0 text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[16rem] font-black tracking-tighter text-cyan-400 leading-none z-0 mix-blend-screen"
            animate={{
               x: [0, -6, 6, -4, 0, 5, -3, 0],
               opacity: [0, 0.8, 0, 0.5, 0, 1, 0, 0]
            }}
            transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 2.7 }}
          >
            404
          </motion.h1>
          
          {/* Subtle TV Scanline overlay for the text */}
          <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_3px)] z-20 mask-image:linear-gradient(to_bottom,transparent,black,transparent)"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-4"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
            <Cpu className="text-purple-400 mb-1 md:mb-0" size={32} />
            <span className="text-center">Halaman Tidak Ditemukan</span>
          </h2>
          
          <p className="text-gray-400 max-w-lg mx-auto mb-10 text-sm md:text-base lg:text-lg leading-relaxed font-medium">
            Sepertinya URL yang Anda tuju tidak valid atau mungkin halaman tersebut sedang dalam perbaikan.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
            <Link
              to="/"
              className="flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-3.5 md:px-10 md:py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-1 shadow-[0_10px_30px_-10px_rgba(147,51,234,0.5)]"
            >
              <Home size={20} />
              <span className="uppercase tracking-wider text-sm md:text-base">Kembali ke Beranda</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-3.5 md:px-10 md:py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all hover:-translate-y-1 backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
              <span className="uppercase tracking-wider text-sm md:text-base">Kembali</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;

