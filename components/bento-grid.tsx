"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Activity, Command, BarChart3, Zap, Shield } from "lucide-react"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

function SystemStatus() {
  const [dots, setDots] = useState([true, true, true, false, true])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => prev.map(() => Math.random() > 0.2))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      {dots.map((active, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-700"}`}
          animate={active ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function KeyboardCommand() {
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPressed(true)
      setTimeout(() => setPressed(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1">
      <motion.kbd
        animate={pressed ? { scale: 0.95, y: 2 } : { scale: 1, y: 0 }}
        className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono" // taste-skill-ignore
      >
        ⌘
      </motion.kbd>
      <motion.kbd
        animate={pressed ? { scale: 0.95, y: 2 } : { scale: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono" // taste-skill-ignore
      >
        K
      </motion.kbd>
    </div>
  )
}

function AnimatedChart() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const points = [
    { x: 0, y: 60 },
    { x: 20, y: 45 },
    { x: 40, y: 55 },
    { x: 60, y: 30 },
    { x: 80, y: 40 },
    { x: 100, y: 15 },
  ]

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`
  }, "")

  return (
    <svg ref={ref} viewBox="0 0 100 70" className="w-full h-24">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {isInView && (
        <>
          <path d={`${pathD} L 100 70 L 0 70 Z`} fill="url(#chartGradient)" className="opacity-50" />
          <path d={pathD} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="draw-line" />
        </>
      )}
    </svg>
  )
}

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" data-ui className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Everything you need (maybe)
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Built for people who want to save money or spend it.
          </p>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Card 1 - Large card: Not your average notion spreadsheet */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-[transform,border-color] duration-300 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
                  <Activity className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Not your average notion spreadsheet</h3>
                <p className="text-zinc-400 text-sm">
                  You spent 5 hours setting up fancy pastel toggle blocks and formula databases just to abandon it on day three. This one actually stays updated.
                </p>
              </div>
              <SystemStatus />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { metric: "Takeout", value: 92 },
                { metric: "EMIs", value: 88 },
                { metric: "Amazon Deals", value: 74 },
                { metric: "Savings", value: 2 },
              ].map(({ metric, value }) => (
                <div key={metric} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{value}%</div>
                  <div className="text-xs text-zinc-500">{metric}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Analyse Expenditure and your EMIS ofc */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-[transform,border-color] duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <BarChart3 className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Analyse Expenditure and your EMIS ofc</h3>
            <p className="text-zinc-400 text-sm mb-4">Visual clarity on how much of your hard-earned income goes straight to no-cost EMI traps.</p>
            <AnimatedChart />
          </motion.div>

          {/* Card 3: Command Palette */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-[transform,border-color] duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Command className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Buyer&apos;s remorse recorder</h3>
            <p className="text-zinc-400 text-sm mb-6">Hit ⌘K to log your expense before you convince yourself it was an essential investment.</p>
            <KeyboardCommand />
          </motion.div>

          {/* Card 4: Performance / Salary Vanishing Pace */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-[transform,border-color] duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Zap className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Salary in, salary out</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Sub-50ms query speeds. Transactions save to Neon PostgreSQL faster than your paycheck vanishes on the 1st.
            </p>
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <span className="font-mono">~32ms</span> {/* taste-skill-ignore */}
              <span className="text-zinc-500">salary vanishing pace</span>
            </div>
          </motion.div>

          {/* Card 5: Bank Details */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-[transform,border-color] duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Shield className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">We don&apos;t store your bank details</h3>
            <p className="text-zinc-400 text-sm mb-4">We wouldn&apos;t mind if you want to give it, but for legal reasons we don&apos;t store your credentials or sell them to spam telemarketers.</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs bg-zinc-800 rounded text-zinc-400">NO OTPs</span>
              <span className="px-2 py-1 text-xs bg-zinc-800 rounded text-zinc-400">NO SPAM</span>
              <span className="px-2 py-1 text-xs bg-zinc-800 rounded text-zinc-400">NO JUDGMENT</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
