"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingProps {
  onEnterDemo?: () => void
}

const tiers = [
  {
    name: "Broke",
    price: "₹0",
    period: "forever",
    description: "For when you open your banking app with one eye closed in fear.",
    features: [
      "Log your regretful 2 AM food deliveries",
      "Instant breakdown of your questionable spending",
      "Unlimited crying over daily specialty coffee",
      "Solidarity from fellow broke individuals",
    ],
    highlight: false,
    cta: "Accept Reality",
  },
  {
    name: "Still Broke (Pro)",
    price: "₹0",
    period: "because charging you defeats the point",
    description: "All the pro telemetry, but we charge zero because we need you to save money, not spend it on an expense app.",
    features: [
      "Everything in Broke + my condolences",
    ],
    highlight: true,
    cta: "Save Your Money",
  },
  {
    name: "Enterprise Broke",
    price: "₹0",
    period: "custom imaginary billing",
    description: "For people with Fortune 500 ambitions but a student-tier bank account balance.",
    features: [
      "Everything in Still Broke + my deepest condolences",
    ],
    highlight: false,
    cta: "Stop Spending",
  },
]

export function Pricing({ onEnterDemo }: PricingProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" data-ui className="py-24 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything is ₹0. We need you to save money, not spend it.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            Charging you a recurring subscription to manage your expenses felt hypocritical.
            Keep your money in your bank account — every tier here is completely free.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
            <button
              onClick={() => setAnnual(false)}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${!annual ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white"
                }`}
            >
              Monthly: ₹0
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${annual ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white"
                }`}
            >
              <span>Annual: ₹0</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-500/10 rounded-full">
                Save 100% of ₹0
              </span>
            </button>
          </div>
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        >
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`relative p-8 rounded-2xl flex flex-col justify-between transition-colors duration-200 ${tier.highlight
                  ? "bg-zinc-900/90 border-2 border-zinc-500"
                  : "bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700"
                }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-zinc-950 text-xs font-semibold">
                  Most popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">{tier.description}</p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">/{tier.period}</span>
                </div>

                <ul className="space-y-3 pt-6 border-t border-zinc-800 mb-8"> {/* taste-skill-ignore */}
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={onEnterDemo}
                size="lg"
                variant={tier.highlight ? "default" : "outline"}
                className={`w-full rounded-xl h-12 text-sm font-medium ${tier.highlight ? "shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200" : ""
                  }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
