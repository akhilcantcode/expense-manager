"use client"

import { motion } from "framer-motion"

const logos = [
  { name: "PostgreSQL", mark: "PG" },
  { name: "Prisma ORM", mark: "PR" },
  { name: "Clerk Auth", mark: "CK" },
  { name: "Next.js 15", mark: "NX" },
  { name: "React 19", mark: "RC" },
  { name: "Tailwind CSS", mark: "TW" },
  { name: "TypeScript", mark: "TS" },
  { name: "Neon Serverless", mark: "NE" },
]

export function LogoMarquee() {
  return (
    <div data-ui className="py-12 bg-zinc-950/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs text-zinc-400 font-medium">
          Powered by edge-ready modern web architecture
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        <motion.div
          className="flex items-center gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            duration: 25,
          }}
        >
          {[...logos, ...logos, ...logos].map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors cursor-default"
            >
              <span className="text-[11px] font-semibold text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                {logo.mark}
              </span>
              <span className="text-sm font-semibold tracking-tight">{logo.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
