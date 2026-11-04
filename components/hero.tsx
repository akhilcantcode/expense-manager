"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroProps {
  onEnterDemo?: () => void
}

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=faces",
]

const textRevealVariants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: i * 0.1,
    },
  }),
}

export function Hero({ onEnterDemo }: HeroProps) {
  return (
    <section data-ui className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-black pointer-events-none" /> {/* taste-skill-ignore */}

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
          <span className="text-sm text-zinc-400">Now in Public Beta</span>
        </motion.div> */}

        {/* Headline with text mask animation */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
        >
          <span className="block overflow-hidden">
            <motion.span className="block" variants={textRevealVariants} initial="hidden" animate="visible" custom={0}>
              Spend money.
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-zinc-500"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              WISELY.
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The modern expense tracker for people who swear they will start saving next Monday.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            onClick={onEnterDemo}
            size="lg"
            className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-white/10" // taste-skill-ignore
          >
            Start Tracking Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          {/* <Button
            onClick={onEnterDemo}
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-12 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent"
          >
            View Demo
          </Button> */}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center -space-x-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces"
                alt="Founder"
                className="w-10 h-10 rounded-full border-2 border-zinc-950 object-cover"
              />
            </motion.div>
          </div>
          <p className="text-sm text-zinc-500">
            Trusted by <span className="text-zinc-200 font-semibold">ME</span> and my financial decisions
          </p>
        </motion.div>
      </div>
    </section>
  )
}
