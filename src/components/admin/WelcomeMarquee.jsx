
const WelcomeMarquee = () => (
    <div className="mb-3 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-[#1a0a35] via-[#120825] to-[#1a0a35] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        {/* Mobile: teks statis, wrap normal */}
        <div className="sm:hidden py-3 px-4 text-center">
            <p className="text-sm font-bold text-white">
                Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">ANDIKA KHAIRUL .A</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Bekerjasama dengan PT BELANJA INDONESIA & SEKALIPAY</p>
        </div>

        {/* Desktop: marquee animation */}
        <div className="hidden sm:block py-5 overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee-slow">
                <span className="text-2xl md:text-3xl font-extrabold tracking-wide">
                    <span className="text-purple-400 mx-2 sm:mx-4">✦</span>
                    <span className="text-white mx-4">Selamat Datang,</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">ANDIKA KHAIRUL .A</span>
                    <span className="text-gray-500 mx-6">—</span>
                    <span className="text-gray-400 text-lg font-semibold">Bekerjasama dengan</span>
                    <span className="text-white mx-3 font-bold">PT BELANJA INDONESIA</span>
                    <span className="text-purple-400 mx-2">&</span>
                    <span className="text-white font-bold">SEKALIPAY</span>
                    <span className="text-purple-400 mx-4">✦</span>
                    <span className="text-gray-600 mx-8">|</span>
                    <span className="text-purple-400">✦</span>
                    <span className="text-white mx-4">Selamat Datang,</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">ANDIKA KHAIRUL .A</span>
                    <span className="text-gray-500 mx-6">—</span>
                    <span className="text-gray-400 text-lg font-semibold">Bekerjasama dengan</span>
                    <span className="text-white mx-3 font-bold">PT BELANJA INDONESIA</span>
                    <span className="text-purple-400 mx-2">&</span>
                    <span className="text-white font-bold">SEKALIPAY</span>
                    <span className="text-purple-400 mx-4">✦</span>
                </span>
            </div>
        </div>
    </div>
);

export default WelcomeMarquee;
