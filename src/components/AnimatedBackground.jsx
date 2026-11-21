import React from 'react';

/**
 * AnimatedBackground — Ultra-lightweight background with soft pastel glows.
 * Uses hardware-accelerated CSS radial gradients instead of heavy blur filters
 * to prevent GPU tile corruption and screen tearing on mobile devices.
 */
const AnimatedBackground = () => {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[-10] bg-[#FAF9FF]"
      style={{
        backgroundImage: `
          radial-gradient(rgba(124, 58, 237, 0.05) 1.2px, transparent 1.2px),
          radial-gradient(circle at 10% 10%, rgba(234, 226, 252, 0.7) 0%, transparent 45%),
          radial-gradient(circle at 90% 90%, rgba(229, 219, 255, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 65% 40%, rgba(245, 230, 255, 0.6) 0%, transparent 35%)
        `,
        backgroundSize: '24px 24px, 100% 100%, 100% 100%, 100% 100%',
      }}
    />
  );
};

export default AnimatedBackground;
