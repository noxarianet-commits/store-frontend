import React from 'react';
import { Server } from 'lucide-react';

const ServerSelector = ({ vendor, setVendor, hasFincloud }) => {
    if (!hasFincloud) return null;

    return (
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm mb-6 relative overflow-hidden group hover:border-purple-200 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-fuchsia-500" />
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Server size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Pilih Server</h2>
                    <p className="text-sm text-slate-500">Pilih server untuk harga terbaik</p>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setVendor('sekalipay')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 border ${
                        vendor === 'sekalipay'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    Server 1
                </button>
                <button
                    onClick={() => setVendor('fincloud')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 border ${
                        vendor === 'fincloud'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    Server 2
                </button>
            </div>
        </div>
    );
};

export default ServerSelector;
