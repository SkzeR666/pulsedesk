'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/app-context'
import type { Request } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { CircleDot, Clock, ArrowRight, Sparkles } from 'lucide-react'

interface SpatialInboxProps {
    requests: Request[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export function SpatialInbox({ requests, selectedId, onSelect }: SpatialInboxProps) {
    const { users } = useApp()

    // Logic to separate "Neural Focus" (high priority or recent) from general flow
    const neuralFocus = requests.filter(r => r.priority === 'urgent' || r.priority === 'high').slice(0, 4)
    const asyncFlow = requests.filter(r => !neuralFocus.find(nf => nf.id === r.id))

    return (
        <div className="h-full flex flex-col space-y-12 pb-20">
            {/* Neural Focus Section */}
            <section className="flex-none">
                <div className="px-10 pb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Neural Focus
                        </h2>
                        <p className="text-sm font-bold text-white/60 font-sans">Prioridade Máxima e Sincronização em Tempo Real</p>
                    </div>
                    <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        {neuralFocus.length} Nodes Ativos
                    </div>
                </div>

                <div className="flex gap-8 px-10 pb-10 overflow-x-auto no-scrollbar mask-fade-right">
                    {neuralFocus.length > 0 ? (
                        neuralFocus.map((req, idx) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                onClick={() => onSelect(req.id)}
                                className={`w-[420px] shrink-0 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl cursor-pointer group hover:border-primary/40 transition-all shadow-2xl relative overflow-hidden ${selectedId === req.id ? 'ring-2 ring-primary/50 border-primary/50 bg-white/[0.05]' : ''
                                    }`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <CircleDot className="w-24 h-24 text-primary" />
                                </div>

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] text-white/40 uppercase tracking-tighter rounded-full px-3">
                                        #{req.id.slice(0, 8)}
                                    </Badge>
                                    <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/30">
                                        URGENTE
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors relative z-10">
                                    {req.title}
                                </h3>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-white/10" />
                                        <span className="text-xs text-white/30 font-mono uppercase tracking-tighter">Sync: Operational</span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="w-full py-12 px-10">
                            <div className="rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
                                <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Silêncio Neural: Nenhum foco urgente detectado</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Asynchronous Flow Section */}
            <section className="flex-1 px-10 relative">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Asynchronous Flow
                    </h2>
                    <div className="h-px flex-1 mx-8 bg-white/5" />
                    <div className="text-[10px] font-mono text-white/10 uppercase">{asyncFlow.length} Requests em fila</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {asyncFlow.map((req, idx) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + (idx * 0.05) }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            onClick={() => onSelect(req.id)}
                            className={`p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group ${selectedId === req.id ? 'border-primary/30 bg-white/[0.04]' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-mono text-white/40 uppercase group-hover:text-primary transition-colors">NODE_ID::{req.id.slice(0, 4)}</span>
                                <Badge variant="outline" className="border-white/5 bg-white/[0.02] text-[9px] uppercase text-white/40">{req.status}</Badge>
                            </div>
                            <h4 className="text-white font-bold mb-4 line-clamp-1 group-hover:text-white transition-colors">{req.title}</h4>
                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full bg-white/10 border border-black shadow-sm" />
                                    ))}
                                </div>
                                <div className="text-[9px] text-white/20 uppercase font-black tracking-widest group-hover:text-primary transition-colors">
                                    OPEN SYNC →
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    )
}
