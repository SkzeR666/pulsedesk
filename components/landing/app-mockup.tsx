'use client'

import { motion } from 'framer-motion'

export function AppMockup() {
    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-full aspect-video rounded-[2.5rem] bg-black/40 border border-white/10 shadow-2xl backdrop-blur-md relative perspective-[2000px]">
                {/* Backplate / Glow Source */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-[2.5rem] -z-10" />

                {/* Layer 0: The Base OS Window */}
                <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 bg-zinc-950/60 overflow-hidden backdrop-blur-2xl ring-1 ring-white/10" style={{ transformStyle: 'preserve-3d' }}>

                    {/* Header */}
                    <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-white/[0.01]">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                        </div>
                        <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase">PulseDesk // Neural Sync</div>
                        <div className="w-12 h-4 bg-white/5 rounded-full" />
                    </div>

                    <div className="p-8 h-full flex gap-8 relative" style={{ transformStyle: 'preserve-3d' }}>

                        {/* Layer 1: Floating Sidebar */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="w-20 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col items-center py-6 gap-6 shadow-2xl backdrop-blur-xl"
                            style={{ z: 40 }}
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/40 border border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" />
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10" />
                            ))}
                        </motion.div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col gap-8 relative" style={{ transformStyle: 'preserve-3d' }}>

                            {/* Layer 2: Main Data Cards */}
                            <div className="grid grid-cols-3 gap-6" style={{ transformStyle: 'preserve-3d' }}>
                                {[1, 2, 3].map((card, idx) => (
                                    <motion.div
                                        key={card}
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 5 + idx, ease: "easeInOut", delay: idx * 0.5 }}
                                        className="h-40 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-6 flex flex-col justify-end gap-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden"
                                        style={{ z: 80 + (card * 10) }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] -mr-10 -mt-10" />
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex-shrink-0" />
                                        <div className="h-3 w-2/3 bg-white/20 rounded-full" />
                                        <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Layer 3: The "Pop Out" Interactive Element */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="flex-1 rounded-[2.5rem] bg-black/60 border border-white/20 p-8 flex items-center justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl ring-1 ring-white/10 relative overflow-hidden group"
                                style={{ z: 140 }}
                            >
                                {/* Moving Glow inside the popped card */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50 blur-2xl" />

                                <div className="space-y-4 relative z-10">
                                    <div className="h-4 w-48 bg-primary/40 rounded-full" />
                                    <div className="h-8 w-64 bg-white text-black font-black flex items-center px-4 rounded-xl text-xs uppercase tracking-widest">
                                        SYSTEM ENGAGED
                                    </div>
                                    <div className="h-3 w-32 bg-white/20 rounded-full" />
                                </div>

                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="relative z-10 w-32 h-32 rounded-full border-[4px] border-primary/30 border-t-primary"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
