"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <footer data-ui ref={ref} className="border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          {/* Brand & Status */}
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-2">
              <span className="font-semibold text-3xl text-white tracking-tight">kharche.</span>
            </a>
            {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
              <span className="text-xs text-zinc-400">All Systems Operational (unlike my bank balance)</span>
            </div> */}
          </div>

          {/* Quote Section replacing the link columns */}
          <div className="max-w-xl text-left md:text-right">
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-200 tracking-tight leading-snug">
              &ldquo;paisa haathon ki mail hai isse bachate nhi udhate hai&rdquo;
            </blockquote>
            <p className="text-xs text-neutral-400 mt-2">
              — me :-)
            </p>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4" // taste-skill-ignore
        >
          <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Kharche, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Discord
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
