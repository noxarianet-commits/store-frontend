import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[-10] bg-[#060212]">
      <style>{`
        .bg-wave-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.35;
        }
        
        .wave-path-1, .wave-path-2, .wave-path-3, .glow-line-1, .glow-line-2 {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
          transform: translate3d(0, 0, 0);
        }

        .wave-path-1 {
          animation: waveSway1 10s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
        }

        .wave-path-2 {
          animation: waveSway2 12s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
        }

        .wave-path-3 {
          animation: waveSway3 8s ease-in-out infinite alternate, wavePulse 4s ease-in-out infinite;
          transform-origin: 50% 50%;
        }

        .glow-line-1 {
          animation: waveSway1 10s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
        }

        .glow-line-2 {
          animation: waveSway2 12s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
        }

        @keyframes waveSway1 {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          100% {
            transform: translate(1.5%, -2%) scale(1.03) rotate(0.3deg);
          }
        }

        @keyframes waveSway2 {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          100% {
            transform: translate(-1.5%, 2.5%) scale(0.99) rotate(-0.3deg);
          }
        }

        @keyframes waveSway3 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(1%, -1.5%) scale(1.01);
          }
        }

        @keyframes wavePulse {
          0%, 100% {
            opacity: 0.65;
          }
          50% {
            opacity: 0.95;
          }
        }
      `}</style>

      {/* SVG Waves Background - preserveAspectRatio="xMidYMax slice" ensures perfect proportions on all mobile and desktop devices */}
      <svg
        className="bg-wave-container"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="waveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#120224" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#3b0764" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#6b21a8" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#a855f7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#060212" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#060212" stopOpacity="0" />
            <stop offset="20%" stopColor="#2e1065" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#581c87" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#7e22ce" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#120224" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="waveGrad3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#581c87" stopOpacity="0" />
            <stop offset="35%" stopColor="#a855f7" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#c084fc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="glowLineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
            <stop offset="30%" stopColor="#d8b4fe" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#f3e8ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="glowLineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="40%" stopColor="#c084fc" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#e9d5ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="20" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Dark Purple Fill (Background Depth) */}
        <rect width="100%" height="100%" fill="#060212" />

        {/* Wave 1: Large Bottom-Up Curved Ribbon */}
        <path
          className="wave-path-1"
          d="M -100,950 Q 350,700 800,850 T 1600,600 L 1600,950 L -100,950 Z"
          fill="url(#waveGrad1)"
          filter="url(#waveGlow)"
        />

        {/* Wave 2: Intersecting Top-Right to Mid-Left Wave */}
        <path
          className="wave-path-2"
          d="M -100,500 Q 600,850 1100,600 T 1600,900 L 1600,950 L -100,950 Z"
          fill="url(#waveGrad2)"
          filter="url(#waveGlow)"
        />

        {/* Wave 3: Ambient Mid Glow Band */}
        <path
          className="wave-path-3"
          d="M -50,650 Q 720,400 1490,650"
          fill="none"
          stroke="url(#waveGrad3)"
          strokeWidth="120"
          filter="url(#waveGlow)"
          opacity="0.6"
        />

        {/* Glowing Accent Line 1 (The sharp glowing purple/white edge) */}
        <path
          className="glow-line-1"
          d="M -100,950 Q 350,700 800,850 T 1600,600"
          fill="none"
          stroke="url(#glowLineGrad1)"
          strokeWidth="4"
          filter="url(#intenseGlow)"
          opacity="0.85"
        />

        {/* Glowing Accent Line 2 (The intersecting neon wave edge) */}
        <path
          className="glow-line-2"
          d="M -100,500 Q 600,850 1100,600 T 1600,900"
          fill="none"
          stroke="url(#glowLineGrad2)"
          strokeWidth="3.5"
          filter="url(#intenseGlow)"
          opacity="0.8"
        />

        {/* Extra glowing light source / highlight dot in the center intersection */}
        <circle
          cx="780"
          cy="750"
          r="8"
          fill="#f3e8ff"
          filter="url(#intenseGlow)"
          opacity="0.7"
          className="glow-line-1"
        />
      </svg>
    </div>
  );
};

export default AnimatedBackground;
