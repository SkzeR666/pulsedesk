"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowRight,
  Sparkles,
  Layers,
  Zap,
  ShieldCheck,
  Globe,
  CircleDot,
  Clock
} from "lucide-react"
import { AppMockup } from "@/components/landing/app-mockup"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Framer Motion for the Hero App Mockup Reveal
  const { scrollYProgress } = useScroll()
  const appRotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0])
  const appScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1])
  const appY = useTransform(scrollYProgress, [0, 0.2], [100, 0])
  const appOpacity = useTransform(scrollYProgress, [0, 0.2], [0.5, 1])

  useEffect(() => {
    // Reveal animations for text inside sections
    const elements = gsap.utils.toArray(".reveal-up")
    elements.forEach((el: any) => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=10%",
            toggleActions: "play none none reverse"
          }
        }
      )
    })
  }, [])

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "vertical-landing" }),
      })
      if (response.ok) setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-black text-white min-h-screen selection:bg-primary/40 selection:text-white pb-20">

      {/* 1. Hero Section (Clean Typography) */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] -z-10 rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-8 max-w-5xl z-10 mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60 tracking-[0.4em] uppercase mb-4 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Sincronização em Tempo Real
          </div>

          <h1 className="text-5xl md:text-[6rem] font-bold tracking-tighter leading-[0.9]">
            A era do caos acabou.
          </h1>

          <p className="text-lg md:text-2xl text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
            PulseDesk é o hub para equipes que exigem velocidade absoluta. Um sistema visceral projetado para reduzir o ruído e amplificar o impacto.
          </p>

          <div className="pt-12 flex justify-center">
            <Button size="lg" className="rounded-full h-14 px-8 bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-bold tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Explorar o Sistema
            </Button>
          </div>
        </motion.div>
      </section>

      {/* App Mockup Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pb-20 perspective-[2000px] z-20">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-30 pointer-events-none" />
        <motion.div
          style={{
            rotateX: appRotateX,
            scale: appScale,
            y: appY,
            opacity: appOpacity,
            transformOrigin: "top center"
          }}
          className="w-full"
        >
          <AppMockup />
        </motion.div>
      </section>

      {/* 2. Deep Context Narrative */}
      <section className="py-20 px-6 relative mt-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="reveal-up space-y-6 flex flex-col items-center">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
              <CircleDot className="w-3 h-3 text-primary" />
              SYSTEM_OVERVIEW
            </h2>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Contexto em Alta<br />Resolução.</h2>
            <p className="text-2xl text-white/40 leading-relaxed font-medium">
              Visualize a inteligência coletiva da sua empresa de forma estruturada. Sem perder o fio da meada.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid Features styled like the Spatial Inbox */}
      <section className="py-20 px-6 max-w-7xl mx-auto mt-10">
        <div className="flex items-center justify-between mb-12 reveal-up">
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Feature Nodes
          </h2>
          <div className="h-px flex-1 mx-8 bg-white/5" />
          <div className="text-[10px] font-mono text-white/10 uppercase border border-white/5 px-4 py-1.5 rounded-full bg-white/5">4 Active Modules</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Feature */}
          <div className="reveal-up md:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl group hover:border-primary/40 transition-all shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Zap className="w-64 h-64 text-primary" />
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="border border-white/10 bg-white/5 text-[10px] text-white/40 uppercase tracking-tighter rounded-full px-3 py-1 font-mono">
                #NODE_LATENCY
              </div>
              <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/30">
                REAL-TIME
              </div>
            </div>

            <div className="relative z-10 pt-10">
              <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-primary transition-colors">Latency-Zero</h3>
              <p className="text-lg text-white/40 max-w-md">Interações sub-atômicas e sincronização perfeita. Sinta a velocidade em cada clique, sem recarregamentos.</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-white/10 border border-white/10" />
                <span className="text-xs text-white/30 font-mono uppercase tracking-tighter">Sync: Operational</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Side Feature 1 */}
          <div className="reveal-up p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-mono text-white/40 uppercase group-hover:text-accent transition-colors">NODE_ID::CONN</span>
                <div className="border border-white/5 bg-white/[0.02] text-[9px] uppercase text-white/40 px-2 py-0.5 rounded-full">ACTIVE</div>
              </div>
              <Globe className="w-10 h-10 text-white/20 group-hover:text-amber-400 transition-colors mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Conexão Total</h3>
              <p className="text-white/40">Fluxo inter-departamental com visibilidade global.</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] mt-8">
              <div className="flex -space-x-2">
                {[1, 2].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-black shadow-sm" />
                ))}
              </div>
              <div className="text-[9px] text-white/20 uppercase font-black tracking-widest group-hover:text-amber-400 transition-colors">
                OPEN SYNC →
              </div>
            </div>
          </div>

          {/* Side Feature 2 */}
          <div className="reveal-up p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-mono text-white/40 uppercase group-hover:text-emerald-400 transition-colors">NODE_ID::SEC</span>
                <div className="border border-white/5 bg-white/[0.02] text-[9px] uppercase text-white/40 px-2 py-0.5 rounded-full">ENCRYPTED</div>
              </div>
              <ShieldCheck className="w-10 h-10 text-white/20 group-hover:text-emerald-400 transition-colors mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Soberania</h3>
              <p className="text-white/40">Dados criptografados de ponta-a-ponta.</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] mt-8">
              <div className="text-[9px] text-white/20 uppercase font-black tracking-widest group-hover:text-emerald-400 transition-colors">
                VERIFY →
              </div>
            </div>
          </div>

          {/* Bottom Feature */}
          <div className="reveal-up md:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl group hover:border-white/20 transition-all shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="border border-white/10 bg-white/5 text-[10px] text-white/40 uppercase tracking-tighter rounded-full px-3 py-1 font-mono">
                #STRUCT
              </div>
            </div>

            <div className="relative z-10 flex gap-8 items-center">
              <Layers className="w-16 h-16 text-white/10 group-hover:text-white/30 transition-colors hidden sm:block" />
              <div>
                <h3 className="text-3xl font-bold mb-4 text-white">Hiper-Estrutura</h3>
                <p className="text-lg text-white/40 max-w-md">Camadas organizacionais que se adaptam à sua forma de trabalhar. Mais que um Kanban, uma tela espacial.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. CTA / Waitlist */}
      <section className="py-40 px-6 relative mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 -z-10" />
        <div className="flex items-center justify-center mb-12">
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            INITIATE_SEQUENCE
          </h2>
        </div>
        <div className="reveal-up max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-none">
            Pronto para a Transmutação?
          </h2>
          <p className="text-white/40 mx-auto font-mono text-sm uppercase tracking-widest">
            Deixe seu sinal abaixo para early-access.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto space-y-4 pt-8">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="ID_SISTEMA::SEU_EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-14 rounded-full px-6 font-mono text-sm focus-visible:ring-primary/50 flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full h-14 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-widest uppercase text-xs"
                >
                  {isSubmitting ? <Spinner className="w-4 h-4 text-black" /> : "TRANSMIT"}
                </Button>
              </div>
              <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Nodes limitados na fase beta.</p>
            </form>
          ) : (
            <div className="p-8 rounded-[2rem] bg-primary/10 border border-primary/20 text-primary mx-auto max-w-md backdrop-blur-md">
              <h3 className="text-2xl font-bold mb-2">Sinal Recebido.</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">Sync estabilizado. Aguardando liberação do portal.</p>
            </div>
          )}
        </div>
      </section>

      {/* Background Textures */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 bg-spatial pointer-events-none opacity-20 -z-20" />
    </div>
  )
}

