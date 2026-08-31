const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[-10] bg-[#FAF9FF]">
      <style>{`
        .bg-grid {
          background-image: radial-gradient(rgba(124, 58, 237, 0.05) 1.2px, transparent 1.2px);
          background-size: 24px 24px;
        }
        .glow-sphere-1 {
          animation: floatGlow1 22s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        .glow-sphere-2 {
          animation: floatGlow2 26s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        .glow-sphere-3 {
          animation: floatGlow3 20s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        @media (max-width: 768px) {
          .glow-sphere-1, .glow-sphere-2, .glow-sphere-3 {
            opacity: 0.45 !important;
          }
          .bg-grid { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .glow-sphere-1, .glow-sphere-2, .glow-sphere-3 {
            animation: none !important;
          }
        }
      `}</style>

      {/* Grid Pattern — single source of truth (removed duplicate in index.css) */}
      <div className="absolute inset-0 bg-grid opacity-70" />

      {/* Soft Glows — toned down blur for performance, no mix-blend on mobile */}
      <div className="glow-sphere-1 absolute top-[-12%] left-[-12%] w-[56vw] h-[56vw] rounded-full bg-[#EAE2FC] blur-[90px] md:blur-[110px] md:mix-blend-multiply max-w-[720px] max-h-[720px]" />
      <div className="glow-sphere-2 absolute bottom-[-12%] right-[-12%] w-[62vw] h-[62vw] rounded-full bg-[#E5DBFF] blur-[100px] md:blur-[120px] md:mix-blend-multiply max-w-[820px] max-h-[820px]" />
      <div className="glow-sphere-3 absolute top-[32%] left-[52%] w-[42vw] h-[42vw] rounded-full bg-[#F5E6FF] blur-[80px] md:blur-[100px] md:mix-blend-multiply max-w-[560px] max-h-[560px]" />
    </div>
  );
};

export default AnimatedBackground;
