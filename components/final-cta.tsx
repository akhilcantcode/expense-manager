"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FinalCTAProps {
  onEnterDemo?: () => void
}

export function FinalCTA({ onEnterDemo }: FinalCTAProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section data-ui className="py-24 px-4 bg-zinc-950">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
        >
          Ready to stop pretending you&apos;re saving?
        </h2>
        {/* <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Join the lone founder who built this to stop overspending. Free forever, no credit card required — we want your card to stay safely in your wallet.
        </p> */}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={onEnterDemo}
            size="lg"
            className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-white/20" // taste-skill-ignore
          >
            Start Saving For Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            onClick={onEnterDemo}
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-14 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent"
          >
            I Need Financial Discipline
          </Button>
        </div>

        <p className="mt-8 text-sm text-zinc-500">₹0 forever for individuals. ₹0 forever for teams because charging you would be hypocritical.</p>
      </motion.div>
    </section>
  )
}
