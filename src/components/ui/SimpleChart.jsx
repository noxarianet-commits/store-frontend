
import { motion } from 'framer-motion';

const SimpleChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="h-48 w-full flex items-end gap-1 sm:gap-2 pt-4">
            {data.map((item, idx) => {
                const height = (item.value / maxValue) * 100;
                return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full h-full flex items-end justify-center">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                className="w-full bg-gradient-to-t from-purple-600/40 to-purple-500 rounded-t-lg group-hover:from-purple-600/60 group-hover:to-purple-400 transition-all cursor-pointer relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20">
                                    Rp {item.value.toLocaleString('id-ID')}
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{item.date}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default SimpleChart;
