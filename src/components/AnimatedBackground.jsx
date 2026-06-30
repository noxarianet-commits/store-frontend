import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[-10] bg-[#FAF9FF]">
      <style>{`
        .bg-grid {
          background-image: radial-gradient(rgba(124, 58, 237, 0.05) 1.2px, transparent 1.2px);
          background-size: 24px 24px;
        }
        .glow-sphere-1 {
          animation: floatGlow1 20s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        .glow-sphere-2 {
          animation: floatGlow2 25s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        .glow-sphere-3 {
          animation: floatGlow3 18s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }

        @keyframes floatGlow1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.55;
          }
          100% {
            transform: translate(8%, -6%) scale(1.15);
            opacity: 0.8;
          }
        }

        @keyframes floatGlow2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-10%, 8%) scale(1.1);
            opacity: 0.85;
          }
        }

        @keyframes floatGlow3 {
          0% {
            transform: translate(0, 0) scale(0.9);
            opacity: 0.45;
          }
          100% {
            transform: translate(6%, 6%) scale(1.05);
            opacity: 0.7;
          }
        }
      `}</style>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid opacity-80" />

      {/* Soft Glows */}
      <div className="glow-sphere-1 absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#EAE2FC] blur-[130px] mix-blend-multiply" />
      <div className="glow-sphere-2 absolute bottom-[-15%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-[#E5DBFF] blur-[150px] mix-blend-multiply" />
      <div className="glow-sphere-3 absolute top-[30%] left-[55%] w-[45vw] h-[45vw] rounded-full bg-[#F5E6FF] blur-[120px] mix-blend-multiply" />
    </div>
  );
};

export default AnimatedBackground;
