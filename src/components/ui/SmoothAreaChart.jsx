import { useState, useMemo, useEffect } from 'react';

const SmoothAreaChart = ({ data = [], period = '7d', onPeriodChange }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        // Trigger animation after mount / data change
        setAnimated(false);
        const timer = setTimeout(() => setAnimated(true), 50);
        return () => clearTimeout(timer);
    }, [data, period]);

    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const { path, areaPath, points, maxY, pathLength } = useMemo(() => {
        if (!data || data.length === 0) return { path: '', areaPath: '', points: [], maxY: 1, pathLength: 0 };
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const pts = data.map((d, i) => ({
            x: padding.left + (i / (data.length - 1 || 1)) * chartW,
            y: padding.top + chartH - (d.value / maxVal) * chartH,
            value: d.value,
            date: d.date
        }));

        if (pts.length < 2) return { path: '', areaPath: '', points: pts, maxY: maxVal, pathLength: 0 };

        // Catmull-rom to bezier
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(pts.length - 1, i + 2)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        const areaD = d + ` L ${pts[pts.length - 1].x} ${padding.top + chartH} L ${pts[0].x} ${padding.top + chartH} Z`;

        // Estimate path length for dash animation
        let len = 0;
        for (let i = 1; i < pts.length; i++) {
            const dx = pts[i].x - pts[i - 1].x;
            const dy = pts[i].y - pts[i - 1].y;
            len += Math.sqrt(dx * dx + dy * dy);
        }

        return { path: d, areaPath: areaD, points: pts, maxY: maxVal, pathLength: len * 1.3 };
    }, [data, chartW, chartH, padding.left, padding.top]);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-36 sm:h-48 md:h-52 text-gray-600">
                <p className="text-sm">Belum ada data pendapatan</p>
            </div>
        );
    }

    return (
        <div>
            {/* Period Filter */}
            <div className="flex justify-end gap-2 mb-3">
                <button
                    onClick={() => onPeriodChange?.('7d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === '7d' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    7 Hari
                </button>
                <button
                    onClick={() => onPeriodChange?.('30d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === '30d' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    1 Bulan
                </button>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 sm:h-48 md:h-52">
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + chartH * (1 - ratio);
                    return (
                        <g key={i}>
                            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" />
                            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10">
                                {maxY > 1000000 ? `${(maxY * ratio / 1000000).toFixed(1)}jt` : Math.round(maxY * ratio).toLocaleString('id-ID')}
                            </text>
                        </g>
                    );
                })}

                {/* Area fill - fade in */}
                <path
                    d={areaPath}
                    fill="url(#areaGrad)"
                    style={{
                        opacity: animated ? 1 : 0,
                        transition: 'opacity 0.8s ease-in-out'
                    }}
                />

                {/* Line - draw animation */}
                <path
                    d={path}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: pathLength,
                        strokeDashoffset: animated ? 0 : pathLength,
                        transition: 'stroke-dashoffset 1s ease-in-out'
                    }}
                />

                {/* Points - fade in after line draws */}
                {points.map((p, i) => (
                    <g key={i}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className="cursor-pointer"
                        style={{
                            opacity: animated ? 1 : 0,
                            transition: `opacity 0.4s ease-in-out ${0.6 + i * 0.05}s`
                        }}
                    >
                        <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 6 : 3} fill="#8b5cf6" stroke="#0E0E0E" strokeWidth="2" className="transition-all" />
                        <rect x={p.x - chartW / data.length / 2} y={padding.top} width={chartW / data.length} height={chartH} fill="transparent" />
                    </g>
                ))}

                {/* X labels */}
                {points.filter((_, i) => data.length <= 7 || i % Math.ceil(data.length / 7) === 0).map((p, i) => (
                    <text
                        key={i}
                        x={p.x}
                        y={height - 5}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.4)"
                        fontSize="10"
                        style={{
                            opacity: animated ? 1 : 0,
                            transition: `opacity 0.5s ease-in-out ${0.3 + i * 0.05}s`
                        }}
                    >{p.date}</text>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredIdx !== null && points[hoveredIdx] && (
                <div className="text-center -mt-2 mb-1">
                    <span className="bg-purple-600/20 text-purple-300 text-xs font-bold px-2 py-1 rounded">
                        {points[hoveredIdx].date}: Rp {(points[hoveredIdx].value || 0).toLocaleString('id-ID')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SmoothAreaChart;
